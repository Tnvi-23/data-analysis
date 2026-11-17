import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

out_dir = r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report\diagrams'
os.makedirs(out_dir, exist_ok=True)

# Common styling
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 10

def save_fig(fig, filename):
    p = os.path.join(out_dir, filename)
    fig.savefig(p, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'Saved: {filename}')

# -----------------------------------------------------------------------------
# Figure 1.1: Platform Evolution & Ecosystem
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 4.5))
ax.axis('off')

boxes = [
    ("Raw Data Ingestion\n(CSV / Excel Spreadsheets)", 0.05, 0.5, "#E0F2FE", "#0284C7"),
    ("Automated Cleaning\n& Quality Profiling", 0.28, 0.5, "#FEF3C7", "#D97706"),
    ("Deterministic Statistical\n& Correlation Engine", 0.51, 0.5, "#DCFCE7", "#16A34A"),
    ("Multi-Variate Charts\n& Interactive Visuals", 0.74, 0.72, "#F3E8FF", "#9333EA"),
    ("Grounded Generative AI\n(Google Gemini Copilot)", 0.74, 0.48, "#FCE7F3", "#DB2777"),
    ("Automated PDF Dossier\n& Cloud Storage Archive", 0.74, 0.24, "#EDE9FE", "#4F46E5"),
]

for title, x, y, bg, border in boxes:
    box = patches.FancyBboxPatch((x, y - 0.1), 0.18, 0.2, boxstyle="round,pad=0.02,rounding_size=0.03",
                                 facecolor=bg, edgecolor=border, linewidth=2)
    ax.add_patch(box)
    ax.text(x + 0.09, y, title, ha="center", va="center", fontsize=9, fontweight="bold", color="#0F172A")

# Arrows
arrow_kw = dict(arrowstyle="->", lw=2, color="#475569")
ax.annotate("", xy=(0.28, 0.5), xytext=(0.23, 0.5), arrowprops=arrow_kw)
ax.annotate("", xy=(0.51, 0.5), xytext=(0.46, 0.5), arrowprops=arrow_kw)
ax.annotate("", xy=(0.74, 0.72), xytext=(0.69, 0.55), arrowprops=arrow_kw)
ax.annotate("", xy=(0.74, 0.48), xytext=(0.69, 0.50), arrowprops=arrow_kw)
ax.annotate("", xy=(0.74, 0.24), xytext=(0.69, 0.45), arrowprops=arrow_kw)

ax.set_title("Figure 1.1: High-Level Platform Evolution and Ecosystem Overview", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_1_1_ecosystem.png")

# -----------------------------------------------------------------------------
# Figure 2.1: Evolution from Spreadsheets to AI Platforms
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5))
ax.axis('off')

generations = [
    ("Phase 1: Manual Spreadsheets\n(Excel / Lotus 1-2-3)", "• Prone to formula corruption\n• No automated anomaly audits\n• Scalability bottlenecks (<1M rows)\n• Completely manual formatting", 0.04, 0.5, "#F1F5F9", "#64748B"),
    ("Phase 2: Traditional BI Tools\n(Tableau / PowerBI)", "• Heavy proprietary desktop licensing\n• Steep learning curve for non-analysts\n• Limited AI contextual narrative\n• Complex dashboard publishing", 0.36, 0.5, "#E2E8F0", "#334155"),
    ("Phase 3: SmartData Insight\n(Modern MERN + Gemini AI)", "• Zero-install cloud web platform\n• Automated data cleaning & IQR audit\n• Instant parametric descriptive statistics\n• Conversational AI grounding & PDF dossiers", 0.68, 0.5, "#DCFCE7", "#16A34A")
]

for title, desc, x, y, bg, border in generations:
    box = patches.FancyBboxPatch((x, y - 0.35), 0.28, 0.7, boxstyle="round,pad=0.02,rounding_size=0.03",
                                 facecolor=bg, edgecolor=border, linewidth=2.5)
    ax.add_patch(box)
    ax.text(x + 0.14, y + 0.26, title, ha="center", va="center", fontsize=9.5, fontweight="bold", color="#0F172A")
    ax.text(x + 0.02, y - 0.06, desc, ha="left", va="center", fontsize=8.5, color="#1E293B", linespacing=1.6)

ax.annotate("", xy=(0.36, 0.5), xytext=(0.32, 0.5), arrowprops=dict(arrowstyle="->", lw=2.5, color="#0EA5E9"))
ax.annotate("", xy=(0.68, 0.5), xytext=(0.64, 0.5), arrowprops=dict(arrowstyle="->", lw=2.5, color="#16A34A"))

ax.set_title("Figure 2.1: Evolution from Traditional Spreadsheets to AI-Powered Platforms", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_2_1_evolution.png")

# -----------------------------------------------------------------------------
# Figure 3.1: System Architecture Diagram (Three-Tier Enterprise Architecture)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7))
ax.axis('off')

# Tier 1: Client Tier
t1 = patches.FancyBboxPatch((0.05, 0.72), 0.90, 0.22, boxstyle="round,pad=0.02,rounding_size=0.02",
                            facecolor="#F0F9FF", edgecolor="#0284C7", linewidth=2)
ax.add_patch(t1)
ax.text(0.08, 0.90, "PRESENTATION TIER (Single Page Application - React 18 + Vite)", fontsize=10, fontweight="bold", color="#0369A1")
ax.text(0.08, 0.85, "Components: AuthModal | DashboardView | FileUploader | CleaningGrid | StatsMatrix | ChartCanvas | AIChatDrawer | PDFPreviewer", fontsize=8, color="#0F172A")
ax.text(0.08, 0.80, "UI Engine: Tailwind CSS v3 | Lucide Icons | Axios HTTP Client with Credentials (HTTP-Only Cookie Session Management)", fontsize=8, color="#334155")
ax.text(0.08, 0.75, "State Management: React Context API (AuthContext) | Responsive Modular Layouts | Real-Time Feedback Toasts", fontsize=8, color="#334155")

# Tier 2: Application Tier
t2 = patches.FancyBboxPatch((0.05, 0.36), 0.90, 0.30, boxstyle="round,pad=0.02,rounding_size=0.02",
                            facecolor="#F8FAFC", edgecolor="#475569", linewidth=2)
ax.add_patch(t2)
ax.text(0.08, 0.62, "APPLICATION & BUSINESS LOGIC TIER (Node.js v24 + Express.js REST API)", fontsize=10, fontweight="bold", color="#0F172A")

modules = [
    ("Auth & Security\n(JWT, Bcrypt, Helmet)", 0.08, 0.47, "#EDE9FE", "#6366F1"),
    ("File Ingestion\n(Multer, CSV, XLSX)", 0.26, 0.47, "#E0F2FE", "#0284C7"),
    ("Cleaning Engine\n(Dedup, Impute, Cast)", 0.44, 0.47, "#FEF3C7", "#D97706"),
    ("Statistical Engine\n(Mean, Std, IQR)", 0.62, 0.47, "#DCFCE7", "#16A34A"),
    ("Dossier & Canvas\n(PDFKit, @napi-rs)", 0.80, 0.47, "#FCE7F3", "#DB2777")
]
for m_title, mx, my, m_bg, m_border in modules:
    mb = patches.FancyBboxPatch((mx - 0.07, my - 0.06), 0.15, 0.12, boxstyle="round,pad=0.01,rounding_size=0.02",
                                facecolor=m_bg, edgecolor=m_border, linewidth=1.5)
    ax.add_patch(mb)
    ax.text(mx + 0.005, my, m_title, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#0F172A")

ax.text(0.08, 0.38, "Middleware: auth.protect (JWT Cookie Verification) | errorHandler | upload.single (MIME & Size Validator) | corsOptions", fontsize=7.5, color="#475569")

# Tier 3: Data Tier & External Services
t3 = patches.FancyBboxPatch((0.05, 0.04), 0.90, 0.26, boxstyle="round,pad=0.02,rounding_size=0.02",
                            facecolor="#F0FDF4", edgecolor="#16A34A", linewidth=2)
ax.add_patch(t3)
ax.text(0.08, 0.26, "DATA STORAGE & CLOUD SERVICES TIER", fontsize=10, fontweight="bold", color="#15803D")

services = [
    ("MongoDB Atlas Cloud\n(smartdata_insight DB)\nUsers, Datasets, Analyses,\nReports, Conversations", 0.20, 0.14, "#FFFFFF", "#16A34A"),
    ("Google Gemini 3.8 Flash\nInteractions API\nContextual Insights &\nData Chatbot", 0.50, 0.14, "#FFFFFF", "#2563EB"),
    ("Cloudinary Storage\n& Local Disk Fallback\nSecure PDF Storage &\nSigned URLs", 0.80, 0.14, "#FFFFFF", "#F59E0B")
]
for s_title, sx, sy, s_bg, s_border in services:
    sb = patches.FancyBboxPatch((sx - 0.13, sy - 0.08), 0.26, 0.16, boxstyle="round,pad=0.01,rounding_size=0.02",
                                facecolor=s_bg, edgecolor=s_border, linewidth=1.5)
    ax.add_patch(sb)
    ax.text(sx, sy, s_title, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#0F172A")

# Inter-tier arrows
ax.annotate("", xy=(0.50, 0.66), xytext=(0.50, 0.72), arrowprops=dict(arrowstyle="<->", lw=2, color="#0284C7"))
ax.annotate("", xy=(0.50, 0.30), xytext=(0.50, 0.36), arrowprops=dict(arrowstyle="<->", lw=2, color="#16A34A"))

ax.set_title("Figure 3.1: Complete End-to-End Three-Tier System Architecture", fontsize=12, fontweight="bold", pad=12)
save_fig(fig, "figure_3_1_architecture.png")

# -----------------------------------------------------------------------------
# Figure 3.2: DFD Level 0 (Context Level Diagram)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(9, 4.5))
ax.axis('off')

# User Entity (Left)
user_box = patches.FancyBboxPatch((0.05, 0.35), 0.18, 0.30, boxstyle="square,pad=0.02", facecolor="#E2E8F0", edgecolor="#334155", linewidth=2)
ax.add_patch(user_box)
ax.text(0.14, 0.50, "Authenticated User\n(Data Analyst /\nStudent Researcher)", ha="center", va="center", fontsize=9, fontweight="bold", color="#0F172A")

# Main Process (Center)
proc_circle = patches.Circle((0.50, 0.50), 0.18, facecolor="#DCFCE7", edgecolor="#16A34A", linewidth=2.5)
ax.add_patch(proc_circle)
ax.text(0.50, 0.50, "0.0\nSmartData Insight\nPlatform", ha="center", va="center", fontsize=9.5, fontweight="bold", color="#14532D")

# External Services (Right)
ext_box = patches.FancyBboxPatch((0.77, 0.35), 0.18, 0.30, boxstyle="square,pad=0.02", facecolor="#FEF3C7", edgecolor="#D97706", linewidth=2)
ax.add_patch(ext_box)
ax.text(0.86, 0.50, "External Cloud\nServices\n(Gemini 3.8 Flash &\nCloudinary Archive)", ha="center", va="center", fontsize=8.5, fontweight="bold", color="#78350F")

# Data flows
ax.annotate("Credentials, Datasets (CSV/XLSX),\nCleaning Directives, Chat Queries", xy=(0.32, 0.55), xytext=(0.23, 0.55),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#1E293B"), fontsize=7.5, va="bottom", ha="center")
ax.annotate("Visualizations, Descriptive Stats,\nAI Insights, PDF Dossiers", xy=(0.23, 0.45), xytext=(0.32, 0.45),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#16A34A"), fontsize=7.5, va="top", ha="center")

ax.annotate("Dataset Schema & Prompts", xy=(0.77, 0.55), xytext=(0.68, 0.55),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#2563EB"), fontsize=7.5, va="bottom", ha="center")
ax.annotate("AI Narratives & PDF CDN URLs", xy=(0.68, 0.45), xytext=(0.77, 0.45),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#D97706"), fontsize=7.5, va="top", ha="center")

ax.set_title("Figure 3.2: Context-Level Data Flow Diagram (DFD Level 0)", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_3_2_dfd_0.png")

# -----------------------------------------------------------------------------
# Figure 3.3: DFD Level 1 (Functional Decomposition)
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7.5))
ax.axis('off')

processes = [
    ("1.0\nUser Auth &\nCookie Token Mgmt", 0.22, 0.80),
    ("2.0\nFile Ingestion &\nSchema Parser", 0.22, 0.52),
    ("3.0\nInteractive Cleaning\n& Transformation", 0.55, 0.52),
    ("4.0\nStatistical Modeling\n& Anomaly Audit", 0.55, 0.20),
    ("5.0\nGemini AI Insight\n& Natural Language", 0.85, 0.20),
    ("6.0\nPDFKit Dossier &\nCloud Archive", 0.85, 0.52)
]

for p_title, px, py in processes:
    p_circ = patches.Circle((px, py), 0.08, facecolor="#F0FDF4", edgecolor="#16A34A", linewidth=2)
    ax.add_patch(p_circ)
    ax.text(px, py, p_title, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#0F172A")

# Data Stores
stores = [
    ("D1: Users Collection", 0.22, 0.95),
    ("D2: Datasets Collection", 0.22, 0.32),
    ("D3: Analyses Collection", 0.55, 0.36),
    ("D4: Reports Collection", 0.85, 0.72),
    ("D5: Conversations", 0.85, 0.05)
]

for s_title, sx, sy in stores:
    sb = patches.Rectangle((sx - 0.12, sy - 0.03), 0.24, 0.06, facecolor="#F8FAFC", edgecolor="#475569", linewidth=1.5)
    ax.add_patch(sb)
    ax.text(sx, sy, s_title, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#334155")

# User Entity
ue = patches.Rectangle((0.02, 0.47), 0.08, 0.20, facecolor="#E2E8F0", edgecolor="#1E293B", linewidth=2)
ax.add_patch(ue)
ax.text(0.06, 0.57, "Analyst\nUser", ha="center", va="center", fontsize=8.5, fontweight="bold")

# Connecting lines
arrow_kws = dict(arrowstyle="->", lw=1.2, color="#0F172A")
ax.annotate("", xy=(0.14, 0.80), xytext=(0.06, 0.67), arrowprops=arrow_kws)
ax.annotate("", xy=(0.14, 0.52), xytext=(0.10, 0.57), arrowprops=arrow_kws)
ax.annotate("", xy=(0.22, 0.92), xytext=(0.22, 0.88), arrowprops=arrow_kws)
ax.annotate("", xy=(0.22, 0.38), xytext=(0.22, 0.44), arrowprops=arrow_kws)
ax.annotate("", xy=(0.47, 0.52), xytext=(0.30, 0.52), arrowprops=arrow_kws)
ax.annotate("", xy=(0.55, 0.28), xytext=(0.55, 0.44), arrowprops=arrow_kws)
ax.annotate("", xy=(0.55, 0.33), xytext=(0.55, 0.28), arrowprops=arrow_kws)
ax.annotate("", xy=(0.77, 0.20), xytext=(0.63, 0.20), arrowprops=arrow_kws)
ax.annotate("", xy=(0.85, 0.11), xytext=(0.85, 0.12), arrowprops=arrow_kws)
ax.annotate("", xy=(0.85, 0.44), xytext=(0.85, 0.28), arrowprops=arrow_kws)
ax.annotate("", xy=(0.85, 0.69), xytext=(0.85, 0.60), arrowprops=arrow_kws)

ax.set_title("Figure 3.3: Functional Data Flow Diagram (DFD Level 1)", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_3_3_dfd_1.png")

# -----------------------------------------------------------------------------
# Figure 3.4: Use Case Diagram
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 7))
ax.axis('off')

# System Boundary
sys_box = patches.Rectangle((0.25, 0.05), 0.70, 0.90, facecolor="#FFFFFF", edgecolor="#0F172A", linewidth=2)
ax.add_patch(sys_box)
ax.text(0.60, 0.92, "SmartData Insight Platform Boundary", ha="center", va="center", fontsize=10, fontweight="bold", color="#0F172A")

# Actor: User
ax.plot([0.12, 0.12], [0.55, 0.62], color="#0F172A", lw=2) # body
ax.plot([0.08, 0.16], [0.59, 0.59], color="#0F172A", lw=2) # arms
ax.plot([0.12, 0.09], [0.55, 0.48], color="#0F172A", lw=2) # leg L
ax.plot([0.12, 0.15], [0.55, 0.48], color="#0F172A", lw=2) # leg R
head = patches.Circle((0.12, 0.65), 0.03, facecolor="#F1F5F9", edgecolor="#0F172A", linewidth=2)
ax.add_patch(head)
ax.text(0.12, 0.44, "Authenticated\nUser / Analyst", ha="center", va="center", fontsize=8.5, fontweight="bold")

use_cases = [
    ("Register & Login (JWT / Cookie)", 0.60, 0.84),
    ("Upload CSV / Excel Dataset", 0.60, 0.74),
    ("Clean Data (Impute / Drop / Cast)", 0.60, 0.64),
    ("View Descriptive Statistics & Outliers", 0.60, 0.54),
    ("Render Multi-Variate Visual Charts", 0.60, 0.44),
    ("Query Gemini AI Copilot", 0.60, 0.34),
    ("Compile Multi-Page PDF Dossier", 0.60, 0.24),
    ("Download & Archive Reports", 0.60, 0.14)
]

for uc_text, ucx, ucy in use_cases:
    uc_oval = patches.Ellipse((ucx, ucy), 0.40, 0.07, facecolor="#F0FDF4", edgecolor="#16A34A", linewidth=1.5)
    ax.add_patch(uc_oval)
    ax.text(ucx, ucy, uc_text, ha="center", va="center", fontsize=8, fontweight="bold", color="#14532D")
    ax.plot([0.16, ucx - 0.20], [0.57, ucy], color="#64748B", lw=1.2, linestyle="--")

ax.set_title("Figure 3.4: Comprehensive Use Case Diagram", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_3_4_use_case.png")

# -----------------------------------------------------------------------------
# Figure 3.5: Activity Diagram
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(9, 8))
ax.axis('off')

start_node = patches.Circle((0.50, 0.94), 0.025, facecolor="#0F172A", edgecolor="#0F172A")
ax.add_patch(start_node)

acts = [
    ("Authenticate via JWT Cookie Session", 0.50, 0.85, "#E0F2FE", "#0284C7"),
    ("Upload Raw CSV / Excel Spreadsheet", 0.50, 0.74, "#FEF3C7", "#D97706"),
    ("Verify MIME, Structure & Schema Types", 0.50, 0.63, "#EDE9FE", "#6366F1"),
    ("Are Data Anomalies Detected?\n(Missing cells, duplicates, invalid formats)", 0.50, 0.50, "#F1F5F9", "#475569", True),
    ("Apply Transformations (Impute, Drop, Cast)", 0.22, 0.38, "#FEF3C7", "#D97706"),
    ("Execute Descriptive & Parametric Stats", 0.50, 0.38, "#DCFCE7", "#16A34A"),
    ("Render Canvas Visualizations & Heatmaps", 0.50, 0.26, "#DCFCE7", "#16A34A"),
    ("Compile Executive PDF Dossier with Charts", 0.50, 0.14, "#FCE7F3", "#DB2777")
]

for item in acts:
    if len(item) == 6: # decision diamond
        text, x, y, bg, border, is_dec = item
        poly = patches.Polygon([[x, y + 0.05], [x + 0.22, y], [x, y - 0.05], [x - 0.22, y]],
                               facecolor=bg, edgecolor=border, linewidth=1.8)
        ax.add_patch(poly)
        ax.text(x, y, text, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#0F172A")
    else:
        text, x, y, bg, border = item
        b = patches.FancyBboxPatch((x - 0.18, y - 0.035), 0.36, 0.07, boxstyle="round,pad=0.01,rounding_size=0.02",
                                  facecolor=bg, edgecolor=border, linewidth=1.5)
        ax.add_patch(b)
        ax.text(x, y, text, ha="center", va="center", fontsize=8, fontweight="bold", color="#0F172A")

end_out = patches.Circle((0.50, 0.04), 0.025, facecolor="white", edgecolor="#0F172A", linewidth=2)
end_in = patches.Circle((0.50, 0.04), 0.015, facecolor="#0F172A")
ax.add_patch(end_out)
ax.add_patch(end_in)

# Connectors
a_kw = dict(arrowstyle="->", lw=1.5, color="#334155")
ax.annotate("", xy=(0.50, 0.885), xytext=(0.50, 0.915), arrowprops=a_kw)
ax.annotate("", xy=(0.50, 0.775), xytext=(0.50, 0.815), arrowprops=a_kw)
ax.annotate("", xy=(0.50, 0.665), xytext=(0.50, 0.705), arrowprops=a_kw)
ax.annotate("", xy=(0.50, 0.550), xytext=(0.50, 0.595), arrowprops=a_kw)

# Decision branches
ax.annotate("Yes", xy=(0.22, 0.415), xytext=(0.28, 0.50), arrowprops=a_kw, fontsize=8, fontweight="bold", color="#D97706")
ax.annotate("", xy=(0.35, 0.38), xytext=(0.40, 0.38), arrowprops=a_kw)
ax.annotate("No", xy=(0.50, 0.415), xytext=(0.50, 0.450), arrowprops=a_kw, fontsize=8, fontweight="bold", color="#16A34A")

ax.annotate("", xy=(0.50, 0.295), xytext=(0.50, 0.345), arrowprops=a_kw)
ax.annotate("", xy=(0.50, 0.175), xytext=(0.50, 0.225), arrowprops=a_kw)
ax.annotate("", xy=(0.50, 0.065), xytext=(0.50, 0.105), arrowprops=a_kw)

ax.set_title("Figure 3.5: Analytical Data Processing & Pipeline Activity Diagram", fontsize=11, fontweight="bold", pad=12)
save_fig(fig, "figure_3_5_activity.png")

# -----------------------------------------------------------------------------
# Figure 3.6: Sequence Diagram
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7))
ax.axis('off')

lifelines = [
    ("User / Browser\n(React UI)", 0.10),
    ("Express API\n(Router & Controller)", 0.32),
    ("Analytics & Chart\nServices", 0.54),
    ("MongoDB Atlas\n(Database)", 0.76),
    ("Gemini / Cloudinary\n(External APIs)", 0.94)
]

for name, x in lifelines:
    hb = patches.FancyBboxPatch((x - 0.08, 0.88), 0.16, 0.08, boxstyle="round,pad=0.01", facecolor="#E2E8F0", edgecolor="#1E293B", linewidth=1.5)
    ax.add_patch(hb)
    ax.text(x, 0.92, name, ha="center", va="center", fontsize=7.5, fontweight="bold", color="#0F172A")
    ax.plot([x, x], [0.10, 0.88], linestyle="--", color="#94A3B8", lw=1.2)

seq_steps = [
    (0.10, 0.32, 0.82, "1. POST /api/auth/login", True),
    (0.32, 0.76, 0.77, "2. User.findOne() & verify password", True),
    (0.76, 0.32, 0.72, "3. Return authenticated user doc", False),
    (0.32, 0.10, 0.67, "4. 200 OK + Set-Cookie (jwt token)", False),
    (0.10, 0.32, 0.60, "5. POST /api/datasets/upload (FormData)", True),
    (0.32, 0.76, 0.55, "6. Save Dataset Schema & Records", True),
    (0.10, 0.32, 0.48, "7. POST /api/datasets/:id/analyze", True),
    (0.32, 0.54, 0.43, "8. Compute Parametric Stats & Outliers", True),
    (0.54, 0.94, 0.38, "9. Request AI Executive Summary", True),
    (0.94, 0.54, 0.33, "10. Return Gemini Natural Language", False),
    (0.54, 0.76, 0.28, "11. Save Analysis Model", True),
    (0.10, 0.32, 0.21, "12. POST /api/reports/generate", True),
    (0.32, 0.54, 0.16, "13. Render Canvas PNGs & PDFKit Stream", True),
    (0.54, 0.32, 0.11, "14. PDF Ready (3-Page Multi-Section Dossier)", False)
]

for x1, x2, y, label, is_call in seq_steps:
    style = "->" if is_call else "-->"
    ls = "-" if is_call else "--"
    col = "#0284C7" if is_call else "#16A34A"
    ax.annotate("", xy=(x2, y), xytext=(x1, y), arrowprops=dict(arrowstyle="->", lw=1.5, color=col, linestyle=ls))
    mid_x = (x1 + x2) / 2
    ax.text(mid_x, y + 0.015, label, ha="center", va="bottom", fontsize=7, color="#0F172A", fontweight="bold")

ax.set_title("Figure 3.6: End-to-End Request, Processing & Report Generation Sequence Diagram", fontsize=11, fontweight="bold", pad=12)
save_fig(fig, "figure_3_6_sequence.png")

# -----------------------------------------------------------------------------
# Figure 3.7: MongoDB Atlas ER Schema Diagram
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7.5))
ax.axis('off')

entities = [
    ("User Model\n(users collection)",
     "• _id : ObjectId (PK)\n• name : String\n• email : String (Unique)\n• password : String (Bcrypt)\n• role : String ('user')\n• createdAt, updatedAt : Date",
     0.06, 0.65, "#E0F2FE", "#0284C7"),

    ("Dataset Model\n(datasets collection)",
     "• _id : ObjectId (PK)\n• user : ObjectId (FK -> User)\n• originalFilename : String\n• fileType : String ('csv'|'xlsx')\n• rowCount : Number\n• columnCount : Number\n• columns : Array [name, type]\n• dataPath : String\n• qualityScore : Mixed\n• cleaningHistory : Array",
     0.38, 0.65, "#FEF3C7", "#D97706"),

    ("Analysis Model\n(analyses collection)",
     "• _id : ObjectId (PK)\n• dataset : ObjectId (FK -> Dataset)\n• user : ObjectId (FK -> User)\n• overview : Object [rows, cols, nulls]\n• numericStats : Array [mean, med, iqr]\n• categoricalStats : Array [topValues]\n• correlations : Array [col1, col2, r]\n• aiExecutiveSummary : String",
     0.70, 0.65, "#DCFCE7", "#16A34A"),

    ("Report Model\n(reports collection)",
     "• _id : ObjectId (PK)\n• user : ObjectId (FK -> User)\n• dataset : ObjectId (FK -> Dataset)\n• title : String\n• filename : String\n• filePath : String\n• pdfUrl : String\n• storageType : String\n• fileSize : Number",
     0.38, 0.15, "#FCE7F3", "#DB2777"),

    ("Conversation Model\n(conversations collection)",
     "• _id : ObjectId (PK)\n• user : ObjectId (FK -> User)\n• dataset : ObjectId (FK -> Dataset)\n• title : String\n• messages : Array [role, text]\n• contextSnippet : Object",
     0.70, 0.15, "#EDE9FE", "#6366F1")
]

for title, fields, x, y, bg, border in entities:
    box = patches.FancyBboxPatch((x, y - 0.12), 0.25, 0.35, boxstyle="round,pad=0.015,rounding_size=0.02",
                                 facecolor=bg, edgecolor=border, linewidth=2)
    ax.add_patch(box)
    ax.text(x + 0.125, y + 0.20, title, ha="center", va="center", fontsize=8.5, fontweight="bold", color="#0F172A")
    ax.text(x + 0.015, y + 0.03, fields, ha="left", va="center", fontsize=7.2, color="#1E293B", linespacing=1.4)

# Relationships
ax.annotate("1 : N (Owns)", xy=(0.38, 0.78), xytext=(0.31, 0.78),
            arrowprops=dict(arrowstyle="->", lw=1.8, color="#0284C7"), fontsize=7.5, fontweight="bold")
ax.annotate("1 : N (Generates)", xy=(0.70, 0.78), xytext=(0.63, 0.78),
            arrowprops=dict(arrowstyle="->", lw=1.8, color="#D97706"), fontsize=7.5, fontweight="bold")
ax.annotate("1 : N (Compiles)", xy=(0.50, 0.40), xytext=(0.50, 0.53),
            arrowprops=dict(arrowstyle="->", lw=1.8, color="#DB2777"), fontsize=7.5, fontweight="bold")
ax.annotate("1 : N (Chats)", xy=(0.82, 0.40), xytext=(0.82, 0.53),
            arrowprops=dict(arrowstyle="->", lw=1.8, color="#6366F1"), fontsize=7.5, fontweight="bold")

ax.set_title("Figure 3.7: MongoDB Atlas Entity-Relationship (ER) Schema Diagram", fontsize=11, fontweight="bold", pad=12)
save_fig(fig, "figure_3_7_er_diagram.png")

# -----------------------------------------------------------------------------
# Figure 3.8: Module Interaction Architecture Diagram
# -----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 5.5))
ax.axis('off')

# Central Hub: Express Orchestrator
hub = patches.Circle((0.50, 0.50), 0.15, facecolor="#F8FAFC", edgecolor="#0F172A", linewidth=2.5)
ax.add_patch(hub)
ax.text(0.50, 0.50, "Express.js Core\nOrchestration Hub\n(app.js & Controllers)", ha="center", va="center", fontsize=8.5, fontweight="bold")

peripherals = [
    ("Auth Module\n(JWT & Cookies)", 0.20, 0.80, "#EDE9FE", "#6366F1"),
    ("File Parser\n(Multer & XLSX)", 0.80, 0.80, "#E0F2FE", "#0284C7"),
    ("Data Cleaning\nEngine", 0.12, 0.50, "#FEF3C7", "#D97706"),
    ("Analytics Matrix\n& IQR Engine", 0.88, 0.50, "#DCFCE7", "#16A34A"),
    ("Gemini AI\nCopilot Service", 0.20, 0.20, "#FCE7F3", "#DB2777"),
    ("ReportService\n& Canvas Renderer", 0.80, 0.20, "#EDE9FE", "#4F46E5")
]

for p_title, px, py, bg, border in peripherals:
    b = patches.FancyBboxPatch((px - 0.09, py - 0.08), 0.18, 0.16, boxstyle="round,pad=0.01", facecolor=bg, edgecolor=border, linewidth=1.5)
    ax.add_patch(b)
    ax.text(px, py, p_title, ha="center", va="center", fontsize=8, fontweight="bold", color="#0F172A")
    ax.annotate("", xy=(px, py), xytext=(0.50, 0.50), arrowprops=dict(arrowstyle="<->", lw=1.5, color="#64748B"))

ax.set_title("Figure 3.8: Subsystem Interaction & Module Communication Architecture", fontsize=11, fontweight="bold", pad=15)
save_fig(fig, "figure_3_8_module_interaction.png")

# -----------------------------------------------------------------------------
# Real Analytical Figures for Chapter 4 (Generated using actual project dataset data)
# -----------------------------------------------------------------------------
# Figure 4.1: Donut / Pie Chart (Gender Distribution from student_exam_scores.csv)
fig, ax = plt.subplots(figsize=(7, 4.2))
labels = ['Female (53.3%)', 'Male (46.7%)']
sizes = [8, 7]
colors = ['#16A34A', '#0EA5E9']
explode = (0.05, 0)

wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=labels, colors=colors,
                                  autopct='%1.1f%%', startangle=140, pctdistance=0.75,
                                  wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2.5))
plt.setp(autotexts, size=9, weight="bold", color="white")
plt.setp(texts, size=9, weight="bold", color="#1E293B")
ax.set_title("Figure 4.1: Categorical Distribution Donut Chart (Gender Attribute - student_exam_scores.csv)", fontsize=10, fontweight="bold", pad=10)
save_fig(fig, "figure_4_1_pie_chart.png")

# Figure 4.2: Frequency Histogram (StudyHours from student_exam_scores.csv)
fig, ax = plt.subplots(figsize=(7.5, 4.2))
study_hours = [14.5, 8.0, 18.0, 4.5, 12.0, 15.5, 6.0, 10.5, 16.5, 3.0, 11.0, 17.5, 9.0, 13.5, 5.0]
counts, bins, patches_hist = ax.hist(study_hours, bins=5, edgecolor='#0F172A', color='#16A34A', rwidth=0.85)
for count, bin_left in zip(counts, bins):
    if count > 0:
        ax.text(bin_left + 1.2, count + 0.1, str(int(count)), ha='center', va='bottom', fontsize=8.5, fontweight='bold')
ax.set_xlabel("Study Hours Range (Parametric Bins)", fontsize=9, fontweight='bold', color='#1E293B')
ax.set_ylabel("Frequency Count", fontsize=9, fontweight='bold', color='#1E293B')
ax.set_title("Figure 4.2: Continuous Frequency Histogram (StudyHours - student_exam_scores.csv)", fontsize=10, fontweight="bold", pad=10)
ax.grid(axis='y', linestyle='--', alpha=0.5)
save_fig(fig, "figure_4_2_histogram.png")

# Figure 4.3: Pearson Correlation Bar Chart
fig, ax = plt.subplots(figsize=(8, 4.5))
pairs = [
    'PreviousExamScore vs FinalExamScore',
    'StudyHours vs FinalExamScore',
    'AttendanceRate vs FinalExamScore',
    'AttendanceRate vs PreviousExamScore',
    'StudyHours vs PreviousExamScore',
    'StudyHours vs AttendanceRate'
]
corrs = [0.9972, 0.9906, 0.9900, 0.9891, 0.9891, 0.9696]
y_pos = np.arange(len(pairs))
bars = ax.barh(y_pos, corrs, color='#16A34A', edgecolor='#0F172A', height=0.6)
ax.set_yticks(y_pos)
ax.set_yticklabels(pairs, fontsize=8, fontweight='bold', color='#1E293B')
ax.set_xlim(0.90, 1.005)
ax.set_xlabel("Pearson Linear Correlation Coefficient (r)", fontsize=9, fontweight='bold')
ax.set_title("Figure 4.3: Linear Pearson Dependencies (student_exam_scores.csv)", fontsize=10, fontweight="bold", pad=10)
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.001, bar.get_y() + bar.get_height()/2, f"+{w:.4f}", va='center', ha='left', fontsize=8, fontweight='bold', color='#0F172A')
ax.grid(axis='x', linestyle='--', alpha=0.5)
save_fig(fig, "figure_4_3_correlation.png")

print("All diagrams generated successfully.")
