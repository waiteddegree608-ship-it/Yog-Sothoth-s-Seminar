import sys
from llm_client import PaperReaderBot
from prompts import get_prompts_for_type

def run_test():
    # 使用你提供的测试文件和密钥
    test_pdf_path = r"E:\workspace\reader\测试\计算机+人工智能\FashionTex.pdf"
    api_key = "sk-ajdceczxqkrmqnbepesbgkbhgfogujclmrrjzqqmkpegyabo"
    paper_type = "计算机+人工智能"
    
    print(f"*** 开始测试论文分析工具 ***")
    print(f"模型: Qwen3-VL-235B (硅基流动)")
    print(f"论文类型: {paper_type}")
    print(f"PDF文件: {test_pdf_path}")
    print("-" * 50)
    
    prompts = get_prompts_for_type(paper_type)
    bot = PaperReaderBot(api_key=api_key)
    
    try:
        # 执行分析
        result_md = bot.process_paper(test_pdf_path, prompts)
        
        # 将结果写入为Markdown文件
        output_path = r"E:\workspace\reader\测试\输出结果_FashionTex.md"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result_md)
            
        print("\n" + "="*50)
        print(f"分析完成！结果已保存至: {output_path}")
        print("="*50)
        
    except Exception as e:
        print(f"执行时发生错误: {e}")

if __name__ == "__main__":
    run_test()
