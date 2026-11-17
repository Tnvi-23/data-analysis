import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from report_helpers import (
    base_dir, diagrams_dir, docx_path, pdf_path,
    apply_section_layout, configure_header_footer,
    add_custom_heading, add_body_paragraph, add_bullet_point,
    add_figure_image, add_table_with_caption, set_cell_background,
    set_cell_margins, set_table_borders
)

doc = docx.Document()

# -----------------------------------------------------------------------------
# SECTION 1: TITLE SHEET (COVER PAGE)
# -----------------------------------------------------------------------------
sec1 = doc.sections[0]
apply_section_layout(sec1)
sec1.header.is_linked_to_previous = False
sec1.footer.is_linked_to_previous = False

# Spacing to match template
p_a = doc.add_paragraph()
p_a.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_a.paragraph_format.space_before = Pt(10)
p_a.paragraph_format.space_after = Pt(2)
r_a = p_a.add_run("A\nProject Report On")
r_a.font.name = 'Times New Roman'
r_a.font.size = Pt(13)
r_a.bold = True
r_a.font.color.rgb = RGBColor(0, 0, 0)

# Project Title
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.space_before = Pt(12)
p_title.paragraph_format.space_after = Pt(16)
p_title.paragraph_format.line_spacing = 1.3
r_title = p_title.add_run("“SMARTDATA INSIGHT – AI-POWERED DATA ANALYSIS AND VISUALIZATION PLATFORM”")
r_title.font.name = 'Times New Roman'
r_title.font.size = Pt(15)
r_title.bold = True
r_title.font.color.rgb = RGBColor(0, 0, 0)

# Submitted By
p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.space_before = Pt(8)
p_sub.paragraph_format.space_after = Pt(2)
r_sub = p_sub.add_run("Submitted By")
r_sub.font.name = 'Times New Roman'
r_sub.font.size = Pt(12)
r_sub.bold = True

p_names = doc.add_paragraph()
p_names.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_names.paragraph_format.space_before = Pt(2)
p_names.paragraph_format.space_after = Pt(14)
p_names.paragraph_format.line_spacing = 1.3
r_n1 = p_names.add_run("Tanvi Sanjay Bidve\nGauri Gawali Raju")
r_n1.font.name = 'Times New Roman'
r_n1.font.size = Pt(13)
r_n1.bold = True
r_n1.font.color.rgb = RGBColor(0, 0, 0)

# Guidance
p_guide = doc.add_paragraph()
p_guide.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_guide.paragraph_format.space_before = Pt(6)
p_guide.paragraph_format.space_after = Pt(2)
r_g1 = p_guide.add_run("Under the Guidance of\n")
r_g1.font.name = 'Times New Roman'
r_g1.font.size = Pt(12)
r_g1.bold = True
r_g2 = p_guide.add_run("Prof. N.G. Dharashive")
r_g2.font.name = 'Times New Roman'
r_g2.font.size = Pt(13)
r_g2.bold = True
r_g2.font.color.rgb = RGBColor(0, 0, 0)

# Department & College
p_dept = doc.add_paragraph()
p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_dept.paragraph_format.space_before = Pt(8)
p_dept.paragraph_format.space_after = Pt(2)
p_dept.paragraph_format.line_spacing = 1.3
r_d1 = p_dept.add_run("Of\nComputer Science and Engineering Department\n")
r_d1.font.name = 'Times New Roman'
r_d1.font.size = Pt(12)
r_d1.bold = True
r_d2 = p_dept.add_run("M. S. Bidve Engg. College, Latur")
r_d2.font.name = 'Times New Roman'
r_d2.font.size = Pt(13)
r_d2.bold = True
r_d2.font.color.rgb = RGBColor(0, 0, 0)

# Affiliated To
p_aff = doc.add_paragraph()
p_aff.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_aff.paragraph_format.space_before = Pt(8)
p_aff.paragraph_format.space_after = Pt(6)
r_aff = p_aff.add_run("Affiliated to")
r_aff.font.name = 'Times New Roman'
r_aff.font.size = Pt(11)
r_aff.bold = True

# University Logo
logo_path = os.path.join(diagrams_dir, 'university_logo.jpeg')
if os.path.exists(logo_path):
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(2)
    p_logo.paragraph_format.space_after = Pt(6)
    p_logo.add_run().add_picture(logo_path, width=Inches(1.5))

p_uni = doc.add_paragraph()
p_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_uni.paragraph_format.space_before = Pt(4)
p_uni.paragraph_format.space_after = Pt(4)
p_uni.paragraph_format.line_spacing = 1.2
r_u1 = p_uni.add_run("Dr. Babasaheb Ambedkar Technological University, Lonere\n")
r_u1.font.name = 'Times New Roman'
r_u1.font.size = Pt(12)
r_u1.bold = True
r_u1.font.color.rgb = RGBColor(0, 0, 0)
r_u2 = p_uni.add_run("Academic Year 2026-27")
r_u2.font.name = 'Times New Roman'
r_u2.font.size = Pt(11)
r_u2.bold = True

# -----------------------------------------------------------------------------
# SECTION 2: CERTIFICATE PAGE
# -----------------------------------------------------------------------------
doc.add_page_break()
sec2 = doc.add_section()
apply_section_layout(sec2)
sec2.header.is_linked_to_previous = False
sec2.footer.is_linked_to_previous = False

# College Header on Certificate
p_c_hdr = doc.add_paragraph()
p_c_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_c_hdr.paragraph_format.space_before = Pt(15)
p_c_hdr.paragraph_format.space_after = Pt(4)
r_ch1 = p_c_hdr.add_run("M. S. BIDVE ENGINEERING COLLEGE, LATUR\n")
r_ch1.font.name = 'Times New Roman'
r_ch1.font.size = Pt(14)
r_ch1.bold = True
r_ch2 = p_c_hdr.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\n")
r_ch2.font.name = 'Times New Roman'
r_ch2.font.size = Pt(12)
r_ch2.bold = True
r_ch3 = p_c_hdr.add_run("Affiliated to Dr. Babasaheb Ambedkar Technological University, Lonere")
r_ch3.font.name = 'Times New Roman'
r_ch3.font.size = Pt(10)
r_ch3.italic = True

p_c_title = doc.add_paragraph()
p_c_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_c_title.paragraph_format.space_before = Pt(25)
p_c_title.paragraph_format.space_after = Pt(25)
r_ct = p_c_title.add_run("CERTIFICATE")
r_ct.font.name = 'Times New Roman'
r_ct.font.size = Pt(15)
r_ct.bold = True
r_ct.underline = True
r_ct.font.color.rgb = RGBColor(0, 0, 0)

p_c_body = doc.add_paragraph()
p_c_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p_c_body.paragraph_format.space_before = Pt(10)
p_c_body.paragraph_format.space_after = Pt(40)
p_c_body.paragraph_format.line_spacing = 1.5

r_cb = p_c_body.add_run(
    "This is to certify that Tanvi Sanjay Bidve and Gauri Gawali Raju have successfully submitted a project on "
    "“SMARTDATA INSIGHT – AI-POWERED DATA ANALYSIS AND VISUALIZATION PLATFORM” for the partial fulfillment of their "
    "Degree in Bachelor of Technology (B.Tech) in the Computer Science and Engineering department as prescribed by the "
    "Dr. Babasaheb Ambedkar Technological University, Lonere during academic year 2026-27.\n\n"
    "The project report has been examined, verified, and evaluated as part of the university curriculum requirements."
)
r_cb.font.name = 'Times New Roman'
r_cb.font.size = Pt(12)
r_cb.font.color.rgb = RGBColor(0, 0, 0)

# Signatures Table (3 columns)
sig_table = doc.add_table(rows=2, cols=3)
sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
for row in sig_table.rows:
    for cell in row.cells:
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)

sig_table.rows[0].cells[0].text = "______________________\nProject Guide\nProf. N.G. Dharashive"
sig_table.rows[0].cells[1].text = "______________________\nH.O.D.\nDr. N.M. Halgare"
sig_table.rows[0].cells[2].text = "______________________\nPrincipal\nDr. S.M. Jagade"

for cell in sig_table.rows[0].cells:
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10.5)
        r.bold = True
        r.font.color.rgb = RGBColor(0, 0, 0)

sig_table.rows[1].cells[0].text = "\nInternal Examiner"
sig_table.rows[1].cells[1].text = ""
sig_table.rows[1].cells[2].text = "\nExternal Examiner"
for cell in sig_table.rows[1].cells:
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in p.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.bold = True
        r.font.color.rgb = RGBColor(71, 85, 105)

# -----------------------------------------------------------------------------
# SECTION 3: ACKNOWLEDGEMENT
# -----------------------------------------------------------------------------
doc.add_page_break()
sec3 = doc.add_section()
apply_section_layout(sec3)
sec3.header.is_linked_to_previous = False
sec3.footer.is_linked_to_previous = False

p_ack_t = doc.add_paragraph()
p_ack_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_ack_t.paragraph_format.space_before = Pt(20)
p_ack_t.paragraph_format.space_after = Pt(20)
r_at = p_ack_t.add_run("ACKNOWLEDGEMENT")
r_at.font.name = 'Times New Roman'
r_at.font.size = Pt(15)
r_at.bold = True
r_at.underline = True

add_body_paragraph(
    doc,
    "We gratefully acknowledge the assistance, cooperation, guidance, and clarifications provided during the development "
    "of our project “SMARTDATA INSIGHT – AI-POWERED DATA ANALYSIS AND VISUALIZATION PLATFORM”. We express our extreme gratitude "
    "to our esteemed project guide, Prof. N.G. Dharashive, who guided us with unwavering dedication throughout the conceptualization, "
    "system architecture, algorithmic formulation, and implementation of this project. Without his willing disposition, spirit of "
    "accommodation, frankness, timely clarification, and above all faith in us, this project could not have been completed in due time. "
    "His readiness to discuss all technical challenges, architectural tradeoffs, and implementation subtleties at every stage deserves our special gratitude."
)

add_body_paragraph(
    doc,
    "We extend our profound thanks to Dr. N.M. Halgare, Head of the Computer Science and Engineering Department, for his constant "
    "encouragement, institutional backing, and for providing the modern computing and network laboratories necessary to execute this project. "
    "We are equally grateful to Dr. S.M. Jagade, Principal of M.S. Bidve Engineering College, Latur, for fostering an academic environment "
    "that champions innovation, software engineering excellence, and applied technological research."
)

add_body_paragraph(
    doc,
    "We would also like to express our heartfelt appreciation to all the faculty members, technical laboratory assistants, and staff "
    "of the Computer Science and Engineering Department for their continuous cooperation, valuable insights, and constructive critiques. "
    "Finally, we thank our parents, family members, and colleagues whose moral support, encouragement, and patience sustained us "
    "throughout this demanding academic endeavor."
)

p_stud = doc.add_paragraph()
p_stud.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p_stud.paragraph_format.space_before = Pt(30)
p_stud.paragraph_format.space_after = Pt(0)
p_stud.paragraph_format.line_spacing = 1.3
r_st = p_stud.add_run("Tanvi Sanjay Bidve\nGauri Gawali Raju\nB.Tech (Computer Science & Engineering)\nM.S. Bidve Engineering College, Latur")
r_st.font.name = 'Times New Roman'
r_st.font.size = Pt(11.5)
r_st.bold = True
r_st.font.color.rgb = RGBColor(0, 0, 0)

# -----------------------------------------------------------------------------
# SECTION 4: FRONT MATTER (ABSTRACT, INDEX, ABBREVIATIONS, LIST OF FIGURES/TABLES)
# Page numbering: Roman numerals (i, ii, iii...)
# -----------------------------------------------------------------------------
doc.add_page_break()
sec4 = doc.add_section()
apply_section_layout(sec4)
configure_header_footer(sec4, is_front_matter=True)

# ABSTRACT
p_abs_t = doc.add_paragraph()
p_abs_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_abs_t.paragraph_format.space_before = Pt(10)
p_abs_t.paragraph_format.space_after = Pt(16)
r_abst = p_abs_t.add_run("ABSTRACT")
r_abst.font.name = 'Times New Roman'
r_abst.font.size = Pt(14)
r_abst.bold = True
r_abst.underline = True

add_body_paragraph(
    doc,
    "In the modern data-driven economy, organizations and academic researchers process massive quantities of tabular data "
    "originating from heterogeneous operational sources. Despite the proliferation of sophisticated business intelligence systems, "
    "the vast majority of exploratory data analysis continues to rely on legacy spreadsheet software such as Microsoft Excel. "
    "Empirical software engineering studies reveal that over 88% of unvetted operational spreadsheets harbor formula errors, "
    "unhandled missing values, or structural anomalies that severely skew downstream predictive modeling. Furthermore, conventional "
    "analytics suites suffer from steep learning curves, expensive proprietary licenses, rigid desktop installation requirements, "
    "and a total absence of grounded natural language reasoning."
)

add_body_paragraph(
    doc,
    "To resolve these foundational constraints, this project presents SmartData Insight – AI-Powered Data Analysis and "
    "Visualization Platform, an enterprise-grade full-stack web platform built on the modern MERN architecture (MongoDB Atlas, "
    "Express.js, React 18 with Vite, and Node.js v24). SmartData Insight provides an end-to-end, zero-configuration exploratory environment "
    "that accepts multi-format spreadsheet ingestions (CSV, XLSX, XLS), dynamically audits tabular health, performs automated "
    "anomaly detection via Interquartile Range (IQR 1.5) thresholds, executes mathematical descriptive and inferential statistics, "
    "renders server-side vector visualizations, and seamlessly orchestrates conversational artificial intelligence via Google’s "
    "Gemini 3.8 Flash Interactions API."
)

add_body_paragraph(
    doc,
    "Crucially, the platform enforces enterprise-grade security via JSON Web Token (JWT) authentication stored in secure, "
    "HTTP-only, SameSite cookies with strict user ownership boundaries across all resources. A dedicated server-side canvas engine "
    "(@napi-rs/canvas) renders high-resolution PNG chart buffers (donut/pie charts, continuous binned frequency histograms, and Pearson "
    "linear correlation bars) embedded into publication-ready, multi-section PDF dossiers via PDFKit. The system features an innovative "
    "non-overflowing pagination layout manager that completely eliminates spurious blank pages, accompanied by Cloudinary cloud archival "
    "with graceful local storage failover. Rigorous testing across diverse real-world benchmark datasets confirms deterministic parametric "
    "accuracy, sub-500ms analytical response times, zero-latency conversational grounding, and flawless document compilation."
)

# TABLE OF CONTENTS (INDEX)
doc.add_page_break()
p_idx_t = doc.add_paragraph()
p_idx_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_idx_t.paragraph_format.space_before = Pt(10)
p_idx_t.paragraph_format.space_after = Pt(14)
r_idxt = p_idx_t.add_run("INDEX (TABLE OF CONTENTS)")
r_idxt.font.name = 'Times New Roman'
r_idxt.font.size = Pt(14)
r_idxt.bold = True
r_idxt.underline = True

toc_headers = ["Sr. No.", "Chapter / Topic Name", "Page No."]
toc_data = [
    ["-", "Title Sheet & Certificate", "Cover"],
    ["-", "Acknowledgement & Abstract", "i - ii"],
    ["-", "Index, Abbreviations, List of Figures & Tables", "iii - vi"],
    ["CHAPTER 1", "INTRODUCTION", "1"],
    ["1.1", "Introduction to SmartData Insight", "1"],
    ["1.2", "Background and Motivation", "2"],
    ["1.3", "Problem Statement", "3"],
    ["1.4", "Existing Systems and Their Critical Limitations", "4"],
    ["1.5", "Proposed SmartData Insight System", "5"],
    ["1.6", "Key Project Objectives", "6"],
    ["1.7", "Scope of the Project", "7"],
    ["1.8", "Applications and Target Industry Domains", "8"],
    ["1.9", "Organization of the Project Report", "9"],
    ["CHAPTER 2", "PROJECT OVERVIEW & LITERATURE SURVEY", "10"],
    ["2.1", "Historical Overview of Tabular Data Processing", "10"],
    ["2.2", "Evolution of Spreadsheets and Structural Constraints", "11"],
    ["2.3", "Modern AI-Powered Analytical Architectures", "12"],
    ["2.4", "Comprehensive Feasibility Study (Technical, Economic, Operational)", "13"],
    ["2.5", "Comparative Analysis of Contemporary Analytics Platforms", "15"],
    ["2.6", "Identified Research Gaps and Project Motivation", "17"],
    ["CHAPTER 3", "DESCRIPTION OF WORK (SYSTEM DESIGN & IMPLEMENTATION)", "18"],
    ["3.1", "Software Requirements Specification (SRS)", "18"],
    ["3.2", "System Architecture & Comprehensive UML Modeling", "21"],
    ["3.3", "Technologies, Frameworks, and Cloud Services Employed", "29"],
    ["3.4", "Detailed Modular Implementation Details (Modules 1 to 8)", "35"],
    ["CHAPTER 4", "RESULTS, SCREENSHOTS & TESTING", "45"],
    ["4.1", "Experimental Environment & Testing Setup", "45"],
    ["4.2", "Comprehensive Verification & Master Test Case Execution Matrix", "46"],
    ["4.3", "Analytical Results & Real Benchmark Dataset Outputs", "51"],
    ["4.4", "User Interface Workspaces & System Screenshots (Figures 4.4 - 4.11)", "54"],
    ["CHAPTER 5", "CONCLUSION & FUTURE SCOPE", "62"],
    ["5.1", "Summary of Completed Work", "62"],
    ["5.2", "Key Technical Achievements & Innovations", "63"],
    ["5.3", "System Advantages & Architectural Strengths", "64"],
    ["5.4", "Technical Constraints & Current Limitations", "65"],
    ["5.5", "Future Research & Development Horizons", "66"],
    ["CHAPTER 6", "REFERENCES", "67"],
    ["APPENDIX A", "Verified Source Code Highlights", "70"],
    ["APPENDIX B", "Complete REST API Endpoint Specifications", "73"],
    ["APPENDIX C", "Benchmark Sample Datasets Used for Validation", "76"]
]
add_table_with_caption(doc, "Index Table", "Detailed Topic and Page Navigation Structure", toc_headers, toc_data, col_widths=[1.0, 4.3, 0.9])

# ABBREVIATIONS
doc.add_page_break()
p_abb_t = doc.add_paragraph()
p_abb_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_abb_t.paragraph_format.space_before = Pt(10)
p_abb_t.paragraph_format.space_after = Pt(14)
r_abbt = p_abb_t.add_run("LIST OF ABBREVIATIONS")
r_abbt.font.name = 'Times New Roman'
r_abbt.font.size = Pt(14)
r_abbt.bold = True
r_abbt.underline = True

abb_headers = ["Sr. No.", "Abbreviation", "Extended Terminology & Technical Meaning"]
abb_data = [
    ["1", "AI", "Artificial Intelligence"],
    ["2", "API", "Application Programming Interface"],
    ["3", "CORS", "Cross-Origin Resource Sharing"],
    ["4", "CSV", "Comma-Separated Values"],
    ["5", "DFD", "Data Flow Diagram"],
    ["6", "DOM", "Document Object Model"],
    ["7", "ER", "Entity-Relationship"],
    ["8", "HTTP", "Hypertext Transfer Protocol"],
    ["9", "IQR", "Interquartile Range (1.5 × IQR Threshold for Outliers)"],
    ["10", "JSON", "JavaScript Object Notation"],
    ["11", "JWT", "JSON Web Token (RFC 7519 Security Standard)"],
    ["12", "MERN", "MongoDB, Express.js, React.js, Node.js Full-Stack Architecture"],
    ["13", "MIME", "Multipurpose Internet Mail Extensions"],
    ["14", "ODM", "Object Document Mapper (Mongoose)"],
    ["15", "PCA", "Principal Component Analysis"],
    ["16", "PDF", "Portable Document Format"],
    ["17", "REST", "Representational State Transfer"],
    ["18", "SDK", "Software Development Kit"],
    ["19", "SPA", "Single Page Application"],
    ["20", "UI/UX", "User Interface / User Experience"],
    ["21", "URI", "Uniform Resource Identifier"],
    ["22", "URL", "Uniform Resource Locator"],
    ["23", "XLSX", "Microsoft OpenXML Spreadsheet Format"]
]
add_table_with_caption(doc, "Abbreviations Table", "Technical Abbreviations and Acronyms", abb_headers, abb_data, col_widths=[0.8, 1.4, 4.0])

# LIST OF FIGURES
doc.add_page_break()
p_lof_t = doc.add_paragraph()
p_lof_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_lof_t.paragraph_format.space_before = Pt(10)
p_lof_t.paragraph_format.space_after = Pt(14)
r_loft = p_lof_t.add_run("LIST OF FIGURES")
r_loft.font.name = 'Times New Roman'
r_loft.font.size = Pt(14)
r_loft.bold = True
r_loft.underline = True

lof_headers = ["Figure No.", "Figure Title & Description", "Page No."]
lof_data = [
    ["Figure 1.1", "High-Level Platform Evolution and Ecosystem Overview", "5"],
    ["Figure 2.1", "Evolution from Traditional Spreadsheets to AI-Powered Platforms", "12"],
    ["Figure 3.1", "Complete End-to-End Three-Tier System Architecture", "22"],
    ["Figure 3.2", "Context-Level Data Flow Diagram (DFD Level 0)", "24"],
    ["Figure 3.3", "Functional Data Flow Diagram (DFD Level 1)", "25"],
    ["Figure 3.4", "Comprehensive Use Case Diagram", "26"],
    ["Figure 3.5", "Analytical Data Processing & Pipeline Activity Diagram", "27"],
    ["Figure 3.6", "End-to-End Request, Processing & Report Generation Sequence Diagram", "28"],
    ["Figure 3.7", "MongoDB Atlas Entity-Relationship (ER) Schema Diagram", "29"],
    ["Figure 3.8", "Subsystem Interaction & Module Communication Architecture", "30"],
    ["Figure 4.1", "Categorical Distribution Donut Chart (Gender Attribute - student_exam_scores.csv)", "52"],
    ["Figure 4.2", "Continuous Frequency Histogram (StudyHours - student_exam_scores.csv)", "53"],
    ["Figure 4.3", "Linear Pearson Dependencies (student_exam_scores.csv)", "54"],
    ["Figure 4.4", "Public Landing Page & Interactive Analytical Showcase", "55"],
    ["Figure 4.5", "Secure User Authentication & Registration Workspace", "56"],
    ["Figure 4.6", "Multi-Dataset Executive Dashboard & System Overview", "57"],
    ["Figure 4.7", "Interactive Data Cleaning & Transformation Console", "58"],
    ["Figure 4.8", "Statistical Modeling & Descriptive Statistics Studio", "59"],
    ["Figure 4.9", "Multi-Variate Visualization Dashboard Suite", "60"],
    ["Figure 4.10", "Grounded Conversational AI Assistant & Analytical Copilot", "61"],
    ["Figure 4.11", "Multi-Page Executive PDF Report Dossier & Archival System", "62"]
]
add_table_with_caption(doc, "Figures Table", "List of Architecture Diagrams, Data Charts, and UI Figures", lof_headers, lof_data, col_widths=[1.2, 4.3, 0.7])

# LIST OF TABLES
doc.add_page_break()
p_lot_t = doc.add_paragraph()
p_lot_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_lot_t.paragraph_format.space_before = Pt(10)
p_lot_t.paragraph_format.space_after = Pt(14)
r_lott = p_lot_t.add_run("LIST OF TABLES")
r_lott.font.name = 'Times New Roman'
r_lott.font.size = Pt(14)
r_lott.bold = True
r_lott.underline = True

lot_headers = ["Table No.", "Table Title & Scope", "Page No."]
lot_data = [
    ["Table 2.1", "Comparative Evaluation: Spreadsheets vs. BI Tools vs. SmartData Insight", "16"],
    ["Table 3.1", "Minimum and Recommended Hardware Specifications", "19"],
    ["Table 3.2", "Software Environment and External Cloud Dependencies", "20"],
    ["Table 3.3", "MongoDB User Collection Schema Definition", "36"],
    ["Table 3.4", "MongoDB Dataset Collection Schema Definition", "37"],
    ["Table 3.5", "MongoDB Analysis Collection Schema Definition", "39"],
    ["Table 3.6", "MongoDB Report Collection Schema Definition", "41"],
    ["Table 3.7", "MongoDB Conversation Collection Schema Definition", "43"],
    ["Table 4.1", "Master Test Case Execution Matrix Across All Subsystems", "48"],
    ["Table 4.2", "Multi-Dataset Empirical Verification & Benchmark Metrics", "52"]
]
add_table_with_caption(doc, "Tables Table", "List of Data Tables and Schema Specifications", lot_headers, lot_data, col_widths=[1.2, 4.3, 0.7])

print("Front matter generated successfully.")
doc.save(docx_path)
