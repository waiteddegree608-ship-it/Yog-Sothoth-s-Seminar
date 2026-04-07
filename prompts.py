import os
import json
from typing import Dict, List

def get_character_config(char_id: str) -> dict:
    char_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "characters", char_id)
    config_path = os.path.join(char_dir, "config.json")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def get_stage1_prompt() -> str:
    prompt_file = os.path.join(os.path.dirname(__file__), "提示词汇总.md")
    p1 = "未找到提示词"
    if os.path.exists(prompt_file):
        with open(prompt_file, "r", encoding="utf-8") as f:
            p1 = f.read()

    return f"""请仔细阅读提供的PDF所有页面内容，并直接按照以下需求汇总要求，为这篇论文生成一份深度的学术解析报告（使用Markdown格式）。

【需求汇总（来自提示词汇总.md）】：
{p1}

请直接输出高质量的 Markdown 格式学术报告，尽可能详细严谨，分析深入，内容充实。"""


def get_stage2_prompt(char_id: str, md_report: str) -> str:
    char_config = get_character_config(char_id)
    char_name = char_config.get("name", "未知角色")
    char_prompt = char_config.get("prompt", "")
    emotions = ", ".join(char_config.get("emotions", ["normal"]))

    seq_file = os.path.join(os.path.dirname(__file__), "论文汇报顺序.md")
    p_seq = "按照正常学术演讲顺序"
    if os.path.exists(seq_file):
        with open(seq_file, "r", encoding="utf-8") as f:
            p_seq = f.read()

    prompt_base = f"""你现在是Visual Novel游戏中的角色“{char_name}”。

这里有一份我已经用极高深度整理好的学术报告全文：
=== 学术报告开始 ===
{md_report}
=== 学术报告结束 ===

任务：请你阅读上述这份报告的内容（并结合PDF原图视觉辅助），以Visual Novel对话的形式向主人公（由玩家扮演）详尽地讲解这篇论文。
输出格式：必须必须强制返回合法的 JSON 格式。

请严苛遵照以下【论文汇报顺序（规则）】进行超级深度的剧本生成（必须严格按照顺序讲完故事，每个模块请多水几句对话写出极长极详细的故事线）：
{p_seq}

【你的性格和人设约束】：
{char_prompt}

【输出格式约束】
你必须返回合法的 JSON 格式。返回的 `script` 数组必须要【极其漫长详细】，这将会转化为游戏内的纯文本文字框！
！！！极度危险警告！！！：
1. `text` 字段必须是 **100%纯净的人物讲话语言**。
2. 绝对禁止在 `text` 里面写任何动作描述、神态描写（比如 "*优雅地展开龙翼*"、"（推了推眼镜）" 之类的客观描述语句）。
3. 任何神态或动作的情感传达必须且完全只能通过 `emotion` 字段来表达！
结构如下：
{{
  "title": "（起个这篇文献的相关标题）",
  "script": [
    {{
      "speaker": "{char_name}",
      "text": "（讲话的一句文本，必须符合人设和该阶段的汇报规律）",
      "emotion": "{char_config.get('emotions', ['normal'])[0]}",
      "note": "（可选的侧边学术词汇小贴士解释）"
    }},
    {{
      "speaker": "{char_name}",
      "text": "大家看这块实验消融数据的架构图...",
      "emotion": "{char_config.get('emotions', ['normal'])[0] if len(char_config.get('emotions', ['normal'])) < 2 else char_config.get('emotions', ['normal'])[1]}",
      "display_figure": 2
    }}
  ]
}}
注意：emotion 必须是 {emotions} 中的一个。display_figure是可选的整数数字，不需要显示图的时候不要加这个字段。只允许返回合法的JSON！
"""
    return prompt_base

def get_chat_prompt(char_id: str, md_report: str) -> str:
    char_config = get_character_config(char_id)
    char_name = char_config.get("name", "未知角色")
    char_prompt = char_config.get("prompt", "")
    emotions = ", ".join(char_config.get("emotions", ["normal"]))

    sys_prompt = f"""你现在是Visual Novel游戏中的角色“{char_name}”。

在此前，你已经基于下面这份学术报告向我进行了汇报：
=== 学术报告 ===
{md_report[:2500]} ... (由于长度限制截断)
=== 学术报告结束 ===

你的性格和人设约束：
{char_prompt}

【任务约束】：
1. 玩家正在针对这篇论文（或自由聊天）向你提问，你需要以角色的口吻回复玩家。可以自由审视上传的论文全图内容。
2. 你必须返回合法的 JSON 格式，结构如下：
{{
  "text": "（你的回答内容，绝对纯净无动作描写的口语，不要带有*动作*）",
  "emotion": "（从 {emotions} 中任选一个符合当前语境的表情）",
  "display_figure": 2 // 如果你在回话中明确讲解到这篇论文中具体的某张图（Figure），且希望后台把这张图投屏放到背景白板上，请填入该图片的**纯数字编号**（比如 2）。如果不涉及讲具体的图，只需省略该字段或设为null。
}}
3. 严禁你的 text 中出现类似“*笑着说*”、“（摸摸头）”这样的动作或神态描写，全部交由 emotion 字段传达！
"""
    return sys_prompt

