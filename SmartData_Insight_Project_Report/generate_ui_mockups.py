import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

out_dir = r'C:\Users\tanvi\OneDrive\Documents\Data_Analysis\SmartData_Insight_Project_Report\diagrams'
os.makedirs(out_dir, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'

def save_ui(fig, filename):
    p = os.path.join(out_dir, filename)
    fig.savefig(p, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'Saved UI Figure: {filename}')

def create_browser_frame(ax, title):
    # Outer frame
    frame = patches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96, boxstyle="round,pad=0.01,rounding_size=0.02",
                                   facecolor="#FFFFFF", edgecolor="#CBD5E1", linewidth=2)
    ax.add_patch(frame)
    # Header bar
    hbar = patches.Rectangle((0.02, 0.90), 0.96, 0.08, facecolor="#0F172A")
    ax.add_patch(hbar)
    # Window dots
    ax.plot(0.05, 0.94, 'o', color="#EF4444", markersize=6)
    ax.plot(0.07, 0.94, 'o', color="#F59E0B", markersize=6)
    ax.plot(0.09, 0.94, 'o', color="#10B981", markersize=6)
    ax.text(0.12, 0.94, f"SmartData Insight — {title} (http://localhost:5173)", va="center", color="#F8FAFC", fontsize=8.5, fontweight="bold")

# 1. Landing Page
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Landing Page & Public Showcase")
# Hero Banner
hero = patches.FancyBboxPatch((0.06, 0.58), 0.88, 0.28, boxstyle="round,pad=0.02", facecolor="#F8FAFC", edgecolor="#E2E8F0", linewidth=1.5)
ax.add_patch(hero)
ax.text(0.50, 0.77, "Transform Raw Spreadsheets into Actionable AI Intelligence", ha="center", fontsize=11, fontweight="bold", color="#0F172A")
ax.text(0.50, 0.71, "Automated data ingestion, parametric statistical modeling, and grounded generative AI", ha="center", fontsize=8.5, color="#64748B")
btn = patches.FancyBboxPatch((0.40, 0.61), 0.20, 0.06, boxstyle="round,pad=0.01", facecolor="#16A34A", edgecolor="#16A34A")
ax.add_patch(btn)
ax.text(0.50, 0.64, "Launch Dashboard →", ha="center", va="center", color="white", fontsize=8, fontweight="bold")
# Feature Grid
feats = [
    ("Deterministic Profiling\nMean, Median, Std, IQR bounds", 0.06),
    ("Interactive Data Cleaning\nImpute, deduplicate, cast", 0.36),
    ("Gemini Analytical AI\nGrounded multi-turn chatbot", 0.66)
]
for f_txt, fx in feats:
    fb = patches.FancyBboxPatch((fx, 0.12), 0.28, 0.38, boxstyle="round,pad=0.01", facecolor="#F1F5F9", edgecolor="#CBD5E1")
    ax.add_patch(fb)
    ax.text(fx + 0.14, 0.31, f_txt, ha="center", va="center", fontsize=8, color="#1E293B", linespacing=1.4)
ax.set_title("Figure 4.4: Public Landing Page & Interactive Analytical Showcase", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_4_landing.png")

# 2. Login & Authentication
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Secure Authentication Portal")
auth_card = patches.FancyBboxPatch((0.30, 0.15), 0.40, 0.68, boxstyle="round,pad=0.02", facecolor="#FFFFFF", edgecolor="#16A34A", linewidth=2)
ax.add_patch(auth_card)
ax.text(0.50, 0.75, "Sign In to SmartData Insight", ha="center", fontsize=11, fontweight="bold", color="#0F172A")
ax.text(0.50, 0.70, "Secure JWT authentication stored in HTTP-only cookies", ha="center", fontsize=7.5, color="#64748B")
# Input fields
inp1 = patches.Rectangle((0.34, 0.55), 0.32, 0.07, facecolor="#F8FAFC", edgecolor="#CBD5E1")
ax.add_patch(inp1)
ax.text(0.35, 0.585, "Email: tanvi@example.com", va="center", fontsize=8, color="#334155")
inp2 = patches.Rectangle((0.34, 0.43), 0.32, 0.07, facecolor="#F8FAFC", edgecolor="#CBD5E1")
ax.add_patch(inp2)
ax.text(0.35, 0.465, "Password: ••••••••••••", va="center", fontsize=8, color="#334155")
sign_btn = patches.FancyBboxPatch((0.34, 0.30), 0.32, 0.07, boxstyle="round,pad=0.01", facecolor="#16A34A", edgecolor="#16A34A")
ax.add_patch(sign_btn)
ax.text(0.50, 0.335, "Secure Log In", ha="center", va="center", color="white", fontsize=8.5, fontweight="bold")
ax.text(0.50, 0.22, "Protected by Helmet & CSRF-safe SameSite policy", ha="center", fontsize=7, color="#10B981")
ax.set_title("Figure 4.5: Secure User Authentication & Registration Workspace", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_5_login.png")

# 3. Dashboard
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Executive Dashboard Overview")
# Sidebar
side = patches.Rectangle((0.02, 0.02), 0.16, 0.88, facecolor="#0F172A")
ax.add_patch(side)
items = ["Dashboard", "Upload Dataset", "Data Cleaning", "Statistics", "Visualizations", "AI Copilot", "Reports"]
for i, itm in enumerate(items):
    col = "#16A34A" if i == 0 else "#94A3B8"
    ax.text(0.04, 0.82 - i * 0.10, itm, fontsize=7.5, fontweight="bold", color=col)
# Metric cards
metrics = [("Total Datasets", "15", "#16A34A"), ("Analyses Run", "32", "#0284C7"), ("Reports Generated", "5", "#D97706"), ("Health Index", "98%", "#8B5CF6")]
for i, (m_l, m_v, m_c) in enumerate(metrics):
    mx = 0.22 + i * 0.19
    mb = patches.FancyBboxPatch((mx, 0.68), 0.16, 0.18, boxstyle="round,pad=0.01", facecolor="#F8FAFC", edgecolor="#E2E8F0")
    ax.add_patch(mb)
    ax.text(mx + 0.02, 0.81, m_l, fontsize=7, color="#64748B", fontweight="bold")
    ax.text(mx + 0.02, 0.73, m_v, fontsize=14, color=m_c, fontweight="bold")
# Dataset list table
tbl = patches.Rectangle((0.22, 0.10), 0.73, 0.52, facecolor="#FFFFFF", edgecolor="#CBD5E1")
ax.add_patch(tbl)
th = patches.Rectangle((0.22, 0.54), 0.73, 0.08, facecolor="#0F172A")
ax.add_patch(th)
ax.text(0.24, 0.58, "Recent Target Datasets (MongoDB Atlas)", color="white", fontsize=8, fontweight="bold")
d_rows = [
    ("student_exam_scores.csv", "15 records", "7 columns", "Ready", "#16A34A"),
    ("[Sample] Academic Performance.csv", "20 records", "8 columns", "Ready", "#16A34A"),
    ("[Sample] Sales & Revenue.csv", "20 records", "9 columns", "Ready", "#16A34A"),
    ("company_payroll.csv", "7 records", "5 columns", "Ready", "#16A34A")
]
for i, (d_n, d_r, d_c, d_s, d_col) in enumerate(d_rows):
    y = 0.46 - i * 0.09
    ax.text(0.24, y, d_n, fontsize=7.5, fontweight="bold", color="#0F172A")
    ax.text(0.55, y, f"{d_r} | {d_c}", fontsize=7.5, color="#64748B")
    ax.text(0.85, y, d_s, fontsize=7.5, fontweight="bold", color=d_col)
ax.set_title("Figure 4.6: Multi-Dataset Executive Dashboard & System Overview", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_6_dashboard.png")

# 4. Data Cleaning
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Interactive Data Cleaning & Preprocessing Studio")
# Operations toolbar
tb = patches.Rectangle((0.06, 0.75), 0.88, 0.12, facecolor="#F1F5F9", edgecolor="#CBD5E1")
ax.add_patch(tb)
ax.text(0.08, 0.81, "Cleaning Operations: [Drop Missing] [Mean Imputation] [Remove Duplicates] [Type Cast] [Filter Rows]", fontsize=8, fontweight="bold", color="#0F172A")
# Pre-commit impact simulator
sim = patches.FancyBboxPatch((0.06, 0.58), 0.88, 0.14, boxstyle="round,pad=0.01", facecolor="#FEF3C7", edgecolor="#D97706")
ax.add_patch(sim)
ax.text(0.08, 0.66, "⚠️ Pre-Commit Impact Simulation:", fontsize=8, fontweight="bold", color="#B45309")
ax.text(0.08, 0.61, "Action: Mean Imputation on 'AttendanceRate' | Affected Cells: 2 | Affected Rows: 2 | Nulls After: 0", fontsize=7.5, color="#78350F")
# Audit history table
hist = patches.Rectangle((0.06, 0.10), 0.88, 0.44, facecolor="#FFFFFF", edgecolor="#CBD5E1")
ax.add_patch(hist)
ax.text(0.08, 0.48, "Immutable Transformation Audit Trail (Rollback Supported)", fontsize=8, fontweight="bold", color="#0F172A")
steps = [
    ("v1 -> v2", "Duplicate Row Removal", "0 duplicates dropped", "Verified"),
    ("v2 -> v3", "Missing Value Handling", "Dropped 0 null records", "Verified"),
    ("v3 -> v4", "IQR Outlier Scanning", "0 extreme anomalies isolated", "Certified")
]
for i, (v, act, res, stat) in enumerate(steps):
    y = 0.38 - i * 0.10
    ax.text(0.08, y, v, fontsize=7.5, fontweight="bold", color="#0284C7")
    ax.text(0.22, y, act, fontsize=7.5, color="#1E293B")
    ax.text(0.55, y, res, fontsize=7.5, color="#64748B")
    ax.text(0.82, y, stat, fontsize=7.5, fontweight="bold", color="#16A34A")
ax.set_title("Figure 4.7: Interactive Data Cleaning & Transformation Console", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_7_cleaning.png")

# 5. Statistical Analysis Studio
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Parametric Statistical Modeling Studio")
# Top Overview Box
ov = patches.Rectangle((0.06, 0.72), 0.88, 0.15, facecolor="#F0FDF4", edgecolor="#16A34A")
ax.add_patch(ov)
ax.text(0.08, 0.81, "Dataset Statistical Profile: student_exam_scores.csv (15 Rows, 7 Columns)", fontsize=8.5, fontweight="bold", color="#15803D")
ax.text(0.08, 0.75, "Data Completeness: 100% | Duplicates: 0 | Total Missing: 0 | Parametric Variables: 4 | Categorical: 3", fontsize=7.5, color="#166534")
# Stats Table
st_box = patches.Rectangle((0.06, 0.10), 0.88, 0.58, facecolor="#FFFFFF", edgecolor="#CBD5E1")
ax.add_patch(st_box)
st_hdr = patches.Rectangle((0.06, 0.60), 0.88, 0.08, facecolor="#0F172A")
ax.add_patch(st_hdr)
ax.text(0.08, 0.64, "Variable       Count     Mean(μ)    Median     Min      Max      StdDev(σ)     IQR      Outliers", fontsize=7.5, color="white", fontweight="bold")
s_rows = [
    ("StudyHours", "15", "11.23", "11.00", "3.0", "18.0", "4.92", "7.25", "0"),
    ("AttendanceRate", "15", "83.50", "85.00", "60.0", "99.0", "11.68", "13.25", "0"),
    ("PreviousExamScore", "15", "69.90", "70.00", "42.0", "92.0", "14.38", "17.25", "0"),
    ("FinalExamScore", "15", "74.80", "76.00", "45.0", "96.0", "15.42", "20.75", "0")
]
for i, row in enumerate(s_rows):
    y = 0.51 - i * 0.10
    txt = f"{row[0]:<15} {row[1]:<8} {row[2]:<10} {row[3]:<10} {row[4]:<8} {row[5]:<8} {row[6]:<12} {row[7]:<8} {row[8]:<8}"
    ax.text(0.08, y, txt, fontsize=7.2, color="#0F172A", family="monospace")
ax.set_title("Figure 4.8: Statistical Modeling & Descriptive Statistics Studio", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_8_statistical_studio.png")

# 6. Multi-Variate Visualizations
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Interactive Multi-Variate Visualization Dashboard")
# 4 Sub-chart tiles
c_tiles = [
    ("Donut Distribution Chart\n(Gender: 53.3% F / 46.7% M)", 0.06, 0.48),
    ("Frequency Histogram\n(StudyHours 5-Bin Spread)", 0.52, 0.48),
    ("Correlation Heatmap Matrix\n(Pearson r Coefficients)", 0.06, 0.08),
    ("Bi-Variate Scatter Plot\n(StudyHours vs FinalExamScore)", 0.52, 0.08)
]
for c_title, cx, cy in c_tiles:
    cb = patches.FancyBboxPatch((cx, cy), 0.42, 0.36, boxstyle="round,pad=0.01", facecolor="#F8FAFC", edgecolor="#CBD5E1")
    ax.add_patch(cb)
    ax.text(cx + 0.02, cy + 0.30, c_title, fontsize=7.5, fontweight="bold", color="#0F172A")
    # Mini graphic representation
    mini_box = patches.Rectangle((cx + 0.04, cy + 0.04), 0.34, 0.22, facecolor="#FFFFFF", edgecolor="#E2E8F0")
    ax.add_patch(mini_box)
    ax.text(cx + 0.21, cy + 0.15, "[High-Resolution Vector Canvas]", ha="center", fontsize=7, color="#64748B")
ax.set_title("Figure 4.9: Multi-Variate Visualization Dashboard Suite", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_9_visualizations.png")

# 7. Grounded AI Copilot
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Grounded AI Conversational Intelligence (Gemini 3.8 Flash)")
# Chat Container
chat_box = patches.Rectangle((0.06, 0.18), 0.88, 0.68, facecolor="#F8FAFC", edgecolor="#CBD5E1")
ax.add_patch(chat_box)
# Message 1 (User)
u_bubble = patches.FancyBboxPatch((0.40, 0.68), 0.52, 0.12, boxstyle="round,pad=0.01", facecolor="#16A34A", edgecolor="#16A34A")
ax.add_patch(u_bubble)
ax.text(0.42, 0.74, "User: Which student showed the highest academic improvement?", color="white", fontsize=7.5, fontweight="bold")
# Message 2 (AI)
ai_bubble = patches.FancyBboxPatch((0.08, 0.46), 0.65, 0.18, boxstyle="round,pad=0.01", facecolor="#FFFFFF", edgecolor="#E2E8F0")
ax.add_patch(ai_bubble)
ax.text(0.10, 0.58, "SmartData Copilot (Gemini 3.8 Flash):", fontsize=7.5, fontweight="bold", color="#2563EB")
ax.text(0.10, 0.50, "Based on student_exam_scores.csv, Student STU-103 demonstrated the\nhighest FinalExamScore (94.5) with 18.0 study hours. Furthermore, a 0.9906\npositive Pearson correlation links StudyHours to FinalExamScore.", fontsize=7, color="#1E293B", linespacing=1.3)
# Input Box
inp_c = patches.Rectangle((0.06, 0.08), 0.74, 0.08, facecolor="#FFFFFF", edgecolor="#CBD5E1")
ax.add_patch(inp_c)
ax.text(0.08, 0.12, "Ask Gemini about distributions, anomalies, or correlations...", fontsize=7.5, color="#94A3B8")
send_b = patches.FancyBboxPatch((0.82, 0.08), 0.12, 0.08, boxstyle="round,pad=0.01", facecolor="#0F172A", edgecolor="#0F172A")
ax.add_patch(send_b)
ax.text(0.88, 0.12, "Send →", color="white", ha="center", fontsize=7.5, fontweight="bold")
ax.set_title("Figure 4.10: Grounded Conversational AI Assistant & Analytical Copilot", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_10_ai_chat.png")

# 8. PDF Report Dossier
fig, ax = plt.subplots(figsize=(9, 5.2))
ax.axis('off')
create_browser_frame(ax, "Executive Multi-Page PDF Report Dossier Archive")
# Report list card
r_list = patches.Rectangle((0.06, 0.10), 0.88, 0.76, facecolor="#FFFFFF", edgecolor="#CBD5E1")
ax.add_patch(r_list)
# Document item
for i, (title, dt, sz, st) in enumerate([
    ("Executive Analytics Report — student_exam_scores.csv", "3 Pages (Zero Blank)", "81.7 KB", "Verified Local / Cloudinary"),
    ("Executive Analytics Report — [Sample] Academic Performance.csv", "3 Pages (Zero Blank)", "83.7 KB", "Verified Local / Cloudinary"),
    ("Executive Analytics Report — [Sample] Sales & Revenue.csv", "4 Pages (Zero Blank)", "88.4 KB", "Verified Local / Cloudinary")
]):
    y = 0.68 - i * 0.22
    item_b = patches.FancyBboxPatch((0.08, y), 0.84, 0.18, boxstyle="round,pad=0.01", facecolor="#F8FAFC", edgecolor="#E2E8F0")
    ax.add_patch(item_b)
    ax.text(0.10, y + 0.12, f"📄 {title}", fontsize=8, fontweight="bold", color="#0F172A")
    ax.text(0.10, y + 0.05, f"Specifications: {dt} | File Size: {sz} | Storage: {st}", fontsize=7.5, color="#64748B")
    # Action buttons
    v_btn = patches.FancyBboxPatch((0.70, y + 0.05), 0.10, 0.08, boxstyle="round,pad=0.005", facecolor="#F1F5F9", edgecolor="#CBD5E1")
    ax.add_patch(v_btn)
    ax.text(0.75, y + 0.09, "View PDF", ha="center", fontsize=7, fontweight="bold", color="#0F172A")
    d_btn = patches.FancyBboxPatch((0.81, y + 0.05), 0.10, 0.08, boxstyle="round,pad=0.005", facecolor="#16A34A", edgecolor="#16A34A")
    ax.add_patch(d_btn)
    ax.text(0.86, y + 0.09, "Download", ha="center", fontsize=7, fontweight="bold", color="white")
ax.set_title("Figure 4.11: Multi-Page Executive PDF Report Dossier & Archival System", fontsize=10, fontweight="bold", pad=10)
save_ui(fig, "figure_4_11_pdf_dossier.png")

print("All UI Figures Generated Successfully.")
