import fitz
import os

pdf_path = r"E:\workspace\reader\测试\计算机+人工智能\FashionTex.pdf"
out_dir = r"E:\workspace\reader\测试\FashionTex_Project\images"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
img_count = 0

for page_index in range(len(doc)):
    page = doc[page_index]
    image_list = page.get_images()
    
    if image_list:
        print(f"Page {page_index} found {len(image_list)} images")
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            img_count += 1
            filename = os.path.join(out_dir, f"figure_{img_count}.{image_ext}")
            with open(filename, "wb") as f:
                f.write(image_bytes)
            print(f"Saved {filename}")
    else:
        print(f"Page {page_index} no images found")
