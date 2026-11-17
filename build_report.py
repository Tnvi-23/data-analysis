from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path
import zipfile, re

ROOT=Path(r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis')
OUT=ROOT/'SmartData_Insight_Project_Report'; OUT.mkdir(exist_ok=True)
(OUT/'screenshots').mkdir(exist_ok=True); (OUT/'diagrams').mkdir(exist_ok=True); (OUT/'supporting_materials').mkdir(exist_ok=True)

def shade(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def borders(table):
    tblPr=table._tbl.tblPr; b=OxmlElement('w:tblBorders')
    for e in ('top','left','bottom','right','insideH','insideV'):
        x=OxmlElement(f'w:{e}'); x.set(qn('w:val'),'single'); x.set(qn('w:sz'),'4'); x.set(qn('w:color'),'D9D9D9'); b.append(x)
    tblPr.append(b)
def table(doc, headers, rows):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'; borders(t)
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]; c.text=h; shade(c,'404040'); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in c.paragraphs[0].runs: r.font.bold=True; r.font.color.rgb=RGBColor(255,255,255); r.font.name='Times New Roman'; r.font.size=Pt(10)
    for row in rows:
        cells=t.add_row().cells
        for i,v in enumerate(row):
            cells[i].text=str(v); cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for p in cells[i].paragraphs:
                for r in p.runs: r.font.name='Times New Roman'; r.font.size=Pt(10)
    return t
def p(doc, text='', style=None, align=None, bold=False):
    x=doc.add_paragraph(style=style); x.alignment=align
    if text:
        r=x.add_run(text); r.bold=bold
    return x
def heading(doc, text, level=1):
    x=doc.add_paragraph(style=f'Heading {level}'); x.add_run(text); return x
def bullet(doc,text): return doc.add_paragraph(text, style='List Bullet')

d=Document(); sec=d.sections[0]; sec.page_width=Inches(8.27); sec.page_height=Inches(11.69); sec.top_margin=Inches(1); sec.bottom_margin=Inches(1); sec.left_margin=Inches(1.25); sec.right_margin=Inches(1)
styles=d.styles
for s in ['Normal','Body Text']:
    st=styles[s]; st.font.name='Times New Roman'; st._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); st.font.size=Pt(12); st.paragraph_format.line_spacing=1.5; st.paragraph_format.space_after=Pt(6)
for i,size in [(1,14),(2,12),(3,12)]:
    st=styles[f'Heading {i}']; st.font.name='Times New Roman'; st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor(0,0,0); st.paragraph_format.space_before=Pt(12); st.paragraph_format.space_after=Pt(6)

# Cover
p(d,'A',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'PROJECT REPORT ON',align=WD_ALIGN_PARAGRAPH.CENTER,bold=True); p(d,'SmartData Insight',align=WD_ALIGN_PARAGRAPH.CENTER,bold=True); p(d,'AI-Powered Data Analysis and Visualization Platform',align=WD_ALIGN_PARAGRAPH.CENTER,bold=True)
for _ in range(3): p(d,'')
p(d,'Submitted By',align=WD_ALIGN_PARAGRAPH.CENTER,bold=True); p(d,'Tanvi Sanjay Bidve and Gauri Gawali Raju',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'Bachelor of Technology (B.Tech)',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'Computer Science and Engineering',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'M. S. Bidve Engineering College, Latur',align=WD_ALIGN_PARAGRAPH.CENTER)
p(d,'University: [Enter University Name]',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'Project Guide: [Enter Guide Name]',align=WD_ALIGN_PARAGRAPH.CENTER); p(d,'Academic Year: [Enter Academic Year]',align=WD_ALIGN_PARAGRAPH.CENTER)
d.add_page_break()

heading(d,'CERTIFICATE',1); p(d,'This is to certify that Tanvi Sanjay Bidve and Gauri Gawali Raju have submitted the project report entitled “SmartData Insight – AI-Powered Data Analysis and Visualization Platform” in partial fulfillment of the requirements for the Bachelor of Technology degree in Computer Science and Engineering during the academic year [Enter Academic Year].')
p(d,'Project Guide: [Enter Guide Name]        Head of Department: [Enter HOD Name]        Principal: [Enter Principal Name]')
d.add_page_break(); heading(d,'DECLARATION',1); p(d,'We declare that the project work entitled “SmartData Insight – AI-Powered Data Analysis and Visualization Platform” is our original work carried out as part of the B.Tech Final Year Project. The report has been prepared from the implemented application and its source code. Any external documentation used is acknowledged in the references.')
p(d,'Student Signatures: ____________________    ____________________'); d.add_page_break()
heading(d,'ACKNOWLEDGEMENT',1); p(d,'We express our sincere gratitude to our project guide, faculty members, and M. S. Bidve Engineering College, Latur, for their guidance and support. We also acknowledge the open-source communities and official documentation for React, Vite, Node.js, Express, MongoDB, Mongoose, Google Gemini, Cloudinary, PDFKit, and Recharts that supported the implementation of this project.')
d.add_page_break(); heading(d,'ABSTRACT',1); p(d,'SmartData Insight is a web-based data analysis and visualization platform developed to simplify the exploration of CSV and Excel datasets. The system combines a React and Vite frontend with a Node.js and Express backend, MongoDB Atlas persistence, deterministic statistical analysis, interactive Recharts visualizations, Gemini-powered conversational insights, and PDF report generation. Authenticated users can upload datasets, inspect metadata and previews, perform cleaning operations, generate analyses, compare datasets, explore charts, ask contextual questions, and maintain report history. Reports are generated with PDFKit and can be stored in Cloudinary when configured, with verified local storage retained as a fallback. The implementation separates core statistical processing from optional AI services so that dataset operations, charts, and report generation remain useful when external AI or storage services are unavailable.')
d.add_page_break(); heading(d,'TABLE OF CONTENTS',1); p(d,'The table of contents can be updated in Microsoft Word using References > Update Table.'); table(d,['Sr. No.','Topic','Page'],[(1,'Chapter 1 Introduction','[Update]'),(2,'Chapter 2 Project Overview','[Update]'),(3,'Chapter 3 Description of Work','[Update]'),(4,'Chapter 4 Results','[Update]'),(5,'Chapter 5 Conclusion','[Update]'),(6,'Chapter 6 References','[Update]'),(7,'Appendices','[Update]')])
heading(d,'ABBREVIATIONS',1); table(d,['Abbreviation','Meaning'],[('API','Application Programming Interface'),('AI','Artificial Intelligence'),('CSV','Comma-Separated Values'),('DFD','Data Flow Diagram'),('JWT','JSON Web Token'),('ODM','Object Document Mapper'),('PDF','Portable Document Format'),('REST','Representational State Transfer'),('UI','User Interface'),('UML','Unified Modeling Language')])
d.add_page_break()

heading(d,'CHAPTER 1 INTRODUCTION',1); heading(d,'1.1 Background',2); p(d,'Modern organizations collect data in spreadsheets and exported files, but raw records do not automatically provide understanding. Analysis often requires cleaning, selecting variables, calculating descriptive statistics, identifying anomalies, and communicating findings through charts and reports. SmartData Insight addresses this workflow in one authenticated application.')
heading(d,'1.2 Problem Statement',2); p(d,'Manual analysis of CSV and Excel files is repetitive and error-prone. Users must move between spreadsheet tools, statistical utilities, charting software, and document tools. This increases the time needed to obtain insights and makes results difficult to reproduce or share.')
heading(d,'1.3 Objectives',2); [bullet(d,x) for x in ['Provide secure dataset upload and management.','Compute descriptive statistics, quality measures, correlations, and observations.','Support data cleaning and visualization from actual uploaded records.','Provide contextual Gemini assistance without replacing deterministic analysis.','Generate and preserve PDF reports with Cloudinary or local fallback storage.']]
heading(d,'1.4 Scope and Applications',2); p(d,'The implemented scope covers authenticated dataset workflows, statistical analysis, charts, AI-assisted interpretation, PDF reporting, report history, and dataset comparison. The platform is suitable for academic analysis, exploratory business reporting, quality audits, and small-to-medium tabular datasets. Advanced predictive modelling and collaborative multi-user workspaces remain future scope.')
heading(d,'1.5 Organization of the Report',2); p(d,'Chapter 2 presents the project overview and feasibility. Chapter 3 explains requirements, design, technologies, and implementation. Chapter 4 records results and verification status. Chapter 5 concludes the work and identifies future enhancements. Chapter 6 lists references and the appendices provide operational details.')

heading(d,'CHAPTER 2 PROJECT OVERVIEW',1); heading(d,'2.1 Existing Approaches',2); p(d,'Spreadsheet-based analysis is accessible but becomes difficult to maintain as datasets grow. Traditional statistical software provides strong calculations but may require specialist knowledge. Business intelligence tools offer dashboards but often require data preparation and configuration. AI assistants can explain findings but should be grounded in computed evidence. SmartData Insight combines these strengths for an integrated workflow.')
heading(d,'2.2 Proposed System',2); p(d,'The proposed system accepts tabular datasets, stores metadata and analysis results in MongoDB Atlas, processes records in backend services, and presents results through a React interface. The application uses deterministic code for calculations, Recharts for interactive charts, Gemini for optional natural-language assistance, PDFKit for reports, and Cloudinary for optional remote report storage.')
heading(d,'2.3 Feasibility Study',2); table(d,['Type','Assessment'],[('Technical','Feasible using the existing JavaScript ecosystem, Express REST APIs, Mongoose, Recharts, PDFKit, and managed services.'),('Economic','Uses open-source libraries and optional managed services; costs depend on external service tiers and usage.'),('Operational','Provides a browser-based workflow that reduces tool switching and supports authenticated report history.')])
heading(d,'2.4 System Benefits',2); p(d,'The system improves repeatability by centralizing dataset metadata, analysis, visualization, conversational context, and report records. It also preserves functionality when optional services fail by keeping statistical analysis and local PDF fallback independent of Gemini and Cloudinary.')

heading(d,'CHAPTER 3 DESCRIPTION OF WORK',1); heading(d,'3.1 Requirements',2); table(d,['Category','Requirements'],[('Functional','Authentication, upload, dataset preview, cleaning, analysis, charts, AI chat, PDF reports, report history, comparison.'),('Non-functional','Security of secrets, responsive UI, clear errors, reliable database lifecycle, maintainable services.'),('Software','React, Vite, JavaScript/JSX, Node.js, Express, MongoDB Atlas, Mongoose, Recharts, PDFKit.'),('Hardware','A modern browser and development machine with Node.js; storage and memory depend on dataset size.')])
heading(d,'3.2 Architecture',2); p(d,'The architecture is a three-layer web system. The React frontend calls Express REST endpoints. Controllers validate requests and coordinate services. Mongoose models persist users, datasets, analyses, reports, and conversations in MongoDB Atlas. Optional integrations are isolated behind Gemini and Cloudinary services.')
table(d,['Layer','Implemented responsibility'],[('Presentation','React pages, reusable components, forms, charts, loading and error states.'),('Application','Express routes, authentication middleware, controllers, upload handling, error handler.'),('Domain services','File processing, statistical analysis, Gemini prompts, PDFKit generation, Cloudinary storage.'),('Persistence','Mongoose schemas for User, Dataset, Analysis, Report, and Conversation.')])
heading(d,'3.3 Data Flow and Module Design',2); p(d,'Dataset upload flows from the frontend to the dataset route, through multipart upload middleware and file processing, into Dataset metadata and preview records. Analysis requests compute summaries and store Analysis records. Visualization Studio fetches dataset columns and data samples, transforms values into chart series, and renders them using Recharts. Report requests generate a PDF, validate it, attempt Cloudinary storage, fall back locally when necessary, and save only accurate storage metadata.')
heading(d,'3.4 Authentication Flow',2); p(d,'Users authenticate through the auth routes. Protected routes use middleware to validate the authenticated user and scope dataset, report, and conversation queries to that user. JWT authentication and HTTP-only cookie behavior are preserved in the existing implementation.')
heading(d,'3.5 Technical Diagrams',2); p(d,'The following diagrams represent the implemented architecture and service boundaries. Detailed visual assets are stored in the diagrams folder.')
for name,cap in [('architecture.png','Figure 3.1 System architecture'),('flow.png','Figure 3.2 Dataset-to-report flow'),('er.png','Figure 3.3 Entity relationship overview')]:
    if (OUT/'diagrams'/name).exists(): d.add_picture(str(OUT/'diagrams'/name),width=Inches(5.8)); p(d,cap,align=WD_ALIGN_PARAGRAPH.CENTER)
heading(d,'3.6 Implementation Details',2); p(d,'The backend entry point loads environment variables before application initialization and connects to MongoDB before listening. Centralized connection management handles initial retries, driver-managed reconnection, connection status reporting, and graceful shutdown. The frontend uses Recharts ResponsiveContainer and chart-specific components for bar, horizontal bar, line, area, pie, doughnut, scatter, and histogram views.')
heading(d,'3.7 Database Design',2); table(d,['Collection','Purpose','Key relationships'],[('users','Authenticated account and profile data','Owns datasets, reports, conversations'),('datasets','Uploaded file metadata, columns, previews, and paths','References user'),('analyses','Statistics, quality results, correlations, observations','References dataset and user'),('reports','PDF metadata, storage type, URL/path, size, status','References user, dataset, analysis'),('conversations','AI chat messages and dataset context','References user and optional dataset')])
heading(d,'3.8 API Summary',2); table(d,['Area','Representative endpoints'],[('Health','GET /api/health'),('Authentication','/api/auth'),('Datasets','/api/datasets'),('Analysis','/api/analysis'),('Reports','/api/reports'),('AI','/api/ai')])

heading(d,'CHAPTER 4 RESULTS',1); heading(d,'4.1 Implemented Results',2); p(d,'The source code confirms implemented modules for dataset management, cleaning, statistical analysis, visualization, AI chat, PDF reporting, and report history. The visualization implementation supports actual selected dataset rows and includes categorical frequency aggregation for pie and doughnut charts, numeric scatter validation, and histogram bins.')
heading(d,'4.2 Test Evidence',2); table(d,['ID','Scenario','Expected result','Actual result','Status'],[('T01','Backend syntax validation','No syntax errors','Passed for modified backend files','Passed'),('T02','Frontend production build','Vite build completes','Build completed successfully','Passed'),('T03','Cloudinary configuration check','Credentials detected without printing secrets','Configuration detected in backend environment','Passed'),('T04','Cloudinary live PDF upload','Remote asset URL and public ID','Not executed in this environment','Pending'),('T05','Gemini model request','Verified response from configured key','Not executed in this environment','Pending'),('T06','Visualization browser rendering','All chart types visibly render','Not executed in browser session','Pending')])
heading(d,'4.3 Screenshots',2); p(d,'Genuine application screenshots should be inserted after running the frontend and authenticated workflow. Placeholders are intentionally retained rather than presenting simulated evidence.')
for label in ['Login or landing page','Dashboard','Dataset upload','Visualization Studio','Statistical analysis','Gemini Insight AI','PDF report history']:
    p(d,f'[Screenshot placeholder: {label}]',align=WD_ALIGN_PARAGRAPH.CENTER)
heading(d,'4.4 Limitations of Verification',2); p(d,'Live Cloudinary and Gemini calls require valid external credentials, network access, and a running authenticated application. Those tests are marked pending and must not be interpreted as successful execution.')

heading(d,'CHAPTER 5 CONCLUSION',1); heading(d,'5.1 Conclusion',2); p(d,'SmartData Insight provides an integrated workflow for converting uploaded tabular data into statistical summaries, visual exploration, AI-assisted explanations, and shareable PDF reports. The separation between deterministic analysis and optional external services improves reliability: charts and core analysis do not depend on Gemini, and reports remain available through local storage when Cloudinary is unavailable.')
heading(d,'5.2 Future Scope',2); p(d,'Future enhancements may include predictive analytics, richer statistical models, larger-scale processing, collaborative workspaces, role-based access, additional export formats, and more advanced AI-assisted insight generation. These items are future work and are not presented as current capabilities.')

heading(d,'CHAPTER 6 REFERENCES',1); refs=['React Documentation, Meta Open Source, https://react.dev/','Vite Documentation, https://vite.dev/','Node.js Documentation, https://nodejs.org/docs/latest/api/','Express.js Documentation, https://expressjs.com/','MongoDB Documentation, https://www.mongodb.com/docs/','Mongoose Documentation, https://mongoosejs.com/docs/','Google Gemini API Documentation, https://ai.google.dev/gemini-api/docs','Cloudinary Node.js Documentation, https://cloudinary.com/documentation/node_integration','PDFKit Documentation, https://pdfkit.org/','Recharts Documentation, https://recharts.org/']
for i,r in enumerate(refs,1): p(d,f'[{i}] {r}')
heading(d,'APPENDICES',1); heading(d,'Appendix A Environment Variables',2); table(d,['Variable','Purpose'],[('MONGODB_URI','MongoDB Atlas URI placeholder'),('JWT_SECRET','JWT signing secret placeholder'),('GEMINI_API_KEY','Gemini API key placeholder'),('GEMINI_MODEL','Configured Gemini model identifier'),('GEMINI_FALLBACK_MODEL','Verified fallback model identifier'),('CLOUDINARY_CLOUD_NAME','Cloudinary cloud name placeholder'),('CLOUDINARY_API_KEY','Cloudinary API key placeholder'),('CLOUDINARY_API_SECRET','Cloudinary API secret placeholder')])
heading(d,'Appendix B Execution Commands',2); p(d,'Backend: cd backend, then npm run dev. Frontend: cd frontend, then npm run dev. The backend health endpoint is available at http://localhost:5000/api/health when the server is running.')

# Header/footer and metadata
for s in d.sections:
    hp=s.header.paragraphs[0]; hp.text='SmartData Insight – AI-Powered Data Analysis and Visualization Platform'; hp.alignment=WD_ALIGN_PARAGRAPH.LEFT
    fp=s.footer.paragraphs[0]; fp.text='Dept. of CSE, M. S. Bidve Engineering College, Latur'; fp.alignment=WD_ALIGN_PARAGRAPH.LEFT
    fp.add_run('    Page ').bold=False
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); fp._p.append(fld)
d.core_properties.title='SmartData Insight Final Year Project Report'; d.core_properties.author='Tanvi Sanjay Bidve and Gauri Gawali Raju'; d.core_properties.subject='B.Tech Final Year Project Report'
d.save(OUT/'SmartData_Insight_Final_Report.docx')
print(OUT/'SmartData_Insight_Final_Report.docx')
