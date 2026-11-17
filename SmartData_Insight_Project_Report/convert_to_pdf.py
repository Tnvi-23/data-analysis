import os
import sys
import win32com.client

docx_path = os.path.abspath(r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report\SmartData_Insight_Project_Report.docx')
pdf_path = os.path.abspath(r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report\SmartData_Insight_Project_Report.pdf')

print("Starting Word COM Automation...")
print(f"Input DOCX: {docx_path}")
print(f"Output PDF: {pdf_path}")

word = None
doc = None

try:
    word = win32com.client.Dispatch('Word.Application')
    word.Visible = False
    word.DisplayAlerts = 0

    print("Opening DOCX document in Microsoft Word...")
    doc = word.Documents.Open(docx_path)

    print("Updating all document fields (Table of Contents & Page Numbers)...")
    try:
        doc.Fields.Update()
        for toc in doc.TablesOfContents:
            toc.Update()
        for tof in doc.TablesOfFigures:
            tof.Update()
    except Exception as fe:
        print(f"Field update note: {fe}")

    print("Saving updated DOCX...")
    doc.Save()

    print("Exporting as PDF (Format = 17)...")
    # wdFormatPDF = 17
    doc.SaveAs(pdf_path, FileFormat=17)

    print("Document successfully exported as PDF!")
    page_count = doc.ComputeStatistics(2) # 2 = wdStatisticPages
    word_count = doc.ComputeStatistics(0) # 0 = wdStatisticWords
    print(f"Total Pages in Report: {page_count}")
    print(f"Total Words in Report: {word_count}")

except Exception as e:
    print(f"Error during Word conversion: {e}")
    sys.exit(1)
finally:
    if doc:
        try:
            doc.Close(False)
        except:
            pass
    if word:
        try:
            word.Quit()
        except:
            pass

print("Word Automation completed cleanly.")
