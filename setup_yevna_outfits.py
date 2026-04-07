import os
import shutil
import json

yev_dir = r'E:\workspace\reader\characters\yevna'
src_base = r'E:\workspace\reader\立绘+背景\犹格索托斯的庭院\耶芙娜'

outfits = [
    {'name': '常服', 'src': '便服'},
    {'name': '礼服', 'src': '礼服'}
]
emotions = ['normal', 'happy', 'angry', 'surprised', 'shy', 'proud']

for o in outfits:
    outfit_name = o['name']
    outfit_dir = os.path.join(yev_dir, outfit_name)
    os.makedirs(outfit_dir, exist_ok=True)
    
    src_folder = os.path.join(src_base, o['src'])
    if os.path.exists(src_folder):
        files = sorted([f for f in os.listdir(src_folder) if f.endswith('.png')])
        for idx, em in enumerate(emotions):
            if idx < len(files):
                src_file = os.path.join(src_folder, files[idx])
                dst_file = os.path.join(outfit_dir, f'{em}.png')
                shutil.copy(src_file, dst_file)
            else:
                if files:
                    shutil.copy(os.path.join(src_folder, files[0]), os.path.join(outfit_dir, f'{em}.png'))

cfg_file = os.path.join(yev_dir, 'config.json')
with open(cfg_file, 'r', encoding='utf-8') as f:
    cfg = json.load(f)
cfg['outfits'] = ['常服', '礼服']
with open(cfg_file, 'w', encoding='utf-8') as f:
    json.dump(cfg, f, ensure_ascii=False, indent=2)

print('Yevna outfits fully loaded.')
