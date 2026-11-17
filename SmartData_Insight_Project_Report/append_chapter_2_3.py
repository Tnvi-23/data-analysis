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

# =============================================================================
# CHAPTER 2 – PROJECT OVERVIEW & LITERATURE SURVEY
# =============================================================================
add_custom_heading(doc, "CHAPTER 2: PROJECT OVERVIEW & LITERATURE SURVEY", level=1, space_before=18, space_after=12)

add_custom_heading(doc, "2.1 Historical Overview of Tabular Data Processing", level=2)
add_body_paragraph(
    doc,
    "The systematic digital manipulation of structured tabular records commenced with the release of VisiCalc in 1979 for the Apple II computer, "
    "which introduced the two-dimensional cell grid abstraction. This paradigm was subsequently refined by Lotus 1-2-3 in 1983 and fully institutionalized "
    "by Microsoft Excel in 1985. For over four decades, the spreadsheet matrix of intersecting columns and rows served as the universal lingua franca "
    "for accounting, inventory tracking, and scientific recordkeeping. However, as business datasets exponentially expanded in dimensionality and record volume, "
    "the fundamental limitations of the standalone desktop spreadsheet architecture became increasingly acute."
)
add_body_paragraph(
    doc,
    "During the early 2000s, the emergence of Relational Database Management Systems (RDBMS) such as PostgreSQL, MySQL, and Oracle Database separated "
    "persistent data storage from user presentation. Concurrently, Business Intelligence (BI) platforms like Tableau (founded 2003) and Microsoft Power BI (2015) "
    "introduced drag-and-drop dashboarding, multi-table relationship modeling, and in-memory columnar compression. While these enterprise tools revolutionized "
    "corporate dashboarding, they remained divorced from modern artificial intelligence reasoning and imposed steep operational hurdles for everyday data practitioners."
)

add_custom_heading(doc, "2.2 Evolution of Spreadsheets and Structural Constraints", level=2)
add_body_paragraph(
    doc,
    "Despite their enduring popularity, empirical research into spreadsheet integrity demonstrates severe structural vulnerabilities inherent to "
    "their design. The Panko Spreadsheet Research Group (University of Hawaii) synthesized empirical auditing data revealing that between 88% and 94% "
    "of operational corporate spreadsheets contain human formula errors. These critical failure modes stem directly from the following architectural flaws:"
)
add_bullet_point(doc, "Silent Type Mixing & Implicit Conversions", 
                 "Spreadsheets lack strict columnar type definitions; a single column can inadvertently store integers, text strings, and scientific "
                 "notations simultaneously, causing silent calculation dropouts without warning.")
add_bullet_point(doc, "Fragile Manual Range References", 
                 "Formulas rely on static coordinate ranges (e.g., =SUM(C2:C50)); inserting new records outside designated coordinates silently excludes "
                 "critical observations from downstream totals.")
add_bullet_point(doc, "Absence of Immutable Audit Logging", 
                 "Manual cell edits overwrite previous values destructively, leaving no cryptographic or versioned provenance trail to audit who altered "
                 "a value, when, or why.")
add_bullet_point(doc, "Total Lack of Statistical Anomaly Auditing", 
                 "Spreadsheets perform no automated Interquartile Range (IQR) outlier screening or schema completeness scoring, requiring analysts to "
                 "manually invent bespoke macro routines.")

add_figure_image(doc, "figure_2_1_evolution.png", "Figure 2.1", "Evolution from Traditional Spreadsheets to AI-Powered Platforms", width_in=6.2)

add_custom_heading(doc, "2.3 Modern AI-Powered Analytical Architectures", level=2)
add_body_paragraph(
    doc,
    "The advent of Large Language Models (LLMs), culminating in Google’s Gemini multimodal family and OpenAI’s GPT architectures, has inaugurated "
    "the third epoch of exploratory data analysis: Conversational, Grounded Analytics. Instead of forcing human analysts to translate high-level inquiries "
    "into arcane SQL queries or convoluted Python pandas scripts, modern analytical architectures harness natural language reasoning."
)
add_body_paragraph(
    doc,
    "However, integrating generative LLMs directly into quantitative analytical pipelines introduces a notorious software hazard: hallucination. "
    "When naive systems prompt language models with unvetted data, models frequently confabulate mathematical metrics or misquote statistical figures. "
    "SmartData Insight resolves this existential risk through a hybrid 'Deterministic Engine + Grounded AI' paradigm. All quantitative computations "
    "(Means, Medians, Variances, Standard Deviations, Quartiles, Outlier Bounds, and Pearson Correlations) are computed deterministically by verified Node.js "
    "mathematical algorithms. The resulting exact numerical summary is then fed as strict contextual grounding into Google’s Gemini 3.8 Flash Interactions API. "
    "The AI model is constrained strictly to narrative explanation, strategic commentary, and natural language query answering, guaranteeing 100% numerical fidelity."
)

add_custom_heading(doc, "2.4 Comprehensive Feasibility Study", level=2)
add_body_paragraph(
    doc,
    "Prior to commencing system development, a comprehensive tripartite feasibility study was conducted across technical, economic, and operational dimensions."
)
add_bullet_point(doc, "2.4.1 Technical Feasibility", 
                 "The development team assessed the technical viability of the MERN stack. React 18 with Vite provides a lightning-fast virtual DOM, "
                 "Node.js v24 offers high-throughput asynchronous non-blocking I/O for streaming file parsing via Multer and CSV-Parser, and MongoDB Atlas "
                 "delivers flexible, schema-agnostic JSON document persistence. The availability of @napi-rs/canvas for high-speed, headless server-side "
                 "PNG rasterization and PDFKit for vector PDF generation confirmed that all technical dependencies could be harmoniously unified.")
add_bullet_point(doc, "2.4.2 Economic & Financial Feasibility", 
                 "The proposed architecture utilizes entirely open-source, permissive MIT/Apache-2.0 licensed software components. MongoDB Atlas offers "
                 "a perpetual free tier cluster sufficient for development and academic benchmarking, Cloudinary provides a generous free tier for PDF storage, "
                 "and Google Gemini 3.8 Flash delivers industry-leading cost-efficiency per million tokens. The total capital expenditure required for system "
                 "implementation is effectively zero, making the project exceptionally viable economically.")
add_bullet_point(doc, "2.4.3 Operational & Human Feasibility", 
                 "The user interface is designed in accordance with modern Nielsen-Norman UX heuristics. The system requires zero desktop installation, "
                 "operating ubiquitously across Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari on Windows, macOS, and Linux. Non-technical "
                 "users can effortlessly drag and drop spreadsheets, view automated quality audits, and obtain executive intelligence without writing a single line of code.")

add_custom_heading(doc, "2.5 Comparative Analysis of Contemporary Analytics Platforms", level=2)
add_body_paragraph(
    doc,
    "To establish a clear academic baseline, Table 2.1 presents a multi-attribute comparative matrix contrasting SmartData Insight against "
    "conventional desktop spreadsheets, commercial BI suites, and programmatic notebook environments."
)

comp_headers = ["Feature Attribute", "MS Excel / Spreadsheets", "Tableau / Power BI", "Jupyter Notebooks", "SmartData Insight (Proposed)"]
comp_data = [
    ["Deployment Model", "Desktop / Proprietary Web", "Desktop + Enterprise Server", "Local / Managed Cloud", "Cloud Web SPA (React + Node)"],
    ["Licensing Cost", "Paid (Office 365 License)", "Expensive ($70+/user/month)", "Free (Open-Source)", "Open-Source / Zero Cost"],
    ["Automated Anomaly Audit", "None (Manual Macros)", "Limited Data Profiler", "Manual (Pandas Scripting)", "Automated (IQR 1.5 + Completeness)"],
    ["Pre-Commit Cleaning", "Destructive In-Place Edit", "Power Query ETL Pipeline", "Manual Code Execution", "Visual Console + Live Simulation"],
    ["Statistical Modeling", "Formula-based (=AVERAGE)", "DAX / Calculated Fields", "NumPy / SciPy Libraries", "Automated Deterministic Matrix"],
    ["Grounded Conversational AI", "None / Copilot Add-on", "Copilot (Paid Enterprise)", "Manual LLM API Integration", "Built-in Gemini 3.8 Flash Copilot"],
    ["PDF Dossier Compilation", "Manual Print to PDF", "Dashboard Export (Static)", "nbconvert (Code + Output)", "Automated PDFKit Vector Dossier"],
    ["Blank Page Layout Guard", "Not Applicable", "Frequent Pagination Cuts", "Poor Pagination Support", "Zero Blank Page Layout Manager"],
    ["Session Security Model", "File-level Password", "SAML / OAuth Enterprise", "Token-based / Local Port", "JWT via Secure HTTP-Only Cookies"],
    ["Target User Expertise", "General Office Workers", "Trained BI Developers", "Data Scientists / Programmers", "Students, Analysts & Executives"]
]
add_table_with_caption(doc, "Table 2.1", "Comparative Evaluation: Spreadsheets vs. BI Tools vs. SmartData Insight", comp_headers, comp_data, col_widths=[1.2, 1.2, 1.3, 1.2, 1.4])

add_custom_heading(doc, "2.6 Identified Research Gaps and Project Motivation", level=2)
add_body_paragraph(
    doc,
    "The literature survey and comparative study exposed four pronounced research and technological gaps:\n"
    "1. The Anomaly Detection Gap: Spreadsheets fail to provide automated outlier bounds or missing cell alerts upon initial ingestion.\n"
    "2. The Cognitive Interpretation Gap: Statistical outputs (e.g., standard deviation = 14.38, Pearson r = 0.99) remain unintelligible to domain "
    "stakeholders without contextual, grounded narrative synthesis.\n"
    "3. The Report Automation Gap: Generating publication-grade executive PDF summaries requires tedious manual copy-pasting, frequently yielding "
    "formatting clipping and trailing blank pages.\n"
    "4. The Security Gap: Web analytical applications frequently store authentication tokens in vulnerable LocalStorage, exposing sessions to cross-site scripting.\n\n"
    "SmartData Insight is purposefully architected to eliminate these four critical gaps simultaneously."
)

# =============================================================================
# CHAPTER 3 – DESCRIPTION OF WORK (SYSTEM DESIGN & IMPLEMENTATION)
# =============================================================================
add_custom_heading(doc, "CHAPTER 3: DESCRIPTION OF WORK (SYSTEM DESIGN & IMPLEMENTATION)", level=1, space_before=18, space_after=12)

add_custom_heading(doc, "3.1 Software Requirements Specification (SRS)", level=2)
add_body_paragraph(
    doc,
    "The Software Requirements Specification establishes the precise functional boundaries, behavioral contracts, and non-functional performance "
    "standards governing the SmartData Insight platform."
)

add_custom_heading(doc, "3.1.1 Functional Requirements", level=3)
add_bullet_point(doc, "FR-1: User Authentication & Profile Governance", 
                 "The system shall provide user registration and login endpoints utilizing Bcrypt password hashing (salt rounds = 10) and issue "
                 "signed JSON Web Tokens transmitted exclusively via HTTP-only, SameSite cookies with a 7-day expiration.")
add_bullet_point(doc, "FR-2: Multi-Format Spreadsheet Ingestion", 
                 "The system shall accept multipart/form-data uploads of CSV, XLSX, and XLS files up to 50MB, validating MIME types and normalizing "
                 "headers into standardized UTF-8 string keys.")
add_bullet_point(doc, "FR-3: Dynamic Schema & Type Profiling", 
                 "The system shall inspect column values to infer predominant datatypes (number, string, boolean, date) using a 70% threshold rule.")
add_bullet_point(doc, "FR-4: Automated Data Quality Auditing", 
                 "The system shall scan ingested tables to calculate missing cell counts, duplicate rows, data completeness percentage, and "
                 "Interquartile Range (IQR 1.5) statistical outlier counts.")
add_bullet_point(doc, "FR-5: Interactive Data Cleaning & Transformation", 
                 "The system shall provide visual operations for dropping missing rows, mean/median/mode statistical imputation, deduplication, "
                 "type casting, and column deletion with pre-commit impact simulation and audit rollback.")
add_bullet_point(doc, "FR-6: Parametric Statistical Analysis", 
                 "The system shall compute deterministic descriptive statistics including Count, Mean, Median, Mode, Min, Max, Range, Variance, "
                 "Standard Deviation, Q1, Q3, and IQR for all continuous numerical features.")
add_bullet_point(doc, "FR-7: Bivariate Pearson Correlation Matrix", 
                 "The system shall calculate pairwise Pearson correlation coefficients (r between -1.00 and +1.00) across all numerical attributes.")
add_bullet_point(doc, "FR-8: Multi-Variate Vector Visualization", 
                 "The system shall render client-side interactive charts and generate server-side high-resolution PNG chart buffers (@napi-rs/canvas) "
                 "for donut/pie distributions, frequency histograms, and correlation bars.")
add_bullet_point(doc, "FR-9: Grounded Gemini Conversational AI", 
                 "The system shall interface with Google Gemini 3.8 Flash via the Interactions API to produce grounded natural language executive "
                 "summaries and respond to multi-turn conversational queries.")
add_bullet_point(doc, "FR-10: Publication-Ready Executive PDF Dossier Compilation", 
                 "The system shall compile multi-page PDF reports via PDFKit incorporating brand headers, executive summaries, data quality boxes, "
                 "statistical tables, embedded canvas chart buffers, and strategic recommendations, with guaranteed zero blank pages.")

add_custom_heading(doc, "3.1.2 Non-Functional Requirements", level=3)
add_bullet_point(doc, "NFR-1: Security & Confidentiality", 
                 "Passwords must never be stored in plaintext. JWT secrets must remain confined to backend environment configurations. "
                 "Cross-Origin Resource Sharing (CORS) and Helmet security headers must be enforced.")
add_bullet_point(doc, "NFR-2: Performance & Analytical Latency", 
                 "Descriptive statistical computations for datasets containing up to 100,000 cells must complete within 500 milliseconds. "
                 "PDF report generation and canvas rasterization must finalize within 1.5 seconds.")
add_bullet_point(doc, "NFR-3: Reliability & Fault Tolerance", 
                 "The backend must gracefully intercept malformed spreadsheet inputs, database timeouts, and external API failures without crashing. "
                 "Cloudinary upload failures must automatically fall back to secure local disk persistence.")
add_bullet_point(doc, "NFR-4: Usability & Accessibility", 
                 "The React frontend must provide responsive, mobile-compatible layouts with intuitive loading skeletons, empty states, and toast notifications.")

add_custom_heading(doc, "3.1.3 Hardware & Infrastructure Specifications", level=3)
add_body_paragraph(doc, "Table 3.1 delineates the minimum and recommended hardware specifications for deploying and operating the platform.")
hw_headers = ["Hardware Component", "Minimum Client Specification", "Recommended Server Deployment Environment"]
hw_data = [
    ["Central Processing Unit (CPU)", "Dual-Core 2.0 GHz x86/ARM Processor", "Quad-Core Intel Xeon / AMD EPYC (2.5 GHz+)"],
    ["Random Access Memory (RAM)", "4 GB DDR3 / DDR4 Memory", "8 GB - 16 GB DDR4/DDR5 ECC RAM"],
    ["Persistent Disk Storage", "500 MB Free Browser Storage", "20 GB SSD / NVMe Storage (for dataset & PDF archives)"],
    ["Network Bandwidth", "1.0 Mbps Broadband Internet", "100 Mbps Dedicated Symmetrical Connection"],
    ["Display Resolution", "1280 × 720 (HD Ready)", "1920 × 1080 (Full HD Optimized)"]
]
add_table_with_caption(doc, "Table 3.1", "Minimum and Recommended Hardware Specifications", hw_headers, hw_data, col_widths=[1.5, 2.3, 2.5])

add_custom_heading(doc, "3.1.4 Software Environment & Dependencies", level=3)
add_body_paragraph(doc, "Table 3.2 enumerates the foundational software operating environment, compilers, runtimes, and external cloud services.")
sw_headers = ["Software Layer", "Framework / Technology", "Version / Release", "Operational Role in Architecture"]
sw_data = [
    ["Operating System", "Microsoft Windows / Linux / macOS", "Windows 11 / Ubuntu 22.04 LTS", "Host operating system environment"],
    ["Runtime Environment", "Node.js (LTS Engine)", "v24.19.0+", "Asynchronous server-side JavaScript runtime"],
    ["Backend Framework", "Express.js", "v4.21.2 / v5.3.0", "RESTful routing, middleware orchestration & HTTP server"],
    ["Database Server", "MongoDB Atlas (Mongoose ODM)", "MongoDB v8.0 / Mongoose v8.10+", "Cloud NoSQL document database & ODM schema modeling"],
    ["Frontend Framework", "React.js + Vite Bundler", "React v18.3+ / Vite v8.3+", "Component-driven virtual DOM rendering & SPA bundle build"],
    ["UI Styling Engine", "Tailwind CSS + Lucide React", "Tailwind v3.4+ / Lucide v0.4+", "Utility-first responsive styling and vector iconography"],
    ["Server Canvas Engine", "@napi-rs/canvas", "v0.1.60+", "Prebuilt native headless Canvas 2D engine for chart rasterization"],
    ["PDF Generation Library", "PDFKit", "v0.16.0+", "Streaming programmatic PDF generation engine"],
    ["AI Intelligence Engine", "Google Gemini 3.8 Flash SDK", "@google/genai v0.1+", "Interactions API for grounded contextual analytical reasoning"],
    ["Cloud Document Archive", "Cloudinary SDK", "v2.5.1+", "Cloud storage, asset tagging, and CDN delivery for PDF reports"]
]
add_table_with_caption(doc, "Table 3.2", "Software Environment and External Cloud Dependencies", sw_headers, sw_data, col_widths=[1.4, 1.8, 1.2, 1.9])

doc.save(docx_path)
print("Chapter 2 and Chapter 3.1 appended successfully.")
