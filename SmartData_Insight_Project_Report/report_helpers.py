import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

base_dir = r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report'
diagrams_dir = os.path.join(base_dir, 'diagrams')
docx_path = os.path.join(base_dir, 'SmartData_Insight_Project_Report.docx')
pdf_path = os.path.join(base_dir, 'SmartData_Insight_Project_Report.pdf')

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/></w:tblBorders>')
    tblPr.append(borders)

def add_page_number_field(run):
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    run._r.append(fldSimple)

def apply_section_layout(section, start_type='continuous'):
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.25) # 1.25 in left margin for binding
    section.right_margin = Inches(1.0)
    section.page_width = Inches(8.27)  # A4 width
    section.page_height = Inches(11.69) # A4 height

def add_custom_heading(doc, text, level=1, space_before=12, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.keep_with_next = True
    
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.color.rgb = RGBColor(0, 0, 0)
    run.bold = True
    
    if level == 1:
        run.font.size = Pt(14) # Main topics: Bold, 14pt, Times New Roman
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    elif level == 2:
        run.font.size = Pt(12) # Subtopics: Bold, 12pt, Times New Roman
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    else:
        run.font.size = Pt(12)
        run.italic = True
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return p

def add_body_paragraph(doc, text, space_after=6, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.5
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(12)
        r_pre.bold = True
        r_pre.font.color.rgb = RGBColor(0, 0, 0)
        
    r_body = p.add_run(text)
    r_body.font.name = 'Times New Roman'
    r_body.font.size = Pt(12)
    r_body.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_bullet_point(doc, title, desc):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.5
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    r_t = p.add_run(title + ": ")
    r_t.font.name = 'Times New Roman'
    r_t.font.size = Pt(12)
    r_t.bold = True
    r_t.font.color.rgb = RGBColor(0, 0, 0)
    
    r_d = p.add_run(desc)
    r_d.font.name = 'Times New Roman'
    r_d.font.size = Pt(12)
    r_d.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_figure_image(doc, img_name, fig_num_str, fig_caption_str, width_in=6.0):
    img_path = os.path.join(diagrams_dir, img_name)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(width_in))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(12)
        p_cap.paragraph_format.keep_with_next = True
        
        r_num = p_cap.add_run(f"{fig_num_str}: ")
        r_num.font.name = 'Times New Roman'
        r_num.font.size = Pt(11)
        r_num.bold = True
        r_num.font.color.rgb = RGBColor(0, 0, 0)
        
        r_cap = p_cap.add_run(fig_caption_str)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.size = Pt(11)
        r_cap.font.color.rgb = RGBColor(30, 41, 59)
    else:
        print(f"Warning: Figure image not found: {img_path}")

def add_table_with_caption(doc, tab_num_str, tab_caption_str, headers, data, col_widths=None):
    # Caption above table
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_cap.paragraph_format.space_before = Pt(10)
    p_cap.paragraph_format.space_after = Pt(4)
    p_cap.paragraph_format.keep_with_next = True
    
    r_num = p_cap.add_run(f"{tab_num_str}: ")
    r_num.font.name = 'Times New Roman'
    r_num.font.size = Pt(11)
    r_num.bold = True
    r_num.font.color.rgb = RGBColor(0, 0, 0)
    
    r_cap = p_cap.add_run(tab_caption_str)
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(11)
    r_cap.font.color.rgb = RGBColor(15, 23, 42)
    
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="CBD5E1", sz="4", val="single")
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = h_text
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            
    # Data rows
    for r_idx, row_data in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, cell_value in enumerate(row_data):
            row_cells[c_idx].text = str(cell_value)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=140, right=140)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(30, 41, 59)
                
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)
                
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def configure_header_footer(section, is_front_matter=False):
    # Header setup
    hdr = section.header
    hdr.is_linked_to_previous = False
    p_hdr = hdr.paragraphs[0]
    p_hdr.text = ""
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_hdr = p_hdr.add_run("SmartData Insight – AI-Powered Data Analysis and Visualization Platform")
    r_hdr.font.name = 'Times New Roman'
    r_hdr.font.size = Pt(8.5)
    r_hdr.italic = True
    r_hdr.font.color.rgb = RGBColor(100, 116, 139)
    
    # Footer setup
    ftr = section.footer
    ftr.is_linked_to_previous = False
    p_ftr = ftr.paragraphs[0]
    p_ftr.text = ""
    
    # Left text: Dept.of CSE,MSBECL
    r_left = p_ftr.add_run("Dept.of CSE,MSBECL")
    r_left.font.name = 'Times New Roman'
    r_left.font.size = Pt(9.5)
    r_left.font.color.rgb = RGBColor(71, 85, 105)
    
    # Right tab + Page Number
    p_ftr.paragraph_format.tab_stops.add_tab_stop(Inches(6.02))
    r_tab = p_ftr.add_run("\t")
    r_pg = p_ftr.add_run()
    r_pg.font.name = 'Times New Roman'
    r_pg.font.size = Pt(9.5)
    r_pg.bold = True
    r_pg.font.color.rgb = RGBColor(15, 23, 42)
    add_page_number_field(r_pg)
    
    # Numbering style
    sectPr = section._sectPr
    fmt_val = "romanLower" if is_front_matter else "decimal"
    start_val = "1"
    pgNumType = parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="{fmt_val}" w:start="{start_val}"/>')
    sectPr.append(pgNumType)

print("Helper definitions loaded.")
