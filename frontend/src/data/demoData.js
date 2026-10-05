/**
 * demoData.js — Fallback static demo dataset for offline/disconnected presentations.
 * This is ONLY used if the FastAPI backend at http://127.0.0.1:8000 is unreachable.
 * All live data is fetched from the API in normal operation.
 */

export const demoDashboardSummary = {
  total_demand: 18375,
  total_supply: 11850,
  net_gap: 6525,
  gap_percentage: 35.5,
  shortage_count: 27,
  balanced_count: 12,
  oversupply_count: 5,
  forecast_demand_3m: 19200,
  forecast_demand_6m: 19950,
  forecast_demand_12m: 20591,
  total_alerts: 432,
  high_alerts: 89,
};

export const demoTopShortages = [
  { state: "Maharashtra", district: "Pune", sector: "IT-ITeS", trade: "Junior Software Developer", demand: 1650, supply: 680, gap: 970, gap_percentage: 58.8, gap_status: "SHORTAGE" },
  { state: "Karnataka", district: "Bengaluru Urban", sector: "IT-ITeS", trade: "Web Developer", demand: 1420, supply: 510, gap: 910, gap_percentage: 64.1, gap_status: "SHORTAGE" },
  { state: "Tamil Nadu", district: "Chennai", sector: "Healthcare", trade: "General Duty Assistant", demand: 980, supply: 340, gap: 640, gap_percentage: 65.3, gap_status: "SHORTAGE" },
  { state: "Gujarat", district: "Ahmedabad", sector: "Manufacturing", trade: "CNC Operator", demand: 870, supply: 390, gap: 480, gap_percentage: 55.2, gap_status: "SHORTAGE" },
  { state: "Uttar Pradesh", district: "Lucknow", sector: "BFSI", trade: "Accounts Executive", demand: 760, supply: 320, gap: 440, gap_percentage: 57.9, gap_status: "SHORTAGE" },
];

export const demoStates = [
  "Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu", "Uttar Pradesh",
  "Rajasthan", "Telangana", "West Bengal", "Madhya Pradesh", "Punjab",
];

export const demoDistricts = {
  "Maharashtra": ["Pune", "Mumbai Suburban", "Nagpur", "Nashik", "Aurangabad"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Ghaziabad"],
};

export const demoTrades = [
  "Junior Software Developer",
  "Web Developer",
  "Data Entry Operator",
  "CNC Operator",
  "General Duty Assistant",
  "Accounts Executive",
  "Solar Panel Installation Technician",
  "Sewing Machine Operator",
];
