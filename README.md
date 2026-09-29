# Vireo Audio — Customer Support Analytics Platform

A production-grade executive support analytics dashboard and REST API built for **Vireo Audio Pvt. Ltd.** to analyze 18 months of customer support helpdesk tickets, evaluate team capacity, compute operational contact and SLA breach costs, and resolve executive stakeholder debates on workforce planning.

---

## 📌 Executive Overview & Core Problem

In September 2026, Vireo Audio's executive leadership engaged in an internal debate regarding the allocation of two approved customer support hires (**₹9,00,000 / year total budget**):
- **Priya Raman (Head of CX)** proposed assigning both hires directly to **Billing**, asserting that Billing represents their "biggest queue by a mile, 22% of tickets" vs Logistics (16%).
- **Neha Kulkarni (Support Operations Manager)** argued that Billing's queue is artificially inflated and that **Logistics** is drowning under 1+ day resolution times and absorbing hand-offs from other teams.
- **Arjun Mehta (Finance Controller)** requested written empirical proof before signing off, noting a preference to "fix a process than hire into it if that's an option."

### 🎯 Key Empirical Findings
1. **Intake Queue Reality**: Chat Frontline is actually the largest intake queue (**3,030 tickets = 26.0%**), while Billing is second (**2,425 tickets = 20.8%**).
2. **The 696 Transfer Leak**: 28.7% of tickets initially assigned to Billing (696 tickets) were actually transferred to and resolved by **Logistics**. The chatbot misclassifies shipment tracking inquiries where a payment occurred as "Billing & Payments".
3. **Logistics Operational Strain**: Logistics resolved **2,574 tickets** (43% more than Billing's 1,798 resolved tickets) and suffered an average handle time of **38.18 hours** (1.6 days).
4. **Financial Recommendation**: Do **not** hire 2 agents into Billing. Correcting the chatbot taxonomy saves **₹2,12,280 in direct transfer costs** (696 × ₹305) and lowers Billing's 19.67% SLA breach rate. If the ₹9 Lakh budget is deployed, allocating 1 hire to Logistics and 1 hire to Chat Frontline yields maximum customer impact.

---

## 🏗️ Architecture & Technology Stack

- **Backend**:
  - **Python 3.13** + **FastAPI**
  - **Pandas** & **NumPy** for vectorized SLA, cost, and cross-tabulation analytics
  - **Uvicorn** ASGI server
- **Frontend**:
  - **React 18** (JavaScript, no TypeScript)
  - **Vite 5** build tool and development server
  - **Tailwind CSS 3** for SaaS UI styling
  - **Recharts 2** for responsive charts and visualizations
  - **Lucide React** for icons
- **Data Storage**:
  - In-memory relational joins across CSV datasets (`tickets.csv`, `agents.csv`, `customers.csv`, `orders.csv`, `products.csv`).

---

## 📂 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI application, routing, static SPA mount
│   ├── data_service.py      # Core business logic, SLA math, cost engines, data joins
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Header, Sidebar, KpiCard, TicketDetailModal
│   │   ├── views/           # ExecutiveSummary, Volume, Team, Category, SlaCost, Transfers, TicketExplorer, DataQuality
│   │   ├── App.jsx          # Dashboard root view container & state coordinator
│   │   ├── main.jsx         # React DOM entry point
│   │   └── index.css        # Tailwind directives and custom scrollbars
│   ├── dist/                # Production optimized build bundle
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration with /api reverse proxy
│   └── tailwind.config.js   # Tailwind design tokens
├── data/
│   ├── tickets.csv          # 11,780 helpdesk tickets (Jan 2025 – Jun 2026 window: 11,641)
│   ├── agents.csv           # 44 agent roster profiles with shifts, sites, and tiers
│   ├── customers.csv        # 9,500 customer records with Care Plus status
│   ├── orders.csv           # 15,000 order records
│   ├── products.csv         # 14 product SKUs with retail prices and warranties
│   └── email-thread.txt     # Stakeholder context and instructions
├── docs/
│   └── support-policy.md    # Operating Policy v3.2 verbatim reference
├── submission-form.md       # Standardized project evaluation submission form
├── README.md                # System documentation
└── .gitignore               # Ignored build artifacts, secrets, and caches
```

---

## ⏱️ Reporting Window & Data Scope

- **Main Reporting Period**: **1 January 2025 through 30 June 2026** (inclusive).
- **Total Tickets Analyzed**: Exactly **11,641 tickets**.
- **Out-of-Window Exclusion**: 139 legacy test records (created between 20 June 2024 and 31 December 2024) are systematically filtered out of the 18-month reporting metrics.
- **Timestamps**: All timestamps are formatted and interpreted in **Indian Standard Time (IST)** as specified in Support Policy §9.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ and npm (tested on Node v22.15.0)

### 1. Backend Setup & Run

Open a terminal in the project root:

```bash
# Optional: create virtual environment
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at: `http://127.0.0.1:8000`  
Swagger API Docs will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Run (Development Mode)

Open a second terminal:

```bash
cd frontend

# Install frontend dependencies
npm install

# Run Vite dev server with API proxy
npm run dev
```

The React dashboard will be running at: `http://localhost:5173`

> **Unified Production Mode**: The FastAPI backend also serves the pre-compiled production frontend directly at `http://127.0.0.1:8000`. You can access the entire application from port 8000 without running Vite separately.

---

## 🔌 API Endpoints Reference

All endpoints return JSON calculated dynamically from actual data:

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/summary` | Top-level executive KPIs, ticket totals, breach rates, costs |
| `GET` | `/api/monthly-volume` | 18-month ticket volume broken down by channel and source system |
| `GET` | `/api/team-summary` | Tier 1 vs Tier 2 team performance, handle time, and breach metrics |
| `GET` | `/api/monthly-team` | Monthly intake and resolved volume by functional team |
| `GET` | `/api/category-summary` | Category volume, intake bot routing, and resolution metrics |
| `GET` | `/api/monthly-category`| Monthly breakdown across all 11 categories |
| `GET` | `/api/channel-summary` | Channel volume, SLA targets, response times, and contact costs |
| `GET` | `/api/sla` | Detailed SLA breach rates by channel, team, and store credit exposure |
| `GET` | `/api/cost` | Comprehensive contact costs, transfer waste, and 650/week projection |
| `GET` | `/api/transfers` | Transfer coverage, helpdesk hand-off rates, and cross-tab matrix |
| `GET` | `/api/data-quality` | Data completeness, missing value explanations, referential joins |
| `GET` | `/api/insights` | Qualitative and quantitative stakeholder verdict synthesis |
| `GET` | `/api/tickets` | Paginated ticket explorer with filters (team, channel, status, search) |

---

## 📐 Methodologies & Business Policy Rules

### 1. Critical Policy Rule: Tier 1 vs Tier 2 Separation
Per **Support Policy §6**:
- **Tier 1 Teams**: Chat Frontline, Email Frontline, Voice Frontline, Logistics, Billing, Returns Desk.
- **Tier 2 Team**: Escalations & Warranty.
- *Mandate*: Tier 2 cases are multi-touch certified hardware claims measured on resolution in days (average **129.7 hours = ~5.4 days**). They must **never** be ranked or compared directly against Tier 1 on raw volume metrics. The dashboard enforces this distinction across all team views.

### 2. Service Level Agreement (SLA) & Breach Calculations
Per **Support Policy §3**:
- First-response targets:
  - **Chat**: 15 minutes
  - **Voice Callback**: 2 hours (120 min)
  - **Social**: 4 hours (240 min)
  - **Email**: 8 hours (480 min)
- **Breach Condition**: `(first_response_at - created_at) > channel_target`.
- **SLA Compensation**: Each breached ticket automatically issues **₹350 store credit**.
- Total breaches across reporting period: **1,292 tickets (11.10%)**, representing **₹4,52,200** in compensation liability.

### 3. Financial Cost Standards & Future Projections
Per **Support Policy §4**:
- **Fully loaded cost per contact**:
  - Chat: ₹210
  - Email: ₹260
  - Voice callback: ₹520
  - Social: ₹240
  - Actual contact cost: **₹31,82,240**
  - Documented blended standard: **₹290 / contact** (**₹33,75,890** for 11,641 tickets)
- **Internal transfer re-handling**: **₹305 per transfer** (1,299 transfers = **₹3,96,195**).
- **Future Planning Volume (650 tickets/week)**:
  $$\text{Monthly Tickets} = \frac{650 \times 52}{12} = 2,816.67\text{ tickets/month}$$
  $$\text{Projected Monthly Contact Cost} = 2,816.67 \times ₹290 = ₹8,16,833.33\text{ / month}$$
  $$\text{Annualized Run-Rate} = ₹98,02,000\text{ / year}$$

### 4. Transfer Coverage & Freshdesk Migration Handling
Per **Support Policy §9**:
- Helpdesk went live on 14 September 2025.
- The `transfers` field exists only in current helpdesk records (**7,728 rows, 66.4% coverage**).
- Pre-migration Freshdesk records (**3,913 rows**) have blank transfers. As emphasized by IT Admin Sameer Qureshi, **blank is NOT zero**. Denominators for transfer rates exclude legacy blank tickets.

---

## 🔍 Data Quality & Referential Integrity

- **Duplicate Tickets**: 0 duplicate ticket IDs across all 11,780 records.
- **Referential Joins**:
  - `tickets.customer_id` → `customers.customer_id`: **100% match**
  - `tickets.order_id` → `orders.order_id`: **100% match** (3,969 nulls where customer did not supply order number; fallback to customer + SKU)
  - `tickets.product_sku` → `products.sku`: **100% match**
  - `tickets.agent_id` → `agents.agent_id`: **100% match** (resolves identical display names)
- **Status Distribution**:
  - Resolved: 10,007
  - Closed: 1,057
  - Open: 332
  - Pending: 245

---

## 🛡️ License & Author Information

Developed for **Vireo Audio Pvt. Ltd.** Customer Experience & Operations Team.  
GitHub: [https://github.com/amitbaderao/vireo-audio-support](https://github.com/amitbaderao/vireo-audio-support)
