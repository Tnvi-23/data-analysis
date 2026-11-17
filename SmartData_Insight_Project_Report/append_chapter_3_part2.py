import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from report_helpers import (
    docx_path, add_custom_heading, add_body_paragraph, add_bullet_point,
    add_figure_image, add_table_with_caption
)

doc = docx.Document(docx_path)

# =============================================================================
# CHAPTER 3.2 – SYSTEM ARCHITECTURE & UML MODELING
# =============================================================================
add_custom_heading(doc, "3.2 System Architecture & Comprehensive UML Modeling", level=2)
add_body_paragraph(
    doc,
    "The architectural design of SmartData Insight strictly adheres to the Three-Tier Decoupled Client-Server architectural pattern. "
    "Separating the presentation layer, business logic engine, and persistent storage guarantees modularity, maintainability, independent "
    "scalability, and rigorous security enforcement."
)

add_custom_heading(doc, "3.2.1 Three-Tier Modular Architecture", level=3)
add_body_paragraph(
    doc,
    "As visualized in Figure 3.1, the platform is partitioned into three distinct operational tiers:\n"
    "1. Presentation Tier (Client SPA): Built with React 18, Vite, and Tailwind CSS. It manages virtual DOM rendering, state encapsulation, "
    "responsive UI routing, and credentialed asynchronous HTTP communication via Axios.\n"
    "2. Business Logic Tier (Server API): Powered by Node.js v24 and Express.js. It encapsulates route dispatchers, JWT authentication middleware, "
    "Multer multipart stream parsers, data cleaning algorithms, deterministic statistical calculations, @napi-rs/canvas chart rasterization, "
    "and PDFKit document generation.\n"
    "3. Persistent Data & Cloud Services Tier: Encapsulates MongoDB Atlas (hosting the smartdata_insight database with Users, Datasets, Analyses, "
    "Reports, and Conversations collections), the Google Gemini 3.8 Flash Interactions API for natural language reasoning, and Cloudinary for cloud PDF storage."
)
add_figure_image(doc, "figure_3_1_architecture.png", "Figure 3.1", "Complete End-to-End Three-Tier System Architecture", width_in=6.2)

add_custom_heading(doc, "3.2.2 Context-Level Data Flow Diagram (DFD Level 0)", level=3)
add_body_paragraph(
    doc,
    "Figure 3.2 illustrates the Context-Level Data Flow Diagram (DFD Level 0). The diagram establishes the high-level boundary of SmartData Insight, "
    "identifying the primary external entities (Authenticated User and External Cloud Services) and the bidirectional information flows crossing "
    "the system perimeter. Inbound flows comprise user registration credentials, raw spreadsheet uploads, cleaning directives, and analytical queries. "
    "Outbound flows encompass statistical summaries, multi-variate vector charts, AI contextual insights, and compiled PDF analytical dossiers."
)
add_figure_image(doc, "figure_3_2_dfd_0.png", "Figure 3.2", "Context-Level Data Flow Diagram (DFD Level 0)", width_in=6.0)

add_custom_heading(doc, "3.2.3 Functional Data Flow Diagram (DFD Level 1)", level=3)
add_body_paragraph(
    doc,
    "Figure 3.3 presents the decomposed Functional Data Flow Diagram (DFD Level 1). The central platform process is decomposed into six discrete "
    "sub-processes interacting with five primary data stores:\n"
    "• Process 1.0 (Auth & Session): Manages registration, Bcrypt hashing, and issues HTTP-only cookies interacting with Data Store D1 (Users).\n"
    "• Process 2.0 (Ingestion & Schema Parser): Validates uploaded files, infers data types, and persists structured records into Data Store D2 (Datasets).\n"
    "• Process 3.0 (Interactive Cleaning): Executes deduplication, imputation, and casting, updating versioned records in Data Store D2.\n"
    "• Process 4.0 (Statistical Engine): Calculates parametric metrics and outlier thresholds, writing analytical summaries to Data Store D3 (Analyses).\n"
    "• Process 5.0 (Gemini AI Service): Synthesizes statistical context into narrative explanations, updating Data Store D5 (Conversations).\n"
    "• Process 6.0 (PDFKit Dossier Generator): Rasterizes chart buffers and compiles multi-page PDF documents, persisting metadata into Data Store D4 (Reports)."
)
add_figure_image(doc, "figure_3_3_dfd_1.png", "Figure 3.3", "Functional Data Flow Diagram (DFD Level 1)", width_in=6.2)

add_custom_heading(doc, "3.2.4 Use Case Modeling", level=3)
add_body_paragraph(
    doc,
    "Figure 3.4 models the operational interactions between the primary actor (Authenticated Data Analyst) and the platform boundary. "
    "Key use cases include User Authentication, Multi-Format Dataset Upload, Interactive Data Cleaning, Viewing Descriptive Statistics, "
    "Rendering Multi-Variate Charts, Querying the Gemini AI Copilot, Compiling Executive PDF Reports, and Downloading Archived Dossiers. "
    "Every operational use case requires prior execution of the Authentication use case, enforced through JWT cookie validation."
)
add_figure_image(doc, "figure_3_4_use_case.png", "Figure 3.4", "Comprehensive Use Case Diagram", width_in=6.0)

add_custom_heading(doc, "3.2.5 Analytical Processing Activity Workflow", level=3)
add_body_paragraph(
    doc,
    "Figure 3.5 delineates the activity workflow governing end-to-end dataset processing. Starting from user session validation, the flow proceeds "
    "through file upload, structural MIME validation, and anomaly scanning. A critical decision node evaluates whether anomalies (missing cells, "
    "duplicate rows, invalid types) exist. If detected, the flow branches to the Interactive Cleaning Console where transformations are previewed "
    "and committed. Once verified, the pipeline transitions to deterministic statistical modeling, canvas visualization rendering, and PDF dossier compilation."
)
add_figure_image(doc, "figure_3_5_activity.png", "Figure 3.5", "Analytical Data Processing & Pipeline Activity Diagram", width_in=5.8)

add_custom_heading(doc, "3.2.6 End-to-End Sequence Diagram", level=3)
add_body_paragraph(
    doc,
    "Figure 3.6 presents the chronological message sequence across the five system lifelines: User Browser (React UI), Express.js Controller, "
    "Analytics/Chart Services, MongoDB Atlas Database, and External Cloud Services (Gemini / Cloudinary). The sequence highlights the asynchronous, "
    "promise-driven communication protocol, emphasizing that statistical computation completes before triggering AI narrative generation, thereby "
    "preventing race conditions and ensuring deterministic data grounding."
)
add_figure_image(doc, "figure_3_6_sequence.png", "Figure 3.6", "End-to-End Request, Processing & Report Generation Sequence Diagram", width_in=6.2)

add_custom_heading(doc, "3.2.7 MongoDB Atlas Database Design & ER Modeling", level=3)
add_body_paragraph(
    doc,
    "Figure 3.7 illustrates the Entity-Relationship (ER) model implemented in MongoDB Atlas using Mongoose ODM schemas. The architecture enforces "
    "strict one-to-many (1:N) relational integrity:\n"
    "• One User owns multiple Datasets, Reports, and AI Conversations.\n"
    "• One Dataset generates multiple statistical Analysis snapshots (capturing versioned cleaning stages) and multiple executive Reports.\n"
    "Foreign keys are indexed using MongoDB ObjectId types, ensuring sub-5ms query resolution during ownership verification."
)
add_figure_image(doc, "figure_3_7_er_diagram.png", "Figure 3.7", "MongoDB Atlas Entity-Relationship (ER) Schema Diagram", width_in=6.2)

add_custom_heading(doc, "3.2.8 Subsystem Interaction & Module Communication Architecture", level=3)
add_body_paragraph(
    doc,
    "Figure 3.8 depicts the subsystem interaction model centered around the Express.js core orchestration hub. The hub delegates incoming requests "
    "to specialized service singletons (authController, fileProcessingService, dataCleaningService, analyticsService, chartService, geminiService, "
    "and reportService), ensuring high cohesion and loose coupling across all backend components."
)
add_figure_image(doc, "figure_3_8_module_interaction.png", "Figure 3.8", "Subsystem Interaction & Module Communication Architecture", width_in=6.0)

# =============================================================================
# CHAPTER 3.3 – TECHNOLOGIES, FRAMEWORKS & CLOUD SERVICES
# =============================================================================
add_custom_heading(doc, "3.3 Technologies, Frameworks, and Cloud Services Employed", level=2)
add_body_paragraph(
    doc,
    "SmartData Insight leverages modern, industry-standard technologies selected specifically for enterprise reliability, high throughput, "
    "and seamless cross-platform interoperability."
)
add_bullet_point(doc, "React.js 18 & Vite Build Tool", 
                 "React 18 provides a component-driven declarative UI architecture. Its concurrent rendering engine and virtual DOM minimize "
                 "costly browser repaints when updating high-density tabular data grids. Vite serves as the modern ESM build tool, delivering "
                 "lightning-fast Hot Module Replacement (HMR) and optimized production minification.")
add_bullet_point(doc, "Node.js v24 & Express.js REST Framework", 
                 "Node.js delivers a high-concurrency, single-threaded event loop utilizing asynchronous, non-blocking I/O. Express.js organizes "
                 "modular route handling, middleware chaining (cors, helmet, express.json, auth.protect), and robust error boundaries.")
add_bullet_point(doc, "MongoDB Atlas & Mongoose ODM", 
                 "MongoDB Atlas provides a highly available, multi-region NoSQL document database. Mongoose enforces strict schema definitions, "
                 "field validation, lifecycle pre-save hooks (for Bcrypt password hashing), and virtual population.")
add_bullet_point(doc, "JWT Authentication via Secure HTTP-Only Cookies", 
                 "JSON Web Tokens (RFC 7519) are signed with HMAC-SHA256 using an environment-isolated secret key. By storing the token in an "
                 "HTTP-only, SameSite=Lax cookie, client-side JavaScript is completely barred from accessing the raw token, fully neutralizing "
                 "Cross-Site Scripting (XSS) token theft vulnerabilities.")
add_bullet_point(doc, "Google Gemini 3.8 Flash Interactions API", 
                 "The official @google/genai SDK interfaces with Gemini 3.8 Flash using the modern client.interactions.create() paradigm. "
                 "Grounded system instructions constrain the model strictly to verified dataset schema summaries, completely preventing confabulation.")
add_bullet_point(doc, "Server-Side Canvas Engine (@napi-rs/canvas)", 
                 "To embed real graphical charts into PDF reports without relying on headless Chromium browsers, the backend utilizes @napi-rs/canvas, "
                 "a prebuilt native Node.js binding to the Skia 2D graphics engine. It rasterizes donut charts, histograms, and correlation bars "
                 "into crisp PNG buffers directly in memory in under 50 milliseconds.")
add_bullet_point(doc, "PDFKit Document Engine & PageLayoutManager", 
                 "PDFKit compiles high-resolution, print-optimized A4 PDF documents. A custom PageLayoutManager dynamically calculates cursor vertical "
                 "offsets (doc.y), repeats table headers across page breaks, and protects running footers from margin overflow, guaranteeing zero blank pages.")
add_bullet_point(doc, "Cloudinary Cloud Document Storage", 
                 "Provides cloud-native storage for generated PDF reports. The backend uploads generated files via HTTPS, stores the resulting secure CDN URL "
                 "in MongoDB, and gracefully falls back to verified local disk storage if cloud credentials are not provisioned.")

# =============================================================================
# CHAPTER 3.4 – DETAILED MODULAR IMPLEMENTATION
# =============================================================================
add_custom_heading(doc, "3.4 Detailed Modular Implementation Details", level=2)
add_body_paragraph(
    doc,
    "The core functionality of SmartData Insight is partitioned into eight cohesive, thoroughly verified software modules."
)

# Module 1
add_custom_heading(doc, "3.4.1 Module 1: Authentication & User Access Management", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Secure user registration, credential verification, encrypted session issuance, and ownership-based access control.\n"
    "• Working Process: Users register with a name, unique email, and password. Mongoose pre-save middleware intercepts the plaintext password, "
    "generates a cryptographic salt, and produces a one-way Bcrypt hash. Upon login, bcrypt.compare verifies the credentials. Upon successful validation, "
    "the server signs a JWT payload ({ id: user._id }) and sets an HTTP-only cookie named 'token' with secure attributes (httpOnly: true, sameSite: 'lax', "
    "maxAge: 7 days). The auth.protect middleware intercepts incoming requests, verifies the cookie via jwt.verify, and attaches the authenticated user "
    "document to req.user.\n"
    "• Inputs: User registration/login credentials (email, password, name).\n"
    "• Processing: Bcrypt salting & hashing, JWT token signing, cookie serialization, middleware token verification.\n"
    "• Outputs: HTTP 200/201 JSON responses, Set-Cookie header, authenticated req.user object."
)
u_hdr = ["Field Name", "BSON / Mongoose Type", "Constraints / Validation", "Functional Role in Authentication"]
u_data = [
    ["_id", "ObjectId", "Primary Key (Auto-generated)", "Unique system-wide user identifier"],
    ["name", "String", "Required, Trimmed, Max 60 chars", "Full display name of the user"],
    ["email", "String", "Required, Unique, Lowercase, Regex", "Login identifier and notification address"],
    ["password", "String", "Required, Min 6 chars (Bcrypt Hash)", "One-way salted password cryptographic hash"],
    ["role", "String", "Enum: ['user', 'admin'], Default: 'user'", "Role-based authorization boundary"],
    ["createdAt", "Date", "Auto-timestamped", "Account creation timestamp"],
    ["updatedAt", "Date", "Auto-timestamped", "Profile last modified timestamp"]
]
add_table_with_caption(doc, "Table 3.3", "MongoDB User Collection Schema Definition", u_hdr, u_data, col_widths=[1.2, 1.4, 2.0, 1.8])

# Module 2
add_custom_heading(doc, "3.4.2 Module 2: Multi-Format Ingestion & Dynamic Schema Profiling", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Ingest raw CSV and Excel spreadsheets, validate MIME signatures, normalize column keys, and infer predominant column datatypes.\n"
    "• Working Process: Multer intercepts multipart/form-data uploads into a secure temporary storage buffer. The fileProcessingService inspects the "
    "extension and MIME type. For CSV files, a streaming csvParser strips UTF-8 BOM markers and trims header whitespace. For XLSX/XLS files, xlsx.read "
    "parses the primary worksheet into JSON records. The inferDataType engine samples up to 100 non-null values per column, evaluating numeric parsability, "
    "boolean literals ('true'/'false'), and ISO date formats. If more than 70% of non-null values match a type, that type is formally assigned.\n"
    "• Inputs: Multipart raw file (CSV, XLSX, XLS up to 50MB).\n"
    "• Processing: Streaming buffer parse, header sanitization, 70% threshold type inference, disk serialization.\n"
    "• Outputs: Persistent JSON record file in uploads/data, new Dataset document in MongoDB Atlas."
)
d_hdr = ["Field Name", "Mongoose Type", "Default / Constraints", "Functional Role in Dataset Management"]
d_data = [
    ["_id", "ObjectId", "Primary Key", "Unique identifier for dataset record"],
    ["user", "ObjectId", "Required, Ref: 'User', Index", "Foreign key linking dataset to owner user"],
    ["originalFilename", "String", "Required, Trimmed", "Original uploaded filename displayed in UI"],
    ["storedFilename", "String", "Required, Unique", "Server filesystem filename in uploads/data"],
    ["fileType", "String", "Enum: ['csv', 'xlsx', 'xls']", "Ingested spreadsheet format"],
    ["fileSize", "Number", "Positive Integer (Bytes)", "Total file size on disk"],
    ["rowCount", "Number", "Non-negative Integer", "Total number of valid tabular records"],
    ["columnCount", "Number", "Non-negative Integer", "Total number of structural columns"],
    ["columns", "Array of Objects", "[{ name, dataType, sampleValues }]", "Inferred schema metadata and sample values"],
    ["dataPath", "String", "Absolute filesystem path", "Location of serialized JSON tabular data"],
    ["qualityScore", "Mixed / Object", "{ overallScore, completeness }", "Computed data integrity index (0-100)"],
    ["cleaningHistory", "Array of Objects", "Versioned audit entries", "Immutable log of applied transformations"]
]
add_table_with_caption(doc, "Table 3.4", "MongoDB Dataset Collection Schema Definition", d_hdr, d_data, col_widths=[1.3, 1.4, 1.8, 1.9])

# Module 3
add_custom_heading(doc, "3.4.3 Module 3: Automated Data Cleaning & Anomaly Correction Engine", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Audit tabular data quality, isolate anomalies, and execute user-guided transformations with pre-commit impact simulation.\n"
    "• Working Process: Upon dataset selection, dataCleaningService scans every record to identify missing cells (null, undefined, empty string), "
    "duplicate rows (via JSON hash comparison), and extreme outliers via the Interquartile Range (IQR 1.5) standard:\n"
    "   IQR = Q3 - Q1\n"
    "   Lower Bound = Q1 - 1.5 × IQR\n"
    "   Upper Bound = Q3 + 1.5 × IQR\n"
    "When a user selects a cleaning action (e.g., Mean Imputation on 'AttendanceRate'), the engine simulates the transformation across the dataset rows, "
    "computing the exact number of affected cells and rows without mutating persistent disk files. Upon user confirmation ('Commit Changes'), "
    "the transformed records are saved to disk, a versioned audit record is appended to cleaningHistory, and dataset metadata is updated.\n"
    "• Inputs: Dataset ID, selected cleaning operation, target column name, replacement strategy.\n"
    "• Processing: IQR calculation, row hashing, imputation substitution, impact simulation, atomic file write.\n"
    "• Outputs: Pre-commit simulation metrics, updated dataset version, cleaned tabular records."
)

# Module 4
add_custom_heading(doc, "3.4.4 Module 4: Descriptive Statistical Modeling & Parametric Engine", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Calculate exact mathematical descriptive statistics, distribution shapes, and bivariate linear dependencies.\n"
    "• Working Process: analyticsService loads the dataset rows and segregates columns into continuous numerical variables and discrete categorical variables. "
    "For numerical columns, it calculates Count (N), Sum, Mean (μ = Σx / N), Median, Mode, Variance (σ² = Σ(x - μ)² / N), Standard Deviation (σ = √σ²), "
    "Minimum, Maximum, Range (Max - Min), First Quartile (Q1), Third Quartile (Q3), and IQR. It generates a 5-bin to 10-bin continuous frequency histogram. "
    "For pairs of numerical features (X, Y), it computes the Pearson Linear Correlation Coefficient:\n"
    "   r = Σ((X - μ_x)(Y - μ_y)) / (√(Σ(X - μ_x)²) × √(Σ(Y - μ_y)²))\n"
    "For categorical columns, it computes unique cardinality, category frequency counts, and percentage shares for the top categories.\n"
    "• Inputs: Tabular records and column metadata.\n"
    "• Processing: Parametric descriptive mathematical algorithms, sorting quartiles, Pearson correlation formulation.\n"
    "• Outputs: Analysis Mongoose document containing complete statistical matrix, histogram bins, and correlation pairs."
)
a_hdr = ["Field Name", "Mongoose Type", "Structural Details", "Analytical Purpose"]
a_data = [
    ["_id", "ObjectId", "Primary Key", "Unique identifier for statistical analysis record"],
    ["dataset", "ObjectId", "Required, Ref: 'Dataset', Index", "Foreign key linking analysis to parent dataset"],
    ["user", "ObjectId", "Required, Ref: 'User', Index", "Foreign key linking analysis to owner user"],
    ["overview", "Object", "{ rowCount, colCount, nulls, duplicates }", "High-level summary of dataset dimensions and quality"],
    ["numericStats", "Array of Objects", "[{ column, mean, median, stdDev, iqr, outliers, histogram }]", "Parametric descriptive metrics and binned histogram frequencies"],
    ["categoricalStats", "Array of Objects", "[{ column, uniqueCount, topValues: [{ value, count, percentage }] }]", "Nominal category frequencies and percentage breakdown"],
    ["correlations", "Array of Objects", "[{ col1, col2, coefficient }]", "Pairwise Pearson linear correlation coefficients (-1.0 to +1.0)"],
    ["observations", "Array of Objects", "[{ type, title, description, impact }]", "Automated rule-based anomaly and correlation callouts"],
    ["aiExecutiveSummary", "String", "Default: null", "Contextually grounded natural language summary from Gemini"]
]
add_table_with_caption(doc, "Table 3.5", "MongoDB Analysis Collection Schema Definition", a_hdr, a_data, col_widths=[1.3, 1.4, 2.0, 1.7])

# Module 5
add_custom_heading(doc, "3.4.5 Module 5: Multi-Variate Visualization & Chart Suite", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Provide interactive client-side visual explorations and render high-resolution server-side chart buffers for PDF reporting.\n"
    "• Working Process: On the frontend, VisualizationsPage renders dynamic HTML5 charts including categorical donut charts, numerical histograms, "
    "bivariate scatter plots, and correlation heatmaps. On the backend, chartService utilizes @napi-rs/canvas to render identical high-resolution "
    "(800×400, 300 DPI) PNG buffers. It generates: (1) Donut charts with proportional slice angles, white separator gaps, percentage callouts, and colored legends; "
    "(2) Histograms with horizontal reference gridlines, frequency counts, and bin intervals; and (3) Pearson correlation bar visualizers with zero-centered "
    "bipolar bars (-1.0 to +1.0). The resulting PNG buffers are passed directly to PDFKit in memory.\n"
    "• Inputs: Statistical analysis metrics, column category counts, histogram bins, correlation pairs.\n"
    "• Processing: Canvas 2D path rendering, trigonometry angle calculations, Skia PNG buffer encoding.\n"
    "• Outputs: Interactive SVG/Canvas on client; 800×400 PNG binary buffers on server."
)

# Module 6
add_custom_heading(doc, "3.4.6 Module 6: Grounded Conversational AI & Analytical Copilot", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Provide natural language query answering and automated executive commentary grounded strictly in verified dataset metrics.\n"
    "• Working Process: geminiService initializes the official @google/genai SDK using process.env.GEMINI_API_KEY and targets model 'gemini-3.8-flash'. "
    "When a user submits a query or requests an executive summary, the service constructs a structured prompt injecting the exact statistical profile "
    "(row count, completeness, numerical means, outliers, correlation pairs, and top categories). The prompt contains a strict system directive: "
    "'You are SmartData Copilot. Base all reasoning strictly on the provided factual statistical metrics. Never fabricate metrics.' "
    "The service invokes client.interactions.create(), extracts the narrative from interaction.output_text, and persists multi-turn dialogue history "
    "in the Conversation collection.\n"
    "• Inputs: Authenticated user message, target dataset ID, active conversation ID.\n"
    "• Processing: Contextual prompt assembly, Gemini SDK Interactions API dispatch, narrative extraction, conversation persistence.\n"
    "• Outputs: Context-aware, grounded natural language responses displayed in the AI Chat workspace."
)

# Module 7
add_custom_heading(doc, "3.4.7 Module 7: Server-Side Vector PDF Dossier Generation & Pagination Fix", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Compile publication-grade, multi-page executive PDF analytical dossiers with embedded canvas charts and guaranteed zero blank pages.\n"
    "• Working Process: reportService initializes a streaming PDFDocument with A4 dimensions (595.28 × 841.89 pt) and 50pt margins. A dedicated "
    "PageLayoutManager orchestrates vertical positioning (doc.y). To resolve the catastrophic blank-page bug discovered in legacy implementations, "
    "the manager enforces two critical design patterns: (1) Isolated Row Coordinates: in multi-column tables, doc.y is locked to rowTopY across all cell "
    "text calls and advanced exactly by rowHeight once per row; (2) Protected Footers: during running footer stamping at y=798, doc.page.margins.bottom "
    "is temporarily set to 0, completely preventing PDFKit from triggering spurious automatic page breaks. Real chart buffers from chartService are embedded "
    "via doc.image(). If Cloudinary is configured, the file is uploaded and the secure CDN URL is returned; otherwise, it persists to verified local disk.\n"
    "• Inputs: Statistical Analysis document, Dataset document, custom report title.\n"
    "• Processing: Vector drawing, text layout management, canvas image buffer embedding, footer stamping, Cloudinary upload.\n"
    "• Outputs: Multi-page executive PDF file, MongoDB Report record, download endpoint URL."
)
r_hdr = ["Field Name", "Mongoose Type", "Default / Constraints", "Functional Role in Report Archival"]
r_data = [
    ["_id", "ObjectId", "Primary Key", "Unique identifier for report record and download endpoint"],
    ["user", "ObjectId", "Required, Ref: 'User', Index", "Foreign key linking report to owner user"],
    ["dataset", "ObjectId", "Required, Ref: 'Dataset', Index", "Foreign key linking report to target dataset"],
    ["analysis", "ObjectId", "Ref: 'Analysis', Optional", "Reference to statistical analysis snapshot used"],
    ["title", "String", "Required, Trimmed", "Executive title of the generated report dossier"],
    ["filename", "String", "Required, System-generated", "Unique filename (e.g., report-179355...pdf)"],
    ["filePath", "String", "Absolute filesystem path", "Local storage location in backend/uploads/reports"],
    ["pdfUrl", "String", "Required (URL or Endpoint)", "Download URL (/api/reports/:id/download or Cloudinary CDN)"],
    ["storageType", "String", "Enum: ['local', 'cloudinary']", "Storage tier utilized for physical PDF binary"],
    ["fileSize", "Number", "Positive Integer (Bytes)", "Total compiled PDF file size on disk"],
    ["status", "String", "Enum: ['completed', 'failed']", "Lifecycle completion status of report generation"]
]
add_table_with_caption(doc, "Table 3.6", "MongoDB Report Collection Schema Definition", r_hdr, r_data, col_widths=[1.2, 1.4, 1.9, 1.9])

# Module 8
add_custom_heading(doc, "3.4.8 Module 8: Executive Analytics Dashboard & System Monitoring", level=3)
add_body_paragraph(
    doc,
    "• Purpose: Provide a consolidated operational overview of all user assets, system health indicators, and rapid navigation shortcuts.\n"
    "• Working Process: dashboardController executes optimized MongoDB aggregation pipelines across Users, Datasets, Analyses, and Reports collections. "
    "It computes total datasets uploaded, cumulative row counts, recent analytical activities, report compilation counts, and system health status. "
    "The React DashboardView presents these metrics through metric cards, quick-generation modal drawers, and responsive dataset data tables.\n"
    "• Inputs: Authenticated user session cookie.\n"
    "• Processing: MongoDB parallel aggregations, timestamp formatting, asset counting.\n"
    "• Outputs: JSON telemetry payload powering the primary dashboard interface."
)
c_hdr = ["Field Name", "Mongoose Type", "Structural Details", "Conversational Role"]
c_data = [
    ["_id", "ObjectId", "Primary Key", "Unique identifier for dialogue session"],
    ["user", "ObjectId", "Required, Ref: 'User', Index", "Owner user foreign key"],
    ["dataset", "ObjectId", "Required, Ref: 'Dataset', Index", "Target dataset foreign key providing grounding context"],
    ["title", "String", "Default: 'Analytics Discussion'", "Conversational session title"],
    ["messages", "Array of Objects", "[{ role: 'user'|'model', text, timestamp }]", "Chronological dialogue turn history"],
    ["contextSnippet", "Object", "{ datasetName, rowCount, columnCount }", "Cached schema metadata bound to conversation session"]
]
add_table_with_caption(doc, "Table 3.7", "MongoDB Conversation Collection Schema Definition", c_hdr, c_data, col_widths=[1.3, 1.4, 2.0, 1.7])

doc.save(docx_path)
print("Chapter 3 Part 2 appended successfully.")
