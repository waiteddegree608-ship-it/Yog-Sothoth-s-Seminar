import fitz
import os
import re

def extract_semantic_figures(pdf_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    doc = fitz.open(pdf_path)
    
    # regex for "Figure X:" or "Fig. X."
    fig_pattern = re.compile(r"(?:Figure|Fig\.?)\s*(\d+)", re.IGNORECASE)
    
    for page_index in range(len(doc)):
        page = doc[page_index]
        blocks = page.get_text("dict")["blocks"]
        
        # separate text blocks and image blocks
        text_blocks = [b for b in blocks if b["type"] == 0]
        image_blocks = [b for b in blocks if b["type"] == 1]
        
        for text_b in text_blocks:
            # combine lines
            text_content = ""
            for line in text_b["lines"]:
                for span in line["spans"]:
                    text_content += span["text"] + " "
                    
            text_content = text_content.strip()
            # check if starts with figure caption
            match = fig_pattern.search(text_content[:30]) # caption usually at start
            if match:
                fig_num = match.group(1)
                
                # find closest image block
                caption_bbox = fitz.Rect(text_b["bbox"])
                closest_img = None
                min_dist = 999999
                
                for img_b in image_blocks:
                    img_bbox = fitz.Rect(img_b["bbox"])
                    # distance logic (vertical distance usually)
                    # caption is usually below or above the image
                    # calculate distance between centers
                    dy = caption_bbox.y1 - img_bbox.y1
                    if abs(dy) < min_dist:
                        min_dist = abs(dy)
                        closest_img = img_b
                        
                if closest_img:
                    crop_bbox = fitz.Rect(closest_img["bbox"])
                    # expand slightly
                    crop_bbox = crop_bbox + (-5, -5, 5, 5)
                    crop_bbox = crop_bbox.intersect(page.rect)
                    
                    if not crop_bbox.is_empty:
                        pix_crop = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=crop_bbox)
                        filename = f"Figure_{fig_num}.png"
                        out_path = os.path.join(out_dir, filename)
                        pix_crop.save(out_path)
                        print(f"Extracted {filename} on page {page_index+1}")

if __name__ == "__main__":
    pdf = r"E:\workspace\reader\测试\计算机+人工智能\FashionTex.pdf"
    out = r"E:\workspace\reader\测试\FashionTex_Project\semantic_figures"
    extract_semantic_figures(pdf, out)
