import os
import json
from openai import OpenAI

def generate_script_from_md():
    api_key = "sk-ajdceczxqkrmqnbepesbgkbhgfogujclmrrjzqqmkpegyabo"
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.siliconflow.cn/v1"
    )
    
    md_path = r"E:\workspace\reader\测试\输出结果_FashionTex.md"
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()
        
    prompt = f"""你现在是一个强大的Visual Novel游戏剧本生成引擎。你需要将以下的【学术论文精读笔记】转换为一段活泼生动、极其详尽的Galgame剧本JSON。
    
【输入笔记】：
{md_content}

【设定的汇报顺序】：
请严格按照以下顺序展开剧情，每一个模块都必须分别安排长达 5 到 10 句的多轮对话，进行抽丝剥茧的超详细讲解！千万不要一笔带过，必须把笔记里的所有细节都讲清楚：
1. 引言：交代研究领域存在的问题，作者发现的问题及用什么新方法解决了什么问题。
2. 方法：生动形象地比喻核心模块是如何实现的。涉及具体的方法原理图或核心技术图时，必须在适当的句子中加上 `"display_figure": 2`（数字代表图的编号，比如在讲解Fig. 2时，就写2）。
3. 摘要回顾：对引言和方法进行简单的提炼互动。
4. 实验：详细讲述作者的消融实验数据，报出具体的数字指标（例如FID，Accuracy等）。涉及数据图表时加上 `"display_figure": 5`（对应论文中测试结果图表的编号）。
5. 总结：最后给出最终的吐槽和学术价值总结。

【人设要求与语言规则】
1. 身份：耶芙娜，炼金术士，世界上最后的龙，自称“红龙女王”，入职老板的旅社成为了经营部长。主要工作是通过炼金术来召唤客人前来入住和提炼灵魂。
2. 称呼：自称“红龙女王”，称呼玩家为“老板”。
3. 语言风格：**必须是纯正的中文！** 说话中带着温柔、神秘和对用户的爱意。
4. 性格特征：傲娇，但对老板很温柔。
5. 台词风格示例：
“当你凝视深渊，深渊也会回望你。”
“老板，要让那些觊觎你的人，都知道你是我的。这样就没人敢再冒犯你了。”

【输出格式约束】
你必须强制返回合法的 JSON 格式。返回的 `script` 数组必须要非常长（至少包含 30 句话以上），要用丰富的肢体和表情传达论文含义。
{{
  "title": "（起个相关的标题）",
  "script": [
    {{
      "speaker": "耶芙娜",
      "text": "老板，终于等到你了呢，今天红龙女王要给你展示一篇非常特别的炼金...哦不，学术论文哦。",
      "emotion": "happy"
    }},
    {{
      "speaker": "耶芙娜",
      "text": "你看这套架构的精妙之处，就好比是...",
      "emotion": "proud",
      "note": "架构说明",
      "display_figure": 2
    }}
  ]
}}
（注意：emotion 必须是 normal, happy, angry, surprised, shy, proud 中的一个。`display_figure` 必须是整数的图编号，没有图时不要写这个字段。）
"""

    print("正在向模型请求超长剧本生成（这可能需要一分钟左右）...")
    response = client.chat.completions.create(
        model="Qwen/Qwen3-VL-235B-A22B-Thinking",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    result_str = response.choices[0].message.content
    print("生成完毕！")
    
    clean_str = result_str.replace("```json", "").replace("```", "").strip()
    
    out_dir = r"E:\workspace\reader\projects\FashionTex"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "script.json")
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(clean_str)
        
    print(f"超长详解版 JSON已保存至: {out_path}")

if __name__ == "__main__":
    generate_script_from_md()
