import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  Award, 
  Tag, 
  X, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { getOccupationsData } from '../services/dataService';

/**
 * Occupation Explorer Page Component
 * 
 * Layout:
 * - Wide search bar at top (search by occupation name or NCO 2015 code)
 * - Quick category chips
 * - Full-width table: NCO code, occupation, sector, related skills, NSQF level
 */
export default function OccupationExplorerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getOccupationsData(searchTerm);
        if (isMounted) {
          if (selectedSectorFilter === 'All') {
            setOccupations(data);
          } else {
            setOccupations(data.filter(item => item.sector === selectedSectorFilter));
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load occupations:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [searchTerm, selectedSectorFilter]);

  const sectorsList = [
    'All',
    'IT & Software Services',
    'Manufacturing & Auto',
    'Healthcare & Lifesciences',
    'Retail & E-commerce',
    'Agriculture & Allied',
    'Renewable Energy'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">National Occupation Explorer</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Standardized classification mapped to National Classification of Occupations (NCO-2015) & NSQF competency levels
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          <span>DGE NCO-2015 Taxonomy</span>
        </div>
      </div>

      {/* ========================================================
          WIDE SEARCH BAR AT TOP + QUICK FILTER CHIPS
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by occupation title, NCO 2015 code (e.g. 2512.0101), sector, or specific skill..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-3.5 pl-11 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-xs focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sector Quick-Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pt-1">
          <span className="text-xs font-semibold uppercase text-gray-500 mr-1">Sector:</span>
          {sectorsList.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSectorFilter(sec)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedSectorFilter === sec
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          FULL-WIDTH TABLE: NCO Code, Occupation, Sector, Skills, NSQF Level
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-semibold text-gray-900">National Occupations Directory</h3>
            <p className="text-xs text-gray-500">
              Showing {occupations.length} standardized trades matching your criteria
            </p>
          </div>
          <div className="mt-2 sm:mt-0 text-xs font-medium text-gray-500">
            Compliant with NSQF Levels 3 to 6
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : occupations.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">No occupations matched your query</p>
            <p className="text-xs text-gray-400 mt-1">Try searching for "2512", "Nurse", "Welder", "EV", or "Python"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">NCO 2015 Code</th>
                  <th scope="col" className="px-6 py-3.5">Occupation Title & Profile</th>
                  <th scope="col" className="px-6 py-3.5">Industry Sector</th>
                  <th scope="col" className="px-6 py-3.5">Related Competency Skills</th>
                  <th scope="col" className="px-6 py-3.5">NSQF Level</th>
                  <th scope="col" className="px-6 py-3.5">Market Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                {occupations.map((item) => (
                  <tr key={item.ncoCode} className="hover:bg-gray-50/80 transition-colors">
                    {/* NCO Code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {item.ncoCode}
                      </span>
                    </td>

                    {/* Occupation Title & Description */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.occupation}</div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                    </td>

                    {/* Sector */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                      {item.sector}
                    </td>

                    {/* Related Skills */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {item.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* NSQF Level */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Award className="w-3 h-3 mr-1 text-indigo-500" />
                        {item.nsqfLevel}
                      </span>
                    </td>

                    {/* Market Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.demandStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
