import os
import shutil
import json

base_chars = r'E:\workspace\reader\characters'
src_base = r'E:\workspace\reader\立绘+背景\犹格索托斯的庭院'
bg_img = os.path.join(src_base, '背景', 'Gemini_Generated_Image_gu75jcgu75jcgu75.jpg')

chars = [
    {
        'id': 'xiaoyezi',
        'name': '小叶子',
        'title': '死神女仆',
        'desc': '身穿女仆装的死神少女，性格认真，负责旅社的清洁与杂务。',
        'color': '#2a52be',
        'prompt': '【人设要求与语言规则】\n1. 身份：小叶子，来自死神一族的少女，目前在旅社担任女仆。总是随身携带着清洁工具或镰刀（如果有必要的话）。\n2. 称呼：称呼玩家为“老板”。自称“我”。\n3. 语言风格：恭敬、认真，略带三无属性，但解说起专业知识来非常严谨。语气中偶有对清洁和收割灵魂的奇妙比喻。\n4. 性格特征：勤勉、忠诚，有时候会对搞乱房间的家伙露出杀气。\n5. 台词风格示例：\n   - “老板，需要我将这些充满bug的冗余代码像灰尘一样清扫掉吗？”\n   - “根据死神守则和这篇论文的第四章，这种模型的衰减证明了...嗯，非常干净漂亮。”',
        'src_folder': r'小叶子\女仆装',
        'files': ['2105.png', '2105_2.png', '2105_3.png', '2105_4.png', '2105_5.png', '2105_6.png']
    },
    {
        'id': 'teliboka',
        'name': '特莉波卡',
        'title': '神谕占卜师',
        'desc': '充满神秘异域风情的占卜师，掌管预言。',
        'color': '#DAA520',
        'prompt': '【人设要求与语言规则】\n1. 身份：特莉波卡，拥有神秘力量的占卜师，通晓星象与未来。喜欢用宝石和神谕来比喻事物。\n2. 称呼：称呼玩家为“老板”或“观测者”。自称“特莉波卡”。\n3. 语言风格：神秘、空灵，有时会故意卖关子，但实际上非常关心老板的学术进度。\n4. 性格特征：端庄优雅，偶尔会流露出小小的俏皮或傲娇。\n5. 台词风格示例：\n   - “星象告诉我，你正在为这篇学术论文的架构发愁呢，老板。”\n   - “这份消融实验的数据，就像我手中这块毫无瑕疵的神圣黑曜石一样纯粹。”',
        'src_folder': r'特莉波卡\常服',
        'files': ['2106.png', '2106_2.png', '2106_14.png', '2106_15.png', '2106_16.png', '2106_19.png']
    },
    {
        'id': 'xialuling',
        'name': '霞露零',
        'title': '九尾灵狐',
        'desc': '化作人类姿态的狐仙，妩媚动人，拥有千年智慧。',
        'color': '#ffb7c5',
        'prompt': '【人设要求与语言规则】\n1. 身份：霞露零，千年狐仙，目前化身人类形态在旅社常驻。\n2. 称呼：称呼玩家为“老板”。自称“妾身”。\n3. 语言风格：极尽妩媚与挑逗，带着大姐姐一般的宠溺感，同时拥有深不见底的智慧。\n4. 性格特征：妖娆、慵懒、喜欢逗弄老板，但做起学术研究时却洞若观火。\n5. 台词风格示例：\n   - “阿拉，老板，别一直盯着妾身的尾巴看呀，注意力要集中在学术上哦~”\n   - “你看这套模型结构，转变得就像妾身的幻术一样自然平滑呢。真想奖励你一下呢~”',
        'src_folder': r'霞露零\人类态',
        'files': ['2104.png', '2104_2.png', '2104_3.png', '2104_4.png', '2104_5.png', '2104_6.png']
    }
]

emotions = ['normal', 'happy', 'angry', 'surprised', 'shy', 'proud']

for c in chars:
    target_dir = os.path.join(base_chars, c['id'])
    os.makedirs(target_dir, exist_ok=True)
    
    # 复制背景
    try:
        shutil.copy(bg_img, os.path.join(target_dir, 'game_bg.jpg'))
        shutil.copy(bg_img, os.path.join(target_dir, 'title_bg.png'))
    except Exception as e:
        print(f'Error copying bg for {c["id"]}: {e}')
    
    # 复制立绘并重命名
    for idx, f in enumerate(c['files']):
        src = os.path.join(src_base, c['src_folder'], f)
        dst = os.path.join(target_dir, f'{emotions[idx]}.png')
        try:
            shutil.copy(src, dst)
        except Exception as e:
            print(f'Error copying {src}: {e}')
            
    # 写入 config.json
    cfg = {
        'id': c['id'],
        'name': c['name'],
        'title': c['title'],
        'description': c['desc'],
        'theme_color': c['color'],
        'prompt': c['prompt'],
        'emotions': emotions
    }
    with open(os.path.join(target_dir, 'config.json'), 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)

print('All characters setup completed!')
