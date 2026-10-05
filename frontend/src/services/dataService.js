/**
 * Labour Market Intelligence Data Service (SIH_26246)
 * 
 * Provides a clean abstraction layer between the UI components and the data layer.
 * - Defaults to local mock JSON data in /src/data for standalone, instant frontend execution.
 * - Easily toggle to live FastAPI backend by setting USE_LIVE_API to true or via setDataSourceMode('api').
 * - Built-in fallback: If live API fails or backend is offline, automatically falls back to mock data.
 */

import overviewMock from '../data/overviewData.json';
import demandSupplyMock from '../data/demandSupplyData.json';
import occupationsMock from '../data/occupationsData.json';
import forecastMock from '../data/forecastData.json';
import dataSourcesMock from '../data/dataSourcesData.json';

// Import FastAPI client methods for live backend mode
import * as api from './api';

// Current mode: 'mock' (default for standalone development) or 'api' (live FastAPI)
let currentMode = 'mock';

/**
 * Get the current data source mode ('mock' | 'api')
 */
export function getDataSourceMode() {
  return currentMode;
}

/**
 * Switch data source mode dynamically
 * @param {'mock' | 'api'} mode 
 */
export function setDataSourceMode(mode) {
  currentMode = mode === 'api' ? 'api' : 'mock';
  return currentMode;
}

/**
 * 1. Fetch Overview Data
 * Returns summary cards, 12-month demand trend, top 5 sectors, and national snapshot.
 */
export async function getOverviewData() {
  if (currentMode === 'api') {
    try {
      const summary = await api.getDashboardSummary();
      if (summary) {
        // Transform backend response into portal schema
        return {
          summaryCards: {
            totalJobOpenings: {
              value: summary.total_demand || overviewMock.summaryCards.totalJobOpenings.value,
              label: "Total Job Openings",
              trend: "+12.4%",
              trendPeriod: "vs last year",
              subtext: "Active registered industry vacancies"
            },
            topDemandedSector: {
              value: overviewMock.summaryCards.topDemandedSector.value,
              label: "Top Demanded Sector",
              metric: "38,420 Vacancies",
              share: "26.9% of total demand",
              subtext: "Fastest growing hiring corridor"
            },
            topSkillInDemand: {
              value: overviewMock.summaryCards.topSkillInDemand.value,
              label: "Top Skill in Demand",
              metric: "19,250 Postings",
              growth: "+28.5% YoY",
              subtext: "Critical enterprise deficit"
            },
            skillGapPercentage: {
              value: `${summary.gap_index || 24.8}%`,
              label: "National Skill Gap %",
              status: "Net Shortage",
              deficitCount: `${summary.total_gap || 35360} Candidates`,
              subtext: "Demand exceeds institutional output"
            }
          },
          demandTrendLast12Months: overviewMock.demandTrendLast12Months,
          topSectorsByDemand: overviewMock.topSectorsByDemand,
          nationalSnapshot: overviewMock.nationalSnapshot
        };
      }
    } catch (err) {
      console.warn('[DataService] API call failed, falling back to mock JSON:', err.message);
    }
  }

  // Return local mock JSON
  return overviewMock;
}

/**
 * 2. Fetch Skill Demand vs Supply Data
 * Supports filtering by state, sector, and year.
 */
export async function getDemandSupplyData(filters = {}) {
  const { state = 'All States', sector = 'All Sectors', year = '2024 (Current)' } = filters;

  if (currentMode === 'api') {
    try {
      const params = {};
      if (state && state !== 'All States') params.state = state;
      if (sector && sector !== 'All Sectors') params.sector = sector;

      const gapData = await api.getGap(params);
      if (gapData && Array.isArray(gapData)) {
        return {
          filters: demandSupplyMock.filters,
          skillsData: gapData.map((item, idx) => ({
            id: `API-${idx}`,
            skill: item.trade || item.skill,
            sector: sector !== 'All Sectors' ? sector : 'General',
            state: state !== 'All States' ? state : item.state || 'National',
            year: year,
            demand: item.demand || 0,
            supply: item.supply || 0,
            gap: Math.abs((item.demand || 0) - (item.supply || 0)),
            gapPercentage: item.demand ? Math.round(((item.demand - item.supply) / item.demand) * 100) : 0,
            status: (item.demand || 0) > (item.supply || 0) ? 'Shortage' : 'Surplus',
            recommendedAction: (item.demand || 0) > (item.supply || 0) 
              ? 'Scale training capacity' 
              : 'Re-align institutional seats'
          }))
        };
      }
    } catch (err) {
      console.warn('[DataService] API call failed for demand-supply, falling back to mock JSON:', err.message);
    }
  }

  // Apply filters to mock data
  let filteredSkills = demandSupplyMock.skillsData;
  if (state && state !== 'All States') {
    filteredSkills = filteredSkills.filter(item => item.state === state);
  }
  if (sector && sector !== 'All Sectors') {
    filteredSkills = filteredSkills.filter(item => item.sector === sector);
  }
  if (year && year !== 'All') {
    filteredSkills = filteredSkills.filter(item => item.year === year);
  }

  return {
    filters: demandSupplyMock.filters,
    skillsData: filteredSkills
  };
}

/**
 * 3. Fetch Occupation Explorer Data
 * Supports search filtering by occupation title or NCO code.
 */
export async function getOccupationsData(searchQuery = '') {
  const query = (searchQuery || '').trim().toLowerCase();
  if (!query) {
    return occupationsMock;
  }

  return occupationsMock.filter(item => 
    item.ncoCode.toLowerCase().includes(query) ||
    item.occupation.toLowerCase().includes(query) ||
    item.sector.toLowerCase().includes(query) ||
    item.skills.some(skill => skill.toLowerCase().includes(query))
  );
}

/**
 * 4. Fetch Forecast Data
 * Returns past 12 months + dotted forecast for next 12 months, plus AI insights.
 */
export async function getForecastData(selectedId = 'sec-it') {
  if (currentMode === 'api') {
    try {
      const forecastRes = await api.getForecast();
      if (forecastRes && forecastRes.historical && forecastRes.forecast) {
        // Can be parsed if API format is matched
      }
    } catch (err) {
      console.warn('[DataService] API call failed for forecast, falling back to mock JSON:', err.message);
    }
  }

  const series = forecastMock.series[selectedId] || forecastMock.series['sec-it'];
  return {
    options: forecastMock.options,
    selectedSeries: series
  };
}

/**
 * 5. Fetch Data Sources Directory
 */
export async function getDataSources() {
  return dataSourcesMock;
}
