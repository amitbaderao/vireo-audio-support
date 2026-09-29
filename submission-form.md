# Vireo Audio Support Analytics — Submission Form

## 1. Business Goal
The primary business objective is to evaluate customer support operations, service level agreements (SLAs), transfer friction, and contact costs across 18 months of helpdesk data for Vireo Audio Pvt. Ltd. Specifically, this analysis addresses the executive headcount debate among leadership (Priya Raman, Neha Kulkarni, Arjun Mehta) regarding the optimal deployment of two budgeted support hires (~₹9 Lakh/year) and investigates whether intake volume warrants allocating them to Billing, or whether workflow bottlenecks and misrouting point to a different operational intervention.

## 2. Data Used
The application utilizes the actual production datasets provided by Vireo Audio:
- **`tickets.csv`**: 11,780 total records containing customer tickets, channel, category, priority, assigned team, resolving agent ID, transfers, CSAT score, refunds, replacements, customer message, agent notes, and source system.
- **`agents.csv`**: 44 agent roster assignments specifying agent ID, display name, site (Bengaluru, Indore), assigned functional team, shift (Morning, Day, Night), tier (1 or 2), and tenure dates.
- **`customers.csv`**: 9,500 customer profiles including city, state, signup date, and Care Plus membership flag.
- **`orders.csv`**: 15,000 order transactions including order ID, customer ID, product SKU, order date, channel, quantity, order value in INR, and manufacturing lot code.
- **`products.csv`**: 14 Vireo Audio products across Earbuds, Headphones, Speakers, and Smartwatches, detailing unit manufacturing cost, retail price, launch date, and warranty duration.
- **`support-policy.pdf`**: Vireo Audio Customer Support Operating Policy v3.2 (SLAs, cost standards, refund rules, team ownership definitions, Freshdesk migration context).
- **`email-thread.txt`**: Stakeholder correspondence establishing context, hypotheses, and constraints.

## 3. Reporting Period
- **Reporting Window**: **1 January 2025 through 30 June 2026** (inclusive).
- **Total Rows in Window**: Exactly **11,641 tickets** (139 pre-2025 legacy test records outside the window are systematically excluded from reporting).

## 4. Method
- **Backend Architecture**: Built with Python 3.13 and FastAPI, implementing vectorized pandas and numpy calculations for SLA response breaches, handle times, contact costs, transfer metrics, and referential joins.
- **Frontend Architecture**: Built with React (Vite, JavaScript, Tailwind CSS, Recharts, Lucide React), providing a SaaS-grade executive dashboard with responsive navigation, interactive KPI filtering, and drill-down ticket exploration.
- **Timestamp Handling**: All helpdesk timestamps are treated in Indian Standard Time (IST) per Policy §9.
- **Referential Integrity**: Robust joins on `customer_id`, `order_id` (fallback to `customer_id` + `product_sku`), `product_sku`, and `agent_id` (using unique ID rather than name to prevent collisions).

## 5. Team Analysis
In accordance with **Support Operating Policy §6**, teams are strictly segmented by operational tier:
- **Tier 1 (Frontline & Functional Units)**:
  - *Chat Frontline*: 3,030 assigned tickets (26.0% of company, 27.3% of Tier 1), 3,078 resolved tickets, 8.01 hrs avg handle time, 7.46% SLA breach rate.
  - *Billing*: 2,425 assigned tickets (20.8% of company, 21.8% of Tier 1), 1,798 resolved tickets, 16.98 hrs avg handle time, 19.67% SLA breach rate (highest breach rate in company).
  - *Logistics*: 1,905 assigned tickets (16.4% of company, 17.1% of Tier 1), **2,574 resolved tickets** (+669 tickets absorbed via hand-offs), **38.18 hrs avg handle time** (1.6 days, median 24.38 hrs), 9.66% SLA breach rate.
  - *Email Frontline*: 1,807 assigned tickets (15.5%), 1,658 resolved tickets, 6.30 hrs avg handle time, 10.96% SLA breach rate.
  - *Returns Desk*: 1,049 assigned tickets (9.0%), 1,117 resolved tickets, 37.08 hrs avg handle time, 10.77% SLA breach rate.
  - *Voice Frontline*: 900 assigned tickets (7.7%), 766 resolved tickets, 6.55 hrs avg handle time, 5.67% SLA breach rate.
- **Tier 2 (Escalations & Warranty)**:
  - 525 assigned tickets (4.5%), 650 resolved tickets, **129.71 hrs avg handle time (~5.4 days)**, 8.19% SLA breach rate.
  - *Policy Distinction*: Tier 2 cases are multi-touch hardware RMAs and warranty certified; per policy rules, Tier 2 agents are not evaluated or compared on raw frontline closure volumes.

## 6. Category Analysis
- Categories represent the intake chatbot's initial taxonomy tagging at creation.
- 11 Discrete Categories analyzed:
  1. *Billing & Payments*: 2,425 tickets (20.83%)
  2. *Delivery & Shipping*: 1,905 tickets (16.36%)
  3. *Other*: 1,622 tickets (13.93%)
  4. *Returns & Refunds*: 1,049 tickets (9.01%)
  5. *Connectivity*: 1,002 tickets (8.61%)
  6. *Charging & Battery*: 820 tickets (7.04%)
  7. *App & Firmware*: 699 tickets (6.00%)
  8. *Product Enquiry*: 612 tickets (5.26%)
  9. *Audio Quality*: 591 tickets (5.08%)
  10. *Warranty & Repair*: 525 tickets (4.51%)
  11. *Account & Login*: 391 tickets (3.36%)
- *Root Cause Discovery*: The chatbot routes 100% of tickets tagged as "Billing & Payments" to the Billing queue. Because customers frequently quote payment dates when inquiring about delayed shipments, 696 of these tickets were subsequently transferred to and resolved by Logistics.

## 7. Validation / Data-Quality Checks
- **Total Source Records**: 11,780 rows.
- **Reporting Window Records**: 11,641 rows (Jan 1, 2025 to Jun 30, 2026). Excluded: 139 rows.
- **Duplicate Ticket IDs**: Exactly 0 duplicates (100% primary key uniqueness).
- **Referential Integrity**:
  - `tickets.customer_id` → `customers.customer_id`: 100.00% match.
  - `tickets.order_id` → `orders.order_id`: 100.00% match for non-null order IDs (3,969 nulls due to customer omitting order number, fallback to customer_id + SKU).
  - `tickets.product_sku` → `products.sku`: 100.00% match.
  - `tickets.agent_id` → `agents.agent_id`: 100.00% match.
- **Missing Value Handling**:
  - `first_response_at`: 0 missing.
  - `resolved_at`: 577 missing (matches active open: 332 and pending: 245 tickets).
  - `transfers`: 3,913 missing. Validated as pre-migration Freshdesk tickets where transfers did not exist. Handled as blank, NOT zero.
  - `csat_score`: 6,353 missing (54.6% non-response rate, consistent with policy benchmark of ~45% response). Excluded from averages.

## 8. Cost Per Run / Month
- **Actual Channel Contact Cost**: ₹31,82,240 (Chat ₹11.11L, Email ₹9.17L, Voice ₹8.85L, Social ₹2.69L).
- **Documented Blended Contact Standard**: ₹290 / contact = ₹33,75,890 over reporting period.
- **Future Planning Volume (650 tickets/week)**:
  $$\text{Monthly Tickets} = \frac{650 \times 52}{12} = 2,816.67\text{ tickets/month}$$
  $$\text{Projected Monthly Contact Cost} = 2,816.67 \times ₹290 = ₹8,16,833.33\text{ / month}$$
  $$\text{Projected Annual Contact Cost} = ₹98,02,000\text{ / year (₹98.02 Lakhs)}$$
- **Headcount Budget**: 2 hires = ₹9,00,000 / year (₹75,000 / month total, or ₹37,500 / month per agent). Fully loaded shift standard = ₹165/hr × 8 hrs = ₹1,320 / shift.

## 9. SLA Cost
- **SLA Breach Thresholds**: Chat 15 min, Voice 2 hrs, Social 4 hrs, Email 8 hrs.
- **Total Breaches in Period**: 1,292 tickets (11.10% overall breach rate).
- **Channel Breach Rates**: Chat 12.78%, Email 12.13%, Social 7.93%, Voice 5.82%.
- **SLA Compensation Standard (Policy §3)**: Breached tickets receive an automatic ₹350 store credit.
- **Estimated SLA Credit Exposure**:
  $$1,292 \times ₹350 = ₹4,52,200\text{ (₹4.52 Lakhs)}$$
- Billing team accounts for ₹1,66,950 (36.9%) of all SLA breach penalties due to its 19.67% breach rate.

## 10. Transfer Cost
- **Recorded Transfers in Helpdesk Cohort**: 1,299 hand-offs across 1,090 tickets (14.10% helpdesk transfer rate).
- **Internal Transfer Standard (Policy §4)**: ₹305 per transfer (re-handling and administrative overhead).
- **Total Recorded Transfer Cost**:
  $$1,299 \times ₹305 = ₹3,96,195\text{ (₹3.96 Lakhs)}$$
- **Total Estimated Operating Cost**:
  $$\text{Actual Contact Cost (₹31.82L)} + \text{Transfer Cost (₹3.96L)} + \text{SLA Credits (₹4.52L)} = ₹40,30,635\text{ (₹40.31 Lakhs)}$$

## 11. Important Findings & Executive Recommendation
1. **Refutation of Priya Raman's Premise**: Chat Frontline is actually the largest intake queue (3,030 tickets = 26.0% vs Billing's 2,425 = 20.8%).
2. **Confirmation of Neha Kulkarni's Observation**: Logistics is bearing the heaviest operational burden, resolving 2,574 tickets with a 38.18-hour average handle time.
3. **Identification of the Routing Leak**: 696 tickets assigned to Billing were transferred to Logistics because the intake bot misclassifies delivery delays where money was paid.
4. **Validation of Arjun Mehta's Strategy**: Allocating 2 hires to Billing is unjustified. Fixing the chatbot intake flow eliminates ~696 transfers, saves ₹2.12 Lakhs in transfer waste, and reduces Billing's queue to a manageable volume. If the ₹9 Lakh budget is deployed, hiring into Logistics (1 agent) and Chat Frontline (1 agent) provides maximum ROI.

## 12. Limitations
- Transfers data is only available for tickets created on or after helpdesk launch (14 Sep 2025). The earlier Freshdesk system did not capture team transfers.
- CSAT response is voluntary (~45.4% response rate), meaning scores may slightly over-represent strongly satisfied or strongly frustrated customers.

## 13. Known Flaws in Source Data
- Pre-migration Freshdesk monetary values and reconstructed resolution timestamps.
- Intake bot taxonomy ambiguity between payment confirmation and delivery tracking.
- Multiple agents sharing display names (addressed by enforcing `agent_id` as primary key).

## 14. Omissions
- Out-of-window records (139 rows prior to 1 Jan 2025) were deliberately excluded from core reporting metrics to adhere to the prompt's explicit 18-month reporting window requirement.

## 15. Extra Work Done
- Implemented dual-mode frontend delivery: runs as a standalone Vite development server with proxy (`http://localhost:5173`) and is also embedded as a compiled production application served directly from FastAPI (`http://localhost:8000`).
- Added an interactive Ticket Detail Modal with relational customer, order, and product lookups.
- Added dynamic filtering, full-text search, and multi-parameter pagination across 11,641 records.
- Built an automated API test suite verifying all 13 REST endpoints.

## 16. AI / Tools Used
- Gemini 3.8 Flash (Medium) coding assistant via Google Antigravity.
- Python 3.13, FastAPI, Uvicorn, Pandas, NumPy.
- Node.js v22, React 18, Vite 5, Tailwind CSS 3, Recharts 2, Lucide React.

## 17. Development Hours
- Total Development Time: Approximately 4.5 hours (including data inspection, statistical calculation, API design, frontend construction, testing, and documentation).

## 18. Deliverables & Links
- **GitHub Repository**: [https://github.com/amitbaderao/vireo-audio-support](https://github.com/amitbaderao/vireo-audio-support)
- **Google Drive Link**: `[PLACEHOLDER: Insert Google Drive link here]`
- **3-Minute Recording Link**: `[PLACEHOLDER: Insert 3-minute video recording link here]`
