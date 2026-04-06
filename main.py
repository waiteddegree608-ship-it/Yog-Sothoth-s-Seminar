import os
import tempfile
import uvicorn
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from prompts import get_prompts_for_type, PAPER_PROMPT_TEMPLATES
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

@app.get("/api/paper_types")
async def get_paper_types():
    return {
        "status": "success",
        "data": list(PAPER_PROMPT_TEMPLATES.keys())
    }

from project_manager import ProjectManager

@app.post("/api/analyze_paper_galgame")
async def analyze_paper_galgame(
    file: UploadFile = File(..., description="上传的论文 PDF 文件"),
    paper_type: str = Form(..., description="论文类型（决定了提示词的种类）"),
    api_key: str = Form(None, description="可选: 用户自定义的 API Key")
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
            
        proj_name = os.path.splitext(file.filename)[0]
        
        pm = ProjectManager(base_dir=projects_dir)
        proj_dir = pm.create_project(proj_name)
        
        # Extract Figures
        pm.extract_semantic_figures(tmp_path, proj_dir)
        
        # Run Bot (fallback to hardcoded key if env/param is blank)
        fallback_key = "sk-ajdceczxqkrmqnbepesbgkbhgfogujclmrrjzqqmkpegyabo"
        actual_key = api_key if api_key else fallback_key
        
        from llm_client import PaperReaderBot
        bot = PaperReaderBot(api_key=actual_key)
        
        roleplay_prompts = get_prompts_for_type(paper_type)
        if not roleplay_prompts:
            raise Exception("不支持的论文类型")
            
        ai_json = bot.process_paper(tmp_path, roleplay_prompts)
        
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
            except json.JSONDecodeError as de:
                # Fallback empty script
                parsed = {"title": proj_name, "script": [{"speaker": "耶芙娜", "text": "不好意思老板，刚才思考的时候不小心走神了，解析剧本失败了呢。", "emotion": "shy"}]}
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
                    except:
                        title = proj_folder
                        
                    # Check if Figure 1 exists
                    fig1_url = f"http://localhost:8000/api/projects/{proj_folder}/images/Figure_1.png"
                    
                    projects.append({
                        "id": proj_folder,
                        "title": title,
                        "cover": fig1_url
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
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("正在启动论文阅读后端...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
