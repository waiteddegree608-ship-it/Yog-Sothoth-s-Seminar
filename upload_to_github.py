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

def main():
    print("=" * 50)
    print("  Yog-Sothoth's Seminar - GitHub 自动更新助手")
    print("=" * 50)

    # 1. 检查 git 是否安装
    if not run_cmd("git --version"):
        print("错误: 本机未安装 Git 或者 Git 未加入环境变量。")
        sys.exit(1)

    # 2. 获取用户输入的 Commit 信息
    print("\n=> 正在将项目文件添加至缓存区...")
    run_cmd("git add .")
    
    commit_msg = input("\n📝 请输入本次更新的备注 (直接回车默认使用 'feat: update project files'): ")
    if not commit_msg.strip():
        commit_msg = "feat: update project files"
    
    # 3. Commit
    print("=> 正在创建 Commit...")
    run_cmd(f'git commit -m "{commit_msg}"')

    # 4. 推送到远程
    print("\n=> 正在推送到 GitHub 远程仓库...")
    success = run_cmd("git push origin main")
    if not success:
        print("\n⚠️ 尝试推送到 main 分支失败。如果你之前一直用的是 master 分支，正在尝试推送到 master...")
        success = run_cmd("git push origin master")
        
    if success:
        print("\n🎉 大功告成！代码已经成功更新上传到云端！")
    else:
        print("\n❌ 上传失败，请检查网络（或代理）以及 GitHub 的配置权限。")

if __name__ == "__main__":
    main()
