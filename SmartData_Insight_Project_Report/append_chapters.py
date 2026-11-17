import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from report_helpers import (
    docx_path, apply_section_layout, configure_header_footer,
    add_custom_heading, add_body_paragraph, add_bullet_point,
    add_figure_image, add_table_with_caption
)

doc = docx.Document(docx_path)

# -----------------------------------------------------------------------------
# SECTION 5: MAIN BODY (CHAPTER 1 TO 6 + REFERENCES + APPENDICES)
# Numbering: Decimal / Arabic numerals (1, 2, 3...) starting at 1
# -----------------------------------------------------------------------------
doc.add_page_break()
sec5 = doc.add_section()
apply_section_layout(sec5)
configure_header_footer(sec5, is_front_matter=False)

# =============================================================================
# CHAPTER 1 – INTRODUCTION
# =============================================================================
add_custom_heading(doc, "CHAPTER 1: INTRODUCTION", level=1, space_before=15, space_after=12)

add_custom_heading(doc, "1.1 Introduction to SmartData Insight", level=2)
add_body_paragraph(
    doc,
    "In the modern computing era, data has emerged as the principal currency of organizational intelligence and strategic planning. "
    "Every operational domain—ranging from higher education institutions and corporate human resources to retail commerce and industrial manufacturing—"
    "accumulates vast repositories of tabular records. However, raw tabular datasets, whether formatted as Comma-Separated Values (CSV) or Microsoft "
    "Excel workbooks (XLSX/XLS), inherently lack interpretability in their primitive states. Raw numbers and nominal categories do not yield "
    "immediate business or academic value without undergoing systematic exploratory data analysis (EDA), anomaly scanning, and statistical modeling."
)
add_body_paragraph(
    doc,
    "SmartData Insight – AI-Powered Data Analysis and Visualization Platform is engineered to bridge the profound chasm between raw spreadsheet "
    "ingestion and high-level strategic intelligence. Implemented as a full-stack, enterprise-grade Single Page Application (SPA) on the modern "
    "MERN architecture (MongoDB Atlas, Express.js, React 18 with Vite, and Node.js v24), SmartData Insight automates the multi-stage analytics "
    "lifecycle within a unified, web-native interface. By fusing deterministic parametric computations with the contextual intelligence of "
    "Google’s Gemini 3.8 Flash model via the Interactions API, the platform delivers zero-latency descriptive insights, robust anomaly audits, "
    "dynamic vector visualizations, and automated executive PDF dossiers."
)

add_custom_heading(doc, "1.2 Background and Motivation", level=2)
add_body_paragraph(
    doc,
    "Historically, tabular data exploration has been monopolized by desktop spreadsheet applications, predominantly Microsoft Excel. "
    "While spreadsheets democratized rudimentary arithmetic calculations in the late 20th century, their architecture was never designed for "
    "modern automated data pipelines, programmatic outlier audits, or multi-variate statistical verification. Academic investigations into spreadsheet "
    "integrity consistently reveal staggering vulnerability rates: over 88% of real-world spreadsheets contain undetected human syntax errors, "
    "faulty range selections, or silent missing-value corruptions."
)
add_body_paragraph(
    doc,
    "On the other end of the software spectrum, enterprise Business Intelligence (BI) platforms such as Tableau, Power BI, and Qlik Sense "
    "impose prohibitive per-seat licensing costs, demand steep technical onboarding curves, require heavy local client installations, and "
    "lack native, conversational artificial intelligence capabilities. Furthermore, data analysts in academic institutions and small-to-medium "
    "enterprises frequently face fragmented workflows: raw files are cleaned in one utility, statistical metrics are calculated in another, "
    "charts are plotted in a third, and executive reports are laboriously compiled by manually copying and pasting screenshots into text processors. "
    "This fragmentation motivated the design of SmartData Insight as an all-in-one, browser-accessible, secure analytical suite."
)

add_custom_heading(doc, "1.3 Problem Statement", level=2)
add_body_paragraph(
    doc,
    "The central problem addressed by this project is formulated as follows:\n\n"
    "“To design, develop, and empirically validate an integrated, web-native, AI-powered tabular analytics and visualization platform that "
    "automates the ingestion of CSV and Excel spreadsheets, detects and remediates data quality anomalies, calculates deterministic descriptive "
    "and inferential statistics, renders interactive multi-variate visualizations, provides grounded conversational reasoning via Google Gemini, "
    "and compiles print-optimized executive PDF dossiers while enforcing enterprise-grade cookie authentication and ownership isolation.”"
)

add_custom_heading(doc, "1.4 Existing Systems and Their Critical Limitations", level=2)
add_body_paragraph(
    doc,
    "Contemporary data analysis workflows typically leverage one of three paradigms, each burdened by severe operational limitations:"
)
add_bullet_point(doc, "Legacy Desktop Spreadsheets (MS Excel, LibreOffice Calc)", 
                 "Suffers from file size limits, absence of automated schema inference, vulnerability to silent copy-paste formula corruptions, "
                 "lack of immutable audit trails, and zero native conversational reasoning.")
add_bullet_point(doc, "Commercial Business Intelligence Suites (Tableau, PowerBI)", 
                 "Characterized by high licensing fees, complex semantic data modeling requirements, heavy memory footprints, and proprietary "
                 "cloud silos that lock user assets behind paywalls.")
add_bullet_point(doc, "Programmatic Notebook Environments (Jupyter, Google Colab, RStudio)", 
                 "Requires advanced programming proficiency in Python or R, demands local environment setup, lacks turnkey enterprise security, "
                 "and fails to provide intuitive interfaces for non-technical domain stakeholders.")

add_custom_heading(doc, "1.5 Proposed SmartData Insight System", level=2)
add_body_paragraph(
    doc,
    "SmartData Insight resolves the aforementioned deficiencies through a decoupled, three-tier cloud web platform. Users interact with a "
    "sleek React 18 interface styled with Tailwind CSS, communicating with an Express.js REST API over encrypted HTTPS. Authentication is "
    "secured via JSON Web Tokens stored exclusively in HTTP-only cookies, eliminating cross-site scripting (XSS) token interception risks."
)
add_body_paragraph(
    doc,
    "Upon spreadsheet upload, the system automatically parses headers, determines predominant column datatypes (number, string, boolean, date), "
    "computes completeness indices, and isolates outliers via the Interquartile Range (IQR 1.5) standard. An interactive data cleaning console allows "
    "analysts to execute missing value imputation, row deduplication, type casting, and filtering with real-time pre-commit impact simulations. "
    "Simultaneously, a deterministic statistical engine computes means, medians, variances, standard deviations, and pairwise Pearson correlations. "
    "A server-side canvas engine (@napi-rs/canvas) renders crisp PNG charts for embedding into publication-ready PDF reports via PDFKit, while "
    "an integrated Google Gemini 3.8 Flash copilot answers ad-hoc analytical queries grounded strictly in dataset records."
)

add_figure_image(doc, "figure_1_1_ecosystem.png", "Figure 1.1", "High-Level Platform Evolution and Ecosystem Overview", width_in=6.2)

add_custom_heading(doc, "1.6 Key Project Objectives", level=2)
add_body_paragraph(doc, "The concrete technical and engineering objectives of SmartData Insight comprise:")
add_bullet_point(doc, "Automated Multi-Format Ingestion", 
                 "Deliver robust drag-and-drop parsing for CSV and XLSX files with server-side MIME verification and dynamic schema inference.")
add_bullet_point(doc, "Intelligent Quality & Anomaly Auditing", 
                 "Implement mathematical algorithms to identify duplicate rows, empty cells, schema inconsistencies, and statistical outliers.")
add_bullet_point(doc, "Interactive Pre-Commit Data Cleaning", 
                 "Provide a visual workspace supporting imputation (Mean/Median/Mode), row dropping, type casting, and column pruning with audit rollback.")
add_bullet_point(doc, "Deterministic Parametric Modeling", 
                 "Compute exact sample means, medians, standard deviations, quartiles, and Pearson correlation matrices (r between -1.0 and +1.0).")
add_bullet_point(doc, "Multi-Variate Graphical Visualization", 
                 "Render high-performance client-side and server-side visual charts including donut/pie charts, frequency histograms, and scatter plots.")
add_bullet_point(doc, "Grounded AI Conversational Intelligence", 
                 "Integrate Google Gemini 3.8 Flash via the Interactions API to produce grounded natural language summaries without hallucinations.")
add_bullet_point(doc, "Publication-Ready Multi-Page PDF Dossiers", 
                 "Engineer a server-side PDFKit generation pipeline utilizing an innovative page layout manager that guarantees zero blank pages.")
add_bullet_point(doc, "Enterprise Cookie-Based Security", 
                 "Protect all REST endpoints through JWT authentication transmitted via secure, HTTP-only, SameSite cookies.")

add_custom_heading(doc, "1.7 Scope of the Project", level=2)
add_body_paragraph(
    doc,
    "The operational scope encompasses end-to-end tabular file processing up to 50MB per dataset, supporting both local server storage and "
    "cloud storage in MongoDB Atlas and Cloudinary. The platform accommodates multi-tenant user isolation, ensuring that registered analysts "
    "access exclusively their own datasets, analytical models, chat histories, and PDF reports. The out-of-scope boundaries exclude real-time "
    "streaming sensor data ingestion (e.g., Apache Kafka pipelines) and deep neural network image/video classification, keeping the architecture "
    "hyper-specialized for structured tabular business and scientific data."
)

add_custom_heading(doc, "1.8 Applications and Target Industry Domains", level=2)
add_body_paragraph(
    doc,
    "SmartData Insight is purposefully designed for wide-scale deployment across multiple operational sectors:"
)
add_bullet_point(doc, "Academic & Institutional Research", 
                 "Enables university faculties and students to rapidly analyze examination scores, demographic performance, and thesis survey data.")
add_bullet_point(doc, "Corporate Human Resources & Payroll", 
                 "Empowers HR managers to audit employee attrition, salary bands, performance metrics, and departmental headcount distributions.")
add_bullet_point(doc, "Retail & Commercial Sales Intelligence", 
                 "Allows sales directors to evaluate regional revenue trends, product category margins, customer ratings, and volume dependencies.")
add_bullet_point(doc, "Healthcare & Clinical Trials", 
                 "Facilitates exploratory screening of patient cohort telemetry, biometric distributions, and treatment efficacy indicators.")

add_custom_heading(doc, "1.9 Organization of the Project Report", level=2)
add_body_paragraph(
    doc,
    "This report is systematically structured into six cohesive chapters:\n"
    "• Chapter 1 provides the introductory context, motivation, problem statement, objectives, and scope.\n"
    "• Chapter 2 presents a rigorous literature survey, historical overview, comparative analysis, and feasibility study.\n"
    "• Chapter 3 details the system requirements, architecture, UML modeling, technological foundation, and modular implementation.\n"
    "• Chapter 4 presents the experimental test execution, real-world benchmark results, statistical graphics, and UI screenshots.\n"
    "• Chapter 5 concludes the treatise with key achievements, advantages, current limitations, and future research directions.\n"
    "• Chapter 6 lists formal IEEE-standard bibliographic references, followed by appendices containing code snippets and API specs."
)

doc.save(docx_path)
print("Chapter 1 appended successfully.")
