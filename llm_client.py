import os
import base64
from typing import List
import fitz  # PyMuPDF
from openai import OpenAI

class PaperReaderBot:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("SILICONFLOW_API_KEY")
        if not self.api_key:
            raise ValueError("未找到 API Key，请配置环境变量 SILICONFLOW_API_KEY 或传入 key。")
        
        # 使用 OpenAi 兼容接口调用硅基流动
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.siliconflow.cn/v1"
        )
        self.model_name = "Qwen/Qwen3-VL-235B-A22B-Thinking"

    def process_paper(self, file_path: str, prompts: List[str]) -> str:
        try:
            print(f"正在读取并渲染 PDF: {file_path} ...")
            doc = fitz.open(file_path)
            base64_images = []
            
            # 创建临时静态文件夹供前端拉取背景图
            static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_images")
            os.makedirs(static_dir, exist_ok=True)
            
            for i, page in enumerate(doc):
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_data = pix.tobytes("jpeg")
                b64_str = base64.b64encode(img_data).decode('utf-8')
                base64_images.append(b64_str)
                # 保存到本地供前端使用：http://localhost:8000/api/images/page_x.jpg
                with open(os.path.join(static_dir, f"page_{i}.jpg"), "wb") as f:
                    f.write(img_data)
                
            print(f"PDF 渲染完成，共转换 {len(base64_images)} 页，已保存至 temp_images。")

            # 我们不再循环应用多个prompt，而是使用我们新写的、囊括整套结构的单一 Galgame JSON Prompt
            prompt = prompts[0]
            
            # 整合消息内容
            content = []
            for j, b64 in enumerate(base64_images):
                content.append({"type": "text", "text": f"--- 以下是论文的第 {j} 页 ---"})
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{b64}",
                        "detail": "high"
                    }
                })
            
            # 最后附加指令
            content.append({"type": "text", "text": prompt})
            
            messages = [{"role": "user", "content": content}]
            
            print("正在等待 Qwen3-VL 思考并生成整个Galgame JSON剧情 (可能需1-2分钟)...")
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={"type": "json_object"}
            )
            
            ai_message = response.choices[0].message.content
            print("=> 成功生成 Galgame 剧本 JSON！")
            
            return ai_message
            
        except Exception as e:
            raise RuntimeError(f"在处理论文时发生错误: {str(e)}")
        finally:
            if 'doc' in locals():
                try:
                    doc.close()
                except:
                    pass
