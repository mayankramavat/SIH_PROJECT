/**
 * LMIS REST API Client Service (SIH_26246)
 * Connects frontend dashboard to the FastAPI backend.
 * Uses VITE_API_BASE_URL if configured, otherwise falls back to relative path (Vite proxy).
 */

const API_BASE = import.meta.env?.VITE_API_BASE_URL || '';

function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== 'All' &&
      value !== 'All States' &&
      value !== 'All Districts' &&
      value !== 'All Sectors' &&
      value !== 'All Trades'
    ) {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[LMIS API] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

// -------------------------------------------------------------------------
// Core API Methods (Directly bound to FastAPI Backend Routes)
// -------------------------------------------------------------------------

export async function getHealth() {
  return request('/health');
}

export async function getDashboardSummary() {
  return request('/api/dashboard/summary');
}

export async function getStates() {
  return request('/api/locations/states');
}

export async function getDistricts(state) {
  const qs = buildQueryString({ state });
  return request(`/api/locations/districts${qs}`);
}

export async function getTrades(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/locations/trades${qs}`);
}

export async function getDemand(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/demand${qs}`);
}

export async function getSupply(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/supply${qs}`);
}

export async function getForecast(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/forecast${qs}`);
}

export async function getForecastSummary(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/forecast/summary${qs}`);
}

export async function getModelEvaluation() {
  return request('/api/forecast/evaluation');
}

export async function getGap(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/gap${qs}`);
}

export const getGaps = getGap;

export async function getShortages(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/gap/shortages${qs}`);
}

export async function getOversupply(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/gap/oversupply${qs}`);
}

export async function getAlerts(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/alerts${qs}`);
}

export async function getHighAlerts(params = {}) {
  const qs = buildQueryString(params);
  return request(`/api/alerts/high${qs}`);
}
