# Yog-Sothoth's Seminar: 犹格索托斯的组会

![示例图](0cf238d38644ef6887863f88ff0d82cd.png)
## 1. 项目概述 (Project Overview)

和员工一起开组会！耶耶龙带你读论文www

---

## 2. 核心特性 (Key Features)

把要阅读的pdf发给你想发送的员工，然后她就会开始阅读，在project文件夹中，会有一个严肃处理不含员工个性的知识库和一个有着员工语言特色的galgame剧本
*目前只写了耶耶龙的提示词，其他角色欢迎投稿补充，Q：2993792632*

---

## 3. 技术栈 (Tech Stack)

此版本为前后端分离架构，进行了重度底层解耦：

**【前端层 Frontend】**
*   **核心框架**: [React 19](https://react.dev/) - 配合 React Hooks 构建，无需繁琐 Webpack，原生轻量化挂载。
*   **样式体系**: [Tailwind CSS](https://tailwindcss.com/) 
*   **数据流枢纽**: 原生 `fetch` + `localStorage`

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

### 第一步：安装依赖
确保您安装了 Python 3+。
1. 在项目根目录（`/`）打开终端。
2. 安装依赖：`pip install -r requirements.txt` (核心含 `fastapi`, `uvicorn`, `pymupdf`, `openai` 等)。

### 第二步：运行程序
1. 双击run.bat
2. 使用浏览器打开
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://172.29.0.1:3000/
  ➜  Network: http://192.168.1.2:3000/
---

## 6. 使用与配置指南 (User Guide)

1. **设置 API 秘钥与模型**：
   打开网站后，第一步务必点击主界面中央右侧的 **[系统设置]**。填入您在平台(如硅基流动)申请的 API-Key。此界面还可以点击不同的角色头像改写 `Prompt`。点击“应用配置”后即时生效生效。
2. **论文装载与档案建立**：
   点击主干道上的 **[上传论文]**，选择您的 PDF 学术文件并点击“发送”。这一过程模型通常需要几分钟来推断结构和编写剧本，这段时间请耐心等待。
3. **享受剧情与实时 QA**：
   在剧情中点击右键或使用菜单，可以呼出底层终端与员工直接关于论文内容进行激烈对线，她会同时为您展示当时解析出来的原文图像辅助理解。

---


> *“耶耶龙可爱捏www”*
