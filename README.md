# Yog-Sothoth's Seminar: AI 学术剧本引擎 (Paper2Galgame)

## 1. 项目概述 (Project Overview)

**Yog-Sothoth's Seminar (2026 Red Dragon Edition)** 是一个突破性的多模态 AI 驱动应用。它致力于彻底改变阅读学术论文的方式——将通常枯燥难懂的学术文献（PDF），通过视觉大语言模型（VLM）一键转化为沉浸感极强的 **Galgame（视觉小说）与实时互动课堂**。

本项目不仅仅是一个文本解析器，而是一个**自带暗黑系UI、动态立绘反馈、学术实时探讨以及全托管知识库**的现代化复合引擎。目前的底层视觉模型接入了 Qwen3-VL 系列，具备极强的图表多模态分析能力。

---

## 2. 核心特性 (Key Features)

- 📜 **多模态精准图文解析**: 接入 Qwen3-VL 大模型，无缝剥离论文中的文字、图表与公式，结合两段式提示词（Stage 1 分析 & Stage 2 剧本化）直接生成结构化的演绎剧本。
- 🎨 **浸入式暗黑美学 UI**: 前端采用极具质感的深色系档案馆主题（Tailwind CSS）。支持“3D破窗”立绘彩蛋、全局绝对定位锁扣，在各分辨率下保持完美的 UI 构图。
- 💬 **学术级实时交互防干扰 (Live Chat)**: 游戏行进中途若是卡壳，可直接调出实时聊天面板与当前主讲（如耶芙娜）讨论论文公式细节。此时底层自动推进（Auto）系统会被**直接硬锁止**，保证您的学术对话不会被意外打断。
- 👩‍🏫 **自定义四系女主阵列**: 原生内置 4 位女主角（红龙女王耶芙娜、夏露翎、小叶子、特莉波卡）。包含换装系统（如：常服、礼服等），可一键在主页调整角色并在档案室同步更新形象。
- ⚙️ **无痛全球化 API 连通**: 前端自带华丽的**系统全局设置面板**，随时可将 API Key、模型 URL、大模型参数项持久化输入至终端，一键直达，告别繁琐的环境变量配置。

---

## 3. 技术栈 (Tech Stack)

此版本为前后端分离架构，进行了重度底层解耦：

**【前端层 Frontend】**
*   **核心框架**: [React 19](https://react.dev/) - 配合 React Hooks 构建，无需繁琐 Webpack，原生轻量化挂载。
*   **样式体系**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 缔造的绝对响应式布局与极简暗黑毛玻璃特效（backdrop-blur）。
*   **数据流枢纽**: 原生 `fetch` + `localStorage`，高效处理组件与后端 Python 的状态共振。

**【后端层 Backend】**
*   **核心框架**: [FastAPI](https://fastapi.tiangolo.com/) - 高性能 Python 异步接口，提供极速挂载静态资源 (`/api/projects`等) 及挂靠大模型的桥梁。
*   **PDF 解析引擎**: PyMuPDF (`fitz`) - 精确无损裁切学术论文，提取内联高分辨率结构图片。
*   **VLM 模型连通**: OpenAI-Compatible SDK - 默认对接 SiliconFlow(硅基流动) + Qwen3-VL-235B。

---

## 4. 体系架构说明 (Project Structure)

```text
/ (Root Directory)
├── main.py                     # FastAPI 后端核心：路由控制，资源挂载，解析流程中心
├── llm_client.py               # 大模型底层通信协议封装，动态传入 API 参数
├── project_manager.py          # PDF 项目切割器，用于提取图表并划归工程目录
├── characters/                 # 女主角系统数据库
│   └── yevna/                  
│       └── config.json         # 包括提示词、衣服列表、情绪字典等性格核心参数
├── projects/                   # 文献归档库。一切上传的 PDF 都会在这里以文件夹形式结构化落盘
└── paper2galgame-main/         # （前端）学术引擎客户端
    ├── index.html              # Tailwind 挂载与游戏全局基础画布
    ├── components/
    │   ├── TitleScreen.tsx     # 登录面板界面的暗黑美学及主角选用器
    │   ├── UploadScreen.tsx    # 文献档案馆 (具备 3D Pop-out 彩蛋交互)
    │   ├── SettingsScreen.tsx  # API 节点配置与 角色提示词(Prompt) 直写修改面板
    │   └── GameScreen.tsx      # 核心剧本演绎器 & 交互式实时学术探讨
```

---

## 5. 快速启动与部署 (Getting Started)

### 第一步：启动后端灵魂 (Backend Server)
确保您安装了 Python 3+。
1. 在项目根目录（`/`）打开终端。
2. 安装依赖：`pip install -r requirements.txt` (核心含 `fastapi`, `uvicorn`, `pymupdf`, `openai` 等)。
3. 运行服务：
   ```bash
   python main.py
   ```
后端服务默认将在 `http://localhost:8001` 上运行并开始收发信令。

### 第二步：苏醒前端视觉引擎 (Frontend Client)
1. 进入前端目录 `cd paper2galgame-main`。
2. 由于前端通过 ES Modules 引入 React 等底座库，您只需启动一个简单的本地静态文件服务器（请**不要**直接双击 index.html 以避免跨域）：
   ```bash
   python -m http.server 8000
   ```
3. 打开浏览器访问 `http://localhost:8000` 即可开始您的学术探讨。

---

## 6. 使用与配置指南 (User Guide)

1. **设置 API 秘钥与模型**：
   打开网站后，第一步务必点击主界面中央右侧的 **[系统设置]**。填入您在平台(如硅基流动)申请的 API-Key。此界面还可以点击不同的妹子头像，为您钟爱的指导老师改写其隐藏深层的 `Prompt`。点击“应用配置”后即时生效生效。
2. **论文装载与档案建立**：
   点击主干道上的 **[上传论文]**，选择您的 PDF 学术文件并点击“发送”。这一过程模型通常需要 10-20 秒来推断结构和编写剧本，这段时间请耐心等待。
3. **享受剧情与实时 QA**：
   在剧情中点击右键或使用菜单，可以呼出底层终端与当前指导您的“老师”直接关于论文公式进行激烈对线，她会同时为您展示当时解析出来的原文图像辅助理解。

---

## 7. 重要维护说明及防坑避南 (Maintenance Notes)

*   **实时保存覆盖**：前端系统设置面板只要按下“保存”，就会跨层向 Python 后端发送协议，物理重写修改 `characters/xxx/config.json` 里的 prompt 信息！如果在后台修改后发现没生效，只需重启一下 Python 进程即可。
*   **端口占用避雷**：前端假定后端的通信地址绝对为 `http://localhost:8001`。请不要在 FastAPI 或终端命令中将后端指派到别的断口，否则客户端会瞬间失联！
*   **隐私宣告**：本系统默认通过前端将您的 Key 动态注入请求，如果打算将此项目发布为公共公网服务，请记得在 `main.py` 重写剥离该透传逻辑以保障您的 Key 资产不被嗅探偷窃。

> *“科研本是一条铺满荆棘的孤独之旅，但在这里，你成为了这个世界的主角。”*
