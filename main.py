import os
import tempfile
import uvicorn
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from prompts import get_stage1_prompt, get_stage2_prompt
from llm_client import PaperReaderBot

app = FastAPI(title="智能论文阅读后端API", description="通过Qwen3-VL大模型提取多项论文信息的后端服务")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载项目目录供前端访问图片背景
projects_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "projects")
os.makedirs(projects_dir, exist_ok=True)
app.mount("/api/projects", StaticFiles(directory=projects_dir), name="projects")

# 挂载全局素材库供前端访问立绘和通用背景
assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(assets_dir, exist_ok=True)
app.mount("/api/assets", StaticFiles(directory=assets_dir), name="assets")

# 挂载角色目录
characters_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "characters")
os.makedirs(characters_dir, exist_ok=True)
app.mount("/api/characters", StaticFiles(directory=characters_dir), name="characters")

@app.get("/api/characters_list")
async def get_characters_list():
    characters = []
    if os.path.exists(characters_dir):
        for char_id in os.listdir(characters_dir):
            if os.path.isdir(os.path.join(characters_dir, char_id)):
                config_path = os.path.join(characters_dir, char_id, "config.json")
                if os.path.exists(config_path):
                    try:
                        with open(config_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            characters.append(data)
                    except:
                        pass
    return {"status": "success", "data": characters}

from pydantic import BaseModel

class ConfigUpdateReq(BaseModel):
    prompt: str

@app.post("/api/characters/{char_id}/config")
async def update_character_config(char_id: str, req: ConfigUpdateReq):
    config_path = os.path.join(characters_dir, char_id, "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["prompt"] = req.prompt
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Character not found")

@app.get("/api/paper_types")
async def get_paper_types():
    return {
        "status": "success",
        "data": ["计算机+人工智能", "医学", "物理", "文学"]
    }

from project_manager import ProjectManager

@app.post("/api/analyze_paper_galgame")
async def analyze_paper_galgame(
    file: UploadFile = File(..., description="上传的论文 PDF 文件"),
    paper_type: str = Form(..., description="论文类型（决定了提示词的种类）"),
    api_key: str = Form(None, description="可选: 用户自定义的 API Key"),
    base_url: str = Form(None, description="可选: 用户自定义的 API URL"),
    model_name: str = Form(None, description="可选: 用户自定义的模型"),
    char_id: str = Form("yevna", description="可选: 扮演的角色ID"),
    outfit: str = Form("常服", description="可选: 角色的衣服换装")
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
            
        proj_name = os.path.splitext(file.filename)[0]
        
        pm = ProjectManager(base_dir=projects_dir)
        proj_dir = pm.create_project(proj_name)
        
        # Save the original PDF so real-time chat can access it
        import shutil
        pdf_storage_path = os.path.join(proj_dir, "paper.pdf")
        shutil.copy(tmp_path, pdf_storage_path)

        # Extract Figures
        pm.extract_semantic_figures(tmp_path, proj_dir)
        
        fallback_key = os.environ.get("SILICONFLOW_API_KEY", "")
        actual_key = api_key if api_key else fallback_key
        
        from llm_client import PaperReaderBot
        from prompts import get_stage1_prompt, get_stage2_prompt
        bot = PaperReaderBot(api_key=actual_key, base_url=base_url, model_name=model_name)
        
        s1_prompt = get_stage1_prompt()
        def builder(md_report):
            return get_stage2_prompt(char_id, md_report)
            
        md_report, ai_json = bot.process_paper_two_stage(tmp_path, s1_prompt, builder)
        
        # Save Markdown Report exclusively into the project folder
        # To make it easy to identify, we keep the naming convention 输出结果_{proj_name}.md
        md_file_path = os.path.join(proj_dir, f"输出结果_{proj_name}.md")
        with open(md_file_path, "w", encoding="utf-8") as f:
            f.write(md_report)
        
        # Extract JSON using regex to bypass any conversational filler from the AI
        import re
        ai_json_clean = ai_json.replace("```json", "").replace("```", "").strip()
        json_match = re.search(r'\{.*\}', ai_json_clean, re.DOTALL)
        if json_match:
            ai_json_clean = json_match.group(0)
            
        script_path = os.path.join(proj_dir, "script.json")
        with open(script_path, "w", encoding="utf-8") as f:
            try:
                parsed = json.loads(ai_json_clean)
                parsed["char_id"] = char_id
                parsed["outfit"] = outfit
            except json.JSONDecodeError as de:
                # Fallback empty script
                parsed = {"title": proj_name, "char_id": char_id, "outfit": outfit, "script": [{"speaker": "未知角色", "text": "不好意思老板，刚才思考的时候不小心走神了，解析剧本失败了呢。", "emotion": "shy"}]}
                print(f"Error parsing JSON: {de}")
                
            json.dump(parsed, f, ensure_ascii=False, indent=2)
            
        try:
            os.remove(tmp_path)
        except Exception as e:
            print(f"Warning: Could not remove temporary file {tmp_path}: {e}")
            
        return {"status": "success", "project_id": proj_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects_list")
async def get_projects_list():
    projects = []
    if os.path.exists(projects_dir):
        for proj_folder in os.listdir(projects_dir):
            if os.path.isdir(os.path.join(projects_dir, proj_folder)):
                script_path = os.path.join(projects_dir, proj_folder, "script.json")
                if os.path.exists(script_path):
                    # Try to extract title
                    try:
                        with open(script_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            title = data.get("title", proj_folder)
                            char_id = data.get("char_id", "yevna")
                    except:
                        title = proj_folder
                        char_id = "yevna"
                        
                    # Check if Figure 1 exists
                    fig1_url = f"http://localhost:8000/api/projects/{proj_folder}/images/Figure_1.png"
                    
                    projects.append({
                        "id": proj_folder,
                        "title": title,
                        "cover": fig1_url,
                        "char_id": char_id
                    })
    return {"status": "success", "data": projects}

@app.post("/api/play_project/{project_name}")
async def play_project(project_name: str):
    # 根据项目名读取剧本
    # 为了防止路径遍历攻击，稍微做点安全过滤
    safe_name = "".join([c for c in project_name if c.isalnum() or c in (' ', '-', '_')]).rstrip()
    json_path = os.path.join(projects_dir, safe_name, "script.json")
    
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="找不到该项目的剧本文件")
        
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            data["project_id"] = safe_name
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class ChatRequest(BaseModel):
    project_id: str
    char_id: str
    message: str
    history: list = []
    api_key: str = None
    base_url: str = None
    model_name: str = None

@app.post("/api/chat")
async def chat_api(req: ChatRequest):
    try:
        # Load academic report
        report_path = os.path.join(projects_dir, req.project_id, f"输出结果_{req.project_id}.md")
        md_report = ""
        if os.path.exists(report_path):
            with open(report_path, "r", encoding="utf-8") as f:
                md_report = f.read()

        from prompts import get_chat_prompt
        sys_prompt = get_chat_prompt(req.char_id, md_report)

        from llm_client import PaperReaderBot
        actual_key = req.api_key if req.api_key else os.environ.get("SILICONFLOW_API_KEY", "")
        bot = PaperReaderBot(api_key=actual_key, base_url=req.base_url, model_name=req.model_name)
        
        pdf_path = os.path.join(projects_dir, req.project_id, "paper.pdf")
        
        reply = bot.chat_with_character(sys_prompt, req.history, req.message, pdf_path)
        return {"status": "success", "data": reply}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("正在启动论文阅读后端...")
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
