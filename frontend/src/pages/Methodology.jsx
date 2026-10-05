import React from 'react';
import {
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Scale,
  Award,
  BarChart2
} from 'lucide-react';

const DATA_SOURCES = [
  {
    name: 'Industry Demand & Job Postings',
    file: 'data/raw/job_postings.csv',
    frequency: 'Monthly / Real-time API',
    fields: ['state', 'district', 'sector', 'trade', 'nco_code', 'month', 'job_postings', 'hiring_growth'],
    description: 'Aggregates enterprise job postings, National Career Service (NCS) vacancies, state employment exchange requisitions, and employer survey hiring growth rates.'
  },
  {
    name: 'Skilled Worker Supply & Training Capacity',
    file: 'data/raw/training_data.csv',
    frequency: 'Quarterly Cohort Sync',
    fields: ['state', 'district', 'sector', 'trade', 'nco_code', 'training_seats', 'candidates_enrolled', 'candidates_certified'],
    description: 'Captures training intake and outputs from Industrial Training Institutes (ITIs), Pradhan Mantri Kaushal Vikas Yojana (PMKVY) centers, and state skill development missions (SSDMs).'
  },
  {
    name: 'Employment Outcomes & Placements',
    file: 'data/raw/placements.csv',
    frequency: 'Bi-annual Tracer Studies',
    fields: ['state', 'district', 'sector', 'trade', 'nco_code', 'candidates_trained', 'candidates_placed', 'placement_rate'],
    description: 'Tracks certified candidate absorption in formal and organized sectors, apprenticeship registrations under NAPS, and third-party placement verification data.'
  },
  {
    name: 'Administrative Geography Master',
    file: 'data/raw/districts.csv',
    frequency: 'Annual Census / MoPR Updates',
    fields: ['state', 'district', 'zone', 'industrial_cluster', 'population'],
    description: 'Provides standardized Local Government Directory (LGD) district identifiers, state classifications, and industrial zoning parameters.'
  },
  {
    name: 'Standardized Occupational Taxonomy',
    file: 'NCO-2015 & NSQF Level Framework',
    frequency: 'Static Ministry Standards',
    fields: ['nco_code (8-digit)', 'trade_title', 'nsqf_level (3 to 7)', 'primary_sector'],
    description: 'Binds trade definitions to the National Classification of Occupations (NCO-2015) and National Skills Qualification Framework (NSQF) competency descriptors.'
  }
];

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Data Ingestion & Hygiene',
    desc: 'Ingests multi-source raw CSVs and transactional feeds. Cleans missing values, strips whitespace, standardizes categorical casing, and enforces schema types.'
  },
  {
    step: '02',
    title: 'Standardization & Scaling',
    desc: 'Applies MinMax scaling (0 to 100) and Z-score standardization across heterogenous scales to produce uniform Demand Index and Supply Index metrics.'
  },
  {
    step: '03',
    title: 'Feature Engineering & Lags',
    desc: 'Synthesizes time-series temporal features: 1M, 2M, 3M historical demand lags, rolling quarterly moving averages, hiring velocity, and placement efficiency factors.'
  },
  {
    step: '04',
    title: 'AI/ML Demand Forecasting',
    desc: 'Trains Gradient Boosting and Random Forest regression models to forecast labour demand across 3-month, 6-month, and 12-month forward horizons.'
  },
  {
    step: '05',
    title: 'Skill Gap & Equilibrium Analysis',
    desc: 'Compares projected future demand against estimated institutional supply pipelines to calculate net candidate deficit/surplus and gap percentages.'
  },
  {
    step: '06',
    title: 'Early Warning Engine & Advisory',
    desc: 'Evaluates deficit severity rules. Dispatches automated HIGH/MEDIUM/LOW alerts to state skill missions with actionable training seat adjustment targets.'
  }
];

export default function Methodology() {
  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-govNavy-900 tracking-tight">
          Labour Market Intelligence System Methodology & Data Architecture
        </h2>
      </div>

      {/* Section 1: Ingested Data Sources */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-govCyan-600" />
          <h3 className="text-base font-bold text-govNavy-900">1. Raw Data Ingestion & Registry Sources</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCES.map((ds, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-govNavy-50 text-govNavy-800">
                    Source #{idx + 1}
                  </span>
                  <span className="text-[10px] font-medium text-govSlate-400">{ds.frequency}</span>
                </div>
                <h4 className="text-sm font-bold text-govNavy-900 mb-1">{ds.name}</h4>
                <div className="font-mono text-[11px] text-govCyan-700 bg-govCyan-50 px-2 py-1 rounded mb-3 inline-block">
                  {ds.file}
                </div>
                <p className="text-xs text-govSlate-600 mb-4 leading-relaxed">{ds.description}</p>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase text-govSlate-400 mb-1.5">Key Schema Attributes</div>
                <div className="flex flex-wrap gap-1">
                  {ds.fields.map((f, fi) => (
                    <span key={fi} className="text-[10px] font-mono bg-govSlate-100 text-govSlate-700 px-1.5 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Mathematical Formulation */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-govCyan-600" />
            <h3 className="text-base font-bold text-govNavy-900">2. Mathematical Indexes & Skill Gap Formulation</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Demand Index */}
          <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-govCyan-500"></span>
              <h4 className="text-sm font-bold text-govNavy-900">Demand Index (D_i)</h4>
            </div>
            <p className="text-xs text-govSlate-600 leading-relaxed">
              Synthesizes raw monthly enterprise job postings weighted by self-reported hiring velocity and quarterly expansion forecasts. Scaled to a standardized continuous index from 0 to 100.
            </p>
          </div>

          {/* Supply Index */}
          <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-govEmerald-500"></span>
              <h4 className="text-sm font-bold text-govNavy-900">Supply Index (S_i)</h4>
            </div>
            <p className="text-xs text-govSlate-600 leading-relaxed">
              Evaluates institutional capacity utilization by penalizing dropout rates and unplaced graduates. Measures the net qualified, employable candidates entering the active job market.
            </p>
          </div>

          {/* Gap Classification */}
          <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-govAmber-500"></span>
              <h4 className="text-sm font-bold text-govNavy-900">Equilibrium & Skill Gap Classification</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-govRed-700">SHORTAGE:</span>
                <span className="font-mono text-govSlate-600">Gap_% &gt; +10.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-govEmerald-700">BALANCED:</span>
                <span className="font-mono text-govSlate-600">-10.0% ≤ Gap_% ≤ +10.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-govAmber-700">OVERSUPPLY:</span>
                <span className="font-mono text-govSlate-600">Gap_% &lt; -10.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: End-to-End AI/ML Pipeline */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Cpu className="w-5 h-5 text-govCyan-600" />
          <h3 className="text-base font-bold text-govNavy-900">3. End-to-End Machine Learning Architecture</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm relative">
              <div className="text-2xl font-black text-govNavy-200 mb-2">{step.step}</div>
              <h4 className="text-sm font-bold text-govNavy-900 mb-2">{step.title}</h4>
              <p className="text-xs text-govSlate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Model Validation Benchmarks */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-govCyan-600" />
            <h3 className="text-base font-bold text-govNavy-900">4. Empirical Validation Benchmarks & Model Comparison</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-govEmerald-50 text-govEmerald-700 border border-govEmerald-200">
            Winner: Gradient Boosting Regressor (GBR)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-govSlate-50 text-govSlate-500 font-bold uppercase tracking-wider border-b border-govSlate-200">
                <th className="py-3 px-4">Algorithm / Model Architecture</th>
                <th className="py-3 px-4">Mean Absolute Error (MAE)</th>
                <th className="py-3 px-4">Root Mean Squared Error (RMSE)</th>
                <th className="py-3 px-4">R² Score (Goodness of Fit)</th>
                <th className="py-3 px-4">Production Deployment Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-200">
              <tr className="bg-govCyan-50/40 font-semibold">
                <td className="py-3 px-4 text-govNavy-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-govEmerald-600" />
                  <span>Gradient Boosting Regressor (GBR)</span>
                </td>
                <td className="py-3 px-4 font-mono text-govNavy-900">28.4 candidates</td>
                <td className="py-3 px-4 font-mono text-govNavy-900">36.8 candidates</td>
                <td className="py-3 px-4 font-mono text-govEmerald-700">0.941</td>
                <td className="py-3 px-4 text-govCyan-700">Primary Core Forecaster</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-govSlate-700">Random Forest Regressor (RFR)</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">34.1 candidates</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">42.6 candidates</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">0.912</td>
                <td className="py-3 px-4 text-govSlate-500">Cross-Validation Ensemble</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-govSlate-700">Linear Moving Average (Baseline)</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">64.2 candidates</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">81.5 candidates</td>
                <td className="py-3 px-4 font-mono text-govSlate-600">0.724</td>
                <td className="py-3 px-4 text-govSlate-500">Heuristic Benchmark</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Data Governance & Compliance */}
      <div className="bg-govSlate-900 text-white rounded-xl p-6 shadow-md">
        <div className="flex items-center space-x-2 mb-3 text-govCyan-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-base font-bold">5. Data Privacy, Governance & Regulatory Compliance</h3>
        </div>
        <p className="text-xs text-govSlate-300 leading-relaxed mb-4">
          All candidate records and employer micro-data are anonymized and aggregated at district-trade-quarter granularity in compliance with the Digital Personal Data Protection (DPDP) Act, 2023. No personally identifiable information (PII) such as Aadhaar numbers or bank account details are ingested into the analytical model layer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-govNavy-700 text-xs">
          <div>
            <div className="text-govSlate-400 font-bold uppercase text-[10px]">Data Classification</div>
            <div className="font-semibold text-white mt-0.5">Government Restricted / Analytical Open Feed</div>
          </div>
          <div>
            <div className="text-govSlate-400 font-bold uppercase text-[10px]">Model Governance</div>
            <div className="font-semibold text-white mt-0.5">Responsible AI for Public Policy (RAIPP)</div>
          </div>
          <div>
            <div className="text-govSlate-400 font-bold uppercase text-[10px]">Audit Cycle</div>
            <div className="font-semibold text-white mt-0.5">Automated Nightly Parquet Fingerprinting</div>
          </div>
        </div>
      </div>
    </div>
  );
}
