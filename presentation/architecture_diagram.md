# System Architecture Overview — National LMIS (SIH_26246)

> **"From Raw Labour Signals to Proactive Policy Decisions"**

This document explains the high-resolution architecture diagram located at [`presentation/architecture.png`](file:///c:/Users/HP/OneDrive/Desktop/sih/SIH_26246/presentation/architecture.png) in simple, plain English that anyone (judges, policy officers, or students) can immediately understand.

---

## 🖼️ The 4-Tier Flow (How the Platform Works)

```
┌─────────────────┐       ┌────────────────────┐       ┌────────────────────┐       ┌──────────────────────┐
│ 1. DATA SOURCES │ ───►  │ 2. AI & ML ENGINE  │ ───►  │ 3. FASTAPI BACKEND │ ───►  │ 4. INTERACTIVE WEB  │
│  (Where data    │       │  (The Brain:       │       │  (High-speed REST  │       │  (React Dashboard:   │
│   comes from)   │       │   Predict & Match) │       │   API & Analytics) │       │   Map, Policy Sim)   │
└─────────────────┘       └────────────────────┘       └────────────────────┘       └──────────────────────┘
```

---

### Tier 1: Data Sources (Where Data Comes From)
*Answers: "What information feeds into the system?"*

1. **NCS Job Portals & Employer Postings**: Live job vacancies and hiring growth rates posted by companies across India.
2. **ITIs (Industrial Training Institutes)**: Official training seat capacity and enrolled trainee numbers.
3. **PMKVY & Skill India Missions**: Certified candidate numbers graduating from government skill programs.
4. **Employment Exchanges & Tracer Studies**: Post-training job placement rates and absorption into the workforce.

---

### Tier 2: AI & ML Engine (The Brain of the Platform)
*Answers: "How does the system turn numbers into intelligence?"*

1. **Data Cleaning & Standardization**: Strips duplicates, fills gaps, and scales metrics between 0 and 100 for fair comparison.
2. **Demand Index & Supply Index**: Measures the intensity of industry hiring vs. available trained candidates.
3. **Random Forest Forecaster (3, 6, 12 Months)**:
   - Uses historical lags and 3-month moving averages to project future labour demand up to 1 year ahead.
   - Constrained to realistic non-negative values.
4. **Skill Gap Engine**:
   - `Skill Gap = Demand − Supply`
   - Classifies trades into:
     - 🔴 **SHORTAGE**: Demand exceeds supply by >15% (Urgent action needed).
     - 🟢 **BALANCED**: Supply matches demand within ±15%.
     - 🟡 **OVERSUPPLY**: Too many trainees for too few jobs.

---

### Tier 3: FastAPI Backend Services (The Delivery Highway)
*Answers: "How does data get delivered instantly and securely?"*

1. **RESTful API**: Fast Python 3 endpoints delivering JSON responses in milliseconds.
2. **Dynamic Filtering Engine**: Instant query slicing by State, District, Sector, and Vocational Trade.
3. **Early Warning Dispatcher**: Automatically triggers `HIGH`, `MEDIUM`, and `LOW` alerts for emerging shortages before they hit industries.
4. **Security & Validation**: Strict Pydantic type safety and CORS integration.

---

### Tier 4: Interactive Web Dashboard (What the User Experiences)
*Answers: "Who uses this and what can they do?"*

1. **Executive KPI Cards**: Real-time totals for Demand, Supply, Net Deficit, Shortage Areas, and Warnings.
2. **Interactive India Map**: Visual territory explorer with state-level drill-down and comparison tables.
3. **Policy Scenario Simulator**: An interactive slider allowing planning officers to ask: *"What if we expand ITI training capacity by +20%?"* and see the net gap shrink in real time.
4. **Early Warning Center**: Proactive alert feeds categorized by severity for rapid administrative intervention.
5. **One-Click CSV Export**: Instant report generation for State Executive Committees and District Collectors.

---

## ⏱️ 30-Second Speaking Pitch for Presentations

> *"Our architecture connects raw, fragmented employment data to real-time policy action in 4 steps:*
>
> 1. *We **ingest** hiring demand and training supply from portals like NCS and PMKVY.*
> 2. *Our **AI engine** uses Random Forest regression to predict demand 3, 6, and 12 months ahead, identifying exactly where shortages will appear.*
> 3. *Our **FastAPI backend** delivers these calculations instantly through secure REST endpoints.*
> 4. *Officers interact with a **modern React dashboard** featuring an interactive India map, automated alerts, and a Policy Simulator to plan training budgets before shortages happen."*
