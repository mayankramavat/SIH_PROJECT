# Labour Market Intelligence Portal (SIH 26246, MSDE)
## Data Architecture & Integration Guide

This frontend has been engineered to run **100% standalone** out-of-the-box using local mock JSON files, with a modular data service layer (`/src/services/dataService.js`) designed for seamless switching to live FastAPI endpoints or real government data exports.

---

## 1. Directory Structure

```text
frontend/
├── src/
│   ├── data/
│   │   ├── overviewData.json       # KPI cards, 12M demand trend, top 5 sectors
│   │   ├── demandSupplyData.json   # State/Sector/Year filters, demand vs supply, skill gap
│   │   ├── occupationsData.json    # NCO 2015 codes, occupations, sectors, skills, NSQF levels
│   │   ├── forecastData.json       # Historical past 12M + dotted 12M forecast series, AI insights
│   │   └── dataSourcesData.json    # 8 Official government portals and data specifications
│   │
│   ├── services/
│   │   ├── dataService.js          # Central data provider (toggles mock vs live FastAPI)
│   │   └── api.js                  # REST API client connecting to FastAPI backend
│   │
│   ├── components/
│   │   ├── HorizontalNavbar.jsx    # Top sticky bar + horizontal navigation tabs
│   │   └── SummaryCard.jsx         # Metric card with trends and badges
│   │
│   └── pages/
│       ├── OverviewPage.jsx        # Row 1 (4 cards), Row 2 (2 charts), Row 3 (table)
│       ├── DemandSupplyPage.jsx    # Horizontal filter row, grouped bar chart, gap table
│       ├── OccupationExplorerPage.jsx # Wide search bar, NCO/skills/NSQF full-width table
│       ├── ForecastPage.jsx        # Dropdown, past + dotted line chart, AI insight box
│       └── DataSourcesPage.jsx     # Horizontal grid of cards linking to 8 portals
```

---

## 2. How to Swap in Real Mock Data Files

All mock data files are in `/src/data/`. To update the dashboard with fresh dataset exports:

### A. Overview Data (`/src/data/overviewData.json`)
- **`summaryCards`**: Update `totalJobOpenings`, `topDemandedSector`, `topSkillInDemand`, and `skillGapPercentage`.
- **`demandTrendLast12Months`**: Array of `{ "month": "Apr 2024", "demand": 120000, "supply": 95000 }`.
- **`topSectorsByDemand`**: Array of `{ "sector": "Sector Name", "demand": 45000, "growth": "+15.2%" }`.

### B. Demand vs Supply Data (`/src/data/demandSupplyData.json`)
- **`filters`**: Add newly covered states, sectors, or fiscal years to `states`, `sectors`, and `years`.
- **`skillsData`**: Array of items:
  ```json
  {
    "id": "SK-01",
    "skill": "Skill Trade Title",
    "sector": "Sector Name",
    "state": "State Name",
    "year": "2024 (Current)",
    "demand": 14200,
    "supply": 8900,
    "gap": 5300,
    "gapPercentage": 37.3,
    "status": "Shortage",
    "recommendedAction": "Actionable policy recommendation"
  }
  ```

### C. Occupation Explorer Data (`/src/data/occupationsData.json`)
- Add rows corresponding to the official **NCO 2015** 8-digit or 4-digit occupational taxonomy:
  ```json
  {
    "ncoCode": "2512.0101",
    "occupation": "Software Developer & Cloud Engineer",
    "sector": "IT & Software Services",
    "skills": ["Python", "Cloud Architecture", "Docker"],
    "nsqfLevel": "Level 6",
    "demandStatus": "High Demand",
    "medianSalary": "₹6.5 - 12.0 LPA",
    "description": "Role profile and competency summary."
  }
  ```

### D. Forecasting Data (`/src/data/forecastData.json`)
- **`options`**: Dropdown items for sectors or skills.
- **`series[id].timeline`**: 24 chronological data points:
  - Months 1-12: `historical` populated with actuals, `forecast` is null.
  - Month 12: Shared bridge point (`historical` = `forecast`).
  - Months 13-24: `forecast` populated with predictions, `historical` is null.
- **`aiInsights`**: Array of 2-3 key takeaway bullet points.

---

## 3. Switching to Live FastAPI Backend

The application includes a dual-mode data service. You can switch to the live backend in two ways:

### Option 1: Live Toggle in UI (Instant)
Click the **"FastAPI Live"** pill button in the top right corner of the navbar. The application will immediately begin fetching from `/api/` endpoints. If the backend is temporarily unreachable, it will gracefully fall back to local mock data without breaking the UI.

### Option 2: Code Switch (`/src/services/dataService.js`)
Change the default mode:
```javascript
// In src/services/dataService.js:
let currentMode = 'api'; // default was 'mock'
```

### Option 3: Environment Variable
In `.env` or `.env.production`:
```env
VITE_API_BASE_URL=http://localhost:8000
```
Vite proxy in `vite.config.js` is already configured to forward `/api` and `/health` requests to port 8000.

---

## 4. Running the Frontend

To start the Vite development server:
```bash
cd frontend
npm run dev
```

To build for production:
```bash
cd frontend
npm run build
```
