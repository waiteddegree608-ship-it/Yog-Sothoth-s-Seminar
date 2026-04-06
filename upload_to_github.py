import os
import subprocess
import sys

def run_cmd(cmd):
    print(f"[Run] {cmd}")
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    if result.returncode != 0:
        print(f"命令执行失败:\n{result.stderr}")
    else:
        print(result.stdout)
    return result.returncode == 0

def create_gitignore():
    gitignore_content = """# Python
__pycache__/
venv/
.env

# AI & Temp files
temp_images/
projects/*/images/
projects/*/summary.md
projects/*/script.json
# 保留 projects 目录本身但忽略内容
!projects/.gitkeep

# Node.js
node_modules/
.next/
out/
build/
.npm
"""
    with open(".gitignore", "w", encoding="utf-8") as f:
        f.write(gitignore_content)
    
    # 确保 projects 文件夹下有一个 .gitkeep
    os.makedirs("projects", exist_ok=True)
    with open("projects/.gitkeep", "w") as f:
        pass
    print("=> 成功生成 .gitignore 以忽略无关的临时文件和密钥")

def main():
    print("=" * 50)
    print("  Yog-Sothoth's Seminar - GitHub 自动上传助手")
    print("=" * 50)

    # 1. 创建 .gitignore
    create_gitignore()

    # 2. 检查 git 是否安装
    if not run_cmd("git --version"):
        print("错误: 本机未安装 Git 或者 Git 未加入环境变量。")
        sys.exit(1)

    # 3. 初始化或重置 git
    if not os.path.exists(".git"):
        run_cmd("git init")
        # 将默认分支名设为 main
        run_cmd("git branch -m main")
    
    # 4. 提交文稿
    print("=> 正在将项目文件添加至缓存区...")
    run_cmd("git add .")
    
    # 5. Commit
    print("=> 正在创建 Commit...")
    run_cmd('git commit -m "Initial commit: Yog-Sothoth\'s Seminar"')

    # 6. 配置 Remote 并推送
    remote_url = input("\n请输入你要上传的 GitHub 仓库地址 (例如: https://github.com/Username/Yog-Sothoth-Seminar.git)\n🔗 URL: ").strip()
    
    if remote_url:
        print("\n=> 正在绑定并推送到 GitHub 远程仓库...")
        # 移除可能存在的旧的 origin
        subprocess.run("git remote remove origin", shell=True, stderr=subprocess.DEVNULL)
        run_cmd(f"git remote add origin {remote_url}")
        
        # 强制推送到 main
        success = run_cmd("git push -u origin main -f")
        if success:
            print("\n🎉 大功告成！红龙女王的宝库已经成功上传到云端！")
        else:
            print("\n❌ 上传失败，请检查网络或确认仓库地址是否正确。")
    else:
        print("\n放弃上传，文件已经保存在本地的 git 仓库中。")

if __name__ == "__main__":
    main()
