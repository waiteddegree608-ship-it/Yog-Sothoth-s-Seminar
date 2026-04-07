# 犹格索托斯的组会 📚➡️🎮 (Yog-Sothoth's Seminar)

> **“当你凝视深渊，深渊也会回望你……连这种简单的神经网络都不懂吗？没关系，红龙女王会手把手教你的哦~”**

**犹格索托斯的组会 (Yog-Sothoth's Seminar)** 是一个全自动的论文阅读与可视化汇报工作流。它能够将枯燥的 PDF 格式学术论文，彻底转化并演绎为一场由《犹格索托斯的庭院》人气角色——“红龙女王”耶芙娜（Yevna）主导的沉浸式 **视觉小说 (Visual Novel)** 汇报！

借助多模态大模型与智能 PDF 视觉切片算法，你现在可以一边享受红龙女王傲娇温柔的讲课，一边看她随着剧情智能切换表情，并配合台词自动在屏幕上浮现对应的高清论文图表。

---

## ✨ 核心特性 / Features

- 🧠 **双通道 AI 解析引擎 (Dual-Stage LLM Pipeline)：**
  - **Stage 1 (文字萃取)**：调用底层大模型进行严谨的 PDF 文献深度总结与 Markdown 结构提取。
  - **Stage 2 (灵魂提炼)**：采用 **Qwen3-VL-235B** (通过 SiliconFlow) 进行深度角色扮演，注入“傲娇”、“占有欲”等细致入微的性格特征与差分表情标签，输出带有大量互动的 Galgame 剧情（30~50句以上）。
- 🖼️ **启发式智能切图 (Smart Layout Extraction)：**
  - 不再是简单粗暴的截屏！内置基于 PyMuPDF (fitz) 的排版识别引擎，能够深入复杂双栏双向 PDF 的上下文，精准切出 300 DPI 无损高清的架构图、图表，并与剧本解说无痕同步绑定。
- 🎭 **全动态 UI 交互视效 (Immersive UI Display)：**
  - 使用 React 引擎重构的精致播放器。
  - 支持毛玻璃卡片、呼吸光感效果和极具“庭院”高级质感的暗夜风格。
  - 角色具备喜、怒（冒井号）、害羞、得意等多重自动表情（自动匹配）。
  - **画中画支持**：当剧本讲到“你看这套架构的精妙之处”时，游戏界面会自动变暗并为您全屏悬浮对应的 `Figure X` 论文原图。

---

## 🛠️ 安装环境 / Installation

本项目分为 **Python 后端 (FastAPI + AI 引擎)** 与 **React 前端 (视效呈现)**。

### 1. 后端依赖
确保你已经安装了 Python 3.10+。
```bash
# 建议新建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows 下使用 venv\Scripts\activate

# 安装解析与大模型依赖
pip install fastapi uvicorn PyMuPDF openai python-dotenv google-genai
```

### 2. 前端依赖
确保你已经安装了 Node.js。
```bash
cd paper2galgame-main
npm install
```

---

## 🚀 快速启动 / Quick Start

### 1. 配置 API Keys
在根目录下创建一个 `.env` 文件，放置你的 AI 接口密钥（如果在 `main.py` 和 `llm_client.py` 中写死了 fallback key 则可跳过）：
```env
GEMINI_API_KEY="your_gemini_key_here"           # 用于第一阶段文本结构提取
SILICONFLOW_API_KEY="your_siliconflow_key_here" # 用于第二阶段剧本生成与扮演
```

### 2. 挂载资源
确保你已经拥有耶芙娜的相关立绘资源，将角色差分图按照规则命名并放置在 `assets/` 目录下（例如：`yevna_normal.png`, `yevna_shy.png`，以及首页背景图 `title_bg.png` 等）。

### 3. 一键启动
**启动后端解析服务器**：
```bash
python main.py
# 服务将挂载在 http://localhost:8000
```
**启动前端游戏引擎**：
```bash
cd paper2galgame-main
npm run dev
# 浏览器访问 http://localhost:3000
```

---

## 🖥️ 交互流程示范

1. 在主界面点击 **[发送给耶芙娜]**。
2. 在充满“庭院魔法感”的上传弹窗内，选择你要学习的 `.pdf` 本地文件。然后选择相应的论文类型（如：`计算机+人工智能`）。
3. 后台进入 **“耶芙娜阅读中...”** 的流程，她会开始施展炼金术，剖析框架、阅读消融实验，并撰写几千字的剧本。
4. 解析完毕后弹窗提示，点击 **[开始组会]**，在档案室里选中你的文献。
5. 尽情享受全语音全动态的沉浸式学术洗礼吧！

---

## 📝 提示词拓展指南

您可以随时在后端的 `prompts.py` 中为您喜欢的其他游戏角色定制人设。只需要覆盖 `PAPER_PROMPT_TEMPLATES` 块，为角色定义她专属的“口癖”、特定对您的“称谓”，甚至是独有的六种核心 Emotion Mapping 选项即可瞬间无缝换皮！

---

## 📄 许可 / License
MIT License.  
_“此项目仅为将枯燥的读论文过程转换为乐趣而作，感谢一切伟大的开源模型与美好的游戏角色。”_
