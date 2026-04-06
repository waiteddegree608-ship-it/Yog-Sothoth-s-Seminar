import os
import shutil

src_dir = r"E:\workspace\reader\立绘+背景\犹格索托斯的庭院"
dest_dir = r"E:\workspace\reader\assets"

os.makedirs(dest_dir, exist_ok=True)

copy_map = {
    r"背景\Gemini_Generated_Image_gu75jcgu75jcgu75.jpg": "yevna_bg.jpg",
    r"耶芙娜\便服\2103.png": "yevna_normal.png",
    r"耶芙娜\便服\2103_7.png": "yevna_happy.png",       # 爽朗大笑
    r"耶芙娜\便服\2103_18.png": "yevna_angry.png",      # 额头有井号生气
    r"耶芙娜\便服\2103_8.png": "yevna_surprised.png",   # 瞪大眼睛滴汗
    r"耶芙娜\便服\2103_21.png": "yevna_shy.png",        # 脸红害羞
    r"耶芙娜\便服\2103_9.png": "yevna_proud.png"        # 抱胸哼气
}

for src_sub, dest_name in copy_map.items():
    src_path = os.path.join(src_dir, src_sub)
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"Copied {src_path} to {dest_path}")
    else:
        print(f"Not found: {src_path}")
