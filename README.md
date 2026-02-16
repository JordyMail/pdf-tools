## PDF Tools - Offline Solution for PDF Manipulation

Hello there! Welcome to **PDF Tools**. I created this project out of frustration with situations where the internet is slow or even blocked at work, but you still need to merge, split, or convert PDF files.

It started as a small tool for my own use, but over time I added more features to make it more complete. The main point is, this is a **web application that can run entirely on your local computer (completely offline!)** without needing any internet connection at all. Just open the `index.html` file in your browser, and all features are ready to use.

### Why This Tool Exists?

Especially for those of you who:
- **Work in restricted environments**, for example, office computers that:
    - Have internet access blocked (internal only).
    - Prohibit installing any software.
- **Frequently deal with PDF documents**:
    - Combine many PDF files into one.
    - Extract specific pages from a thick PDF.
    - Convert scanned photos or Excel results into PDFs.
    - Rearrange or delete unnecessary pages.
- **Want something simple and fast**. No need to upload files to someone else's server; all processes happen on your own computer. Safer and your privacy is maintained.

### Features You Can Use

This tool has several operation modes that you can select via the icons at the top:

1.  **Merge PDF**
        <img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/d2a098dc-9a48-47fd-85f5-0311e4001cab" />

    - **Function:** Combine multiple PDF files into a single document.
    - **How to use:** Upload the PDF files you want to merge. The file order can be arranged by dragging and dropping them directly in the preview area. Click "Process & Download" to start merging.

2.  **Split PDF**
       <img width="1913" height="878" alt="image" src="https://github.com/user-attachments/assets/31e69739-f6e9-4878-aa11-1972a1cbb362" />

    - **Function:** Extract specific pages from a PDF file into new, separate files.
    - **How to use:** Upload 1 PDF file. An input field will appear below. Enter the page numbers or ranges you want to extract. Example: `1-3, 5, 7-9` (meaning pages 1 to 3, page 5, and pages 7 to 9 will be created as separate files).

4.  **Rotate PDF**
        <img width="1909" height="879" alt="image" src="https://github.com/user-attachments/assets/7446ad25-6e29-45be-8104-696edbbff760" />

    - **Function:** Rotate one or multiple pages within a PDF file.
    - **How to use:** Upload 1 PDF file. The pages will be displayed. Click the pages you want to rotate (you can select multiple), then choose the rotation angle (+90°, -90°, or 180°). This tool can also automatically detect if some pages are already skewed and will offer a correction.

5.  **JPG to PDF**
        <img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/9cb6b12c-158a-4f9b-811f-85a2a449c19a" />

    - **Function:** Convert image files (JPG/PNG) into a single PDF file.
    - **How to use:** Upload your image files. The order of images in the PDF can be arranged by dragging and dropping. Click "Process" to start the conversion.

6.  **Excel to PDF**
        <img width="1917" height="872" alt="image" src="https://github.com/user-attachments/assets/840b872e-b47d-4efd-b8cc-9264d0629aa1" />

    - **Function:** Convert an Excel file (`.xlsx` / `.xls`) into a PDF file.
    - **How to use:** Upload 1 Excel file. The tool will read the data from the first sheet and convert it into a table within the PDF.

7.  **Rearrange Pages**
        <img width="1918" height="886" alt="Screenshot 2026-02-16 105848" src="https://github.com/user-attachments/assets/2e9993f2-0b60-4068-a13e-46208dffdcad" />

    - **Function:** Change the order of pages in a PDF file, or even delete unwanted pages.
    - **How to use:** Upload 1 PDF file. All pages will appear as "cards." You can:
        - **Drag the cards** to change the order.
        - **Click the red X button** in the top-right corner of a card to delete that page.
        - Click "Process" to create a new PDF with the order and pages you have set.

### How to Use (Very Simple)

1.  **Download or save all files** of this project into one folder on your computer.
2.  **Open the `index.html` file** using a browser (Chrome, Edge, Firefox, etc.). No installation is needed, and no internet connection is required.
3.  Select the desired feature from the row of icons at the top.
4.  **Add files** by clicking the "Add File" button or by dragging and dropping files directly into the provided area.
5.  Adjust the settings (e.g., arrange order, select pages, set rotation) according to the chosen feature.
6.  Click the **"Process & Download"** button.
7.  The resulting file will be automatically downloaded to your computer. Done!

All these files must be in the same folder for the tool to work properly.

---
