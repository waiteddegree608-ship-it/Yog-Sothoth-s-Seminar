import { PaperAnalysisResponse, DialogueLine, GameSettings, ProjectInfo } from "../types";

export const getProjectsList = async (): Promise<ProjectInfo[]> => {
  try {
    const response = await fetch("http://localhost:8001/api/projects_list");
    if (!response.ok) throw new Error("Network error fetching projects");
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching project list:", error);
    return [];
  }
};

export const playProject = async (projectId: string): Promise<PaperAnalysisResponse> => {
  try {
    const response = await fetch(`http://localhost:8001/api/play_project/${projectId}`, {
      method: "POST"
    });
    if (!response.ok) throw new Error("Failed to load script");
    const json = await response.json();
    return json.data as PaperAnalysisResponse;
  } catch (error) {
    console.error("Error playing project:", error);
    return {
      title: "加载失败",
      script: [
        {
          speaker: "丛雨",
          text: "呜... 主殿，试图读取名为：" + projectId + " 的记忆数据时发生了错误！",
          emotion: "shy"
        }
      ]
    };
  }
};

// Keep for backwards compatibility if needed
export const analyzePaper = async (file: File, settings: GameSettings): Promise<PaperAnalysisResponse> => {
    return playProject("FashionTex");
};

export const llmService = {
  getProjectsList,
  playProject,
  analyzePaper,
  analyzePaperGalgame: async (file: File, paperType: string, apiKey: string, char_id?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("paper_type", paperType);
    
    // Dynamically inject configuration keys from localStorage
    const finalKey = apiKey || localStorage.getItem('apiKey') || "";
    if (finalKey) formData.append("api_key", finalKey);
    
    const baseUrl = localStorage.getItem('apiUrl');
    if (baseUrl) formData.append("base_url", baseUrl);
    
    const modelName = localStorage.getItem('modelName');
    if (modelName) formData.append("model_name", modelName);

    if (char_id) formData.append("char_id", char_id);

    const response = await fetch("http://localhost:8001/api/analyze_paper_galgame", {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      throw new Error("Upload failed: " + response.statusText);
    }
    
    return await response.json();
  }
};