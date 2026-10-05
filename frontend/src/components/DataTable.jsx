import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowUpDown, Download } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  pageSize = 10,
  emptyMessage = 'No records found.',
  exportTitle = 'dataset_export',
  showExport = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filtered = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (searchKeys.length > 0) {
      return searchKeys.some((k) => String(row[k] || '').toLowerCase().includes(term));
    }
    return Object.values(row).some((val) => String(val || '').toLowerCase().includes(term));
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let res = 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      res = aVal - bVal;
    } else {
      res = String(aVal).localeCompare(String(bVal));
    }
    return sortOrder === 'asc' ? res : -res;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportToCsv(exportTitle, sorted, columns);
  };

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 shadow-sm overflow-hidden text-xs">
      <div className="p-3.5 border-b border-govSlate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-govSlate-50/50">
        {searchable ? (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-govSlate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-govSlate-300 bg-white text-govSlate-900 placeholder:text-govSlate-400 focus:outline-none focus:border-govCyan-500 text-xs"
            />
          </div>
        ) : <div />}

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <div className="text-[11px] text-govSlate-500 font-medium">
            Showing <span className="font-bold text-govNavy-900">{sorted.length}</span> entries
          </div>

          {showExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-govNavy-900 hover:bg-govNavy-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              title="Download CSV of current table data"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-govSlate-100/70 border-b border-govSlate-200 text-[10px] font-bold uppercase tracking-wider text-govSlate-600">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                  className={`py-3 px-4 ${col.sortable !== false && col.key ? 'cursor-pointer hover:bg-govSlate-200/50 select-none' : ''}`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{col.label}</span>
                    {col.sortable !== false && col.key && (
                      <span className="text-govSlate-400">
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-govCyan-600" /> : <ChevronDown className="w-3.5 h-3.5 text-govCyan-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-govSlate-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-govSlate-100">
            {paginated.length > 0 ? (
              paginated.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-govSlate-50/70 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 font-medium text-govSlate-800">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-govSlate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 border-t border-govSlate-200 flex items-center justify-between bg-govSlate-50/50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded border border-govSlate-300 bg-white font-semibold text-govSlate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-govSlate-100 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-[11px] text-govSlate-500">
            Page <span className="font-bold text-govNavy-900">{currentPage}</span> of <span className="font-bold text-govNavy-900">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded border border-govSlate-300 bg-white font-semibold text-govSlate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-govSlate-100 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
