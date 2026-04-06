import fitz
import os

pdf_path = r"E:\workspace\reader\测试\计算机+人工智能\FashionTex.pdf"
out_dir = r"E:\workspace\reader\测试\FashionTex_Project\images_blocks"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
figure_count = 0

for page_index in range(len(doc)):
    page = doc[page_index]
    # get_text("dict") returns text and image blocks
    blocks = page.get_text("dict")["blocks"]
    
    # Render the whole page at high res so we can crop from it
    pix_page = page.get_pixmap(matrix=fitz.Matrix(3, 3))
    
    for b in blocks:
        if b["type"] == 1: # Image block
            bbox = b["bbox"] # (x0, y0, x1, y1)
            # Filter out tiny icons
            width = bbox[2] - bbox[0]
            height = bbox[3] - bbox[1]
            if width > 100 and height > 100:
                figure_count += 1
                
                crop_bbox = fitz.Rect(bbox)
                
                # Expand slightly to get borders if needed
                crop_bbox = crop_bbox + (-2, -2, 2, 2)
                crop_bbox = crop_bbox.intersect(page.rect)
                
                if crop_bbox.is_empty:
                    continue
                    
                try:
                    # Clip during pixmap generation
                    pix_crop = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=crop_bbox)
                    out_path = os.path.join(out_dir, f"figure_{figure_count}.png")
                    pix_crop.save(out_path)
                    print(f"Saved {out_path} from page {page_index+1}")
                except Exception as e:
                    print("Error cropping:", e)
