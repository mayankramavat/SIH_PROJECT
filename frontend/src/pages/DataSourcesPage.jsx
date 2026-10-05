import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  FileText, 
  Layers, 
  RefreshCw,
  Globe
} from 'lucide-react';
import { getDataSources } from '../services/dataService';

/**
 * Data Sources Page Component
 * 
 * Layout:
 * - Header explaining institutional integration under MSDE SIH 26246
 * - Cards in a horizontal grid (3-4 per row)
 * - Links to: NCS, PLFS (MoSPI), e-Shram, Skill India Digital Hub, NCO 2015 (DGE), NCVET, MSDE, data.gov.in
 * - Each card shows "What data it gives us"
 */
export default function DataSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getDataSources();
        if (isMounted) {
          setSources(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load data sources:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Institutional Data Sources & Feeds</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Federated government portals ingested into the Labour Market Intelligence portal (SIH 26246, MSDE)
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          <span>8 Official Government Portals Mapped</span>
        </div>
      </div>

      {/* ========================================================
          HORIZONTAL GRID OF CARDS (3-4 per row)
         ======================================================== */}
      {loading ? (
        <div className="py-16 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & External Link */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {source.acronym}
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    title={`Open official ${source.name} portal`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Portal Title & Ministry */}
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  {source.name}
                </h3>
                <p className="text-xs text-blue-600 font-medium mt-0.5 mb-2">
                  {source.ministry}
                </p>

                {/* Brief Description */}
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {source.description}
                </p>

                {/* What Data It Gives Us */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center">
                    <Database className="w-3 h-3 mr-1 text-blue-600" />
                    What Data It Gives Us:
                  </p>
                  <p className="text-xs text-gray-700 leading-normal">
                    {source.dataProvided}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata */}
              <div className="pt-3 border-t border-gray-100 flex flex-col space-y-1 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sync Frequency:</span>
                  <span className="font-medium text-gray-700">{source.updateFrequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Scale / Volume:</span>
                  <span className="font-medium text-blue-700 truncate max-w-[170px]" title={source.dataVolume}>
                    {source.dataVolume}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Integration Technical Footnote */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-200 p-4 text-xs text-gray-600 flex items-start space-x-3">
        <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900 mb-0.5">Automated Multi-Source ETL Ingestion Pipeline</p>
          <p>
            The LMIS ingestion engine standardizes heterogeneous formats (CSV dumps from PLFS, JSON REST streams from NCS, and XML catalogs from NCVET) into a unified PostgreSQL/DuckDB schema mapped against NCO 2015 8-digit codes.
          </p>
        </div>
      </div>
    </div>
  );
}
