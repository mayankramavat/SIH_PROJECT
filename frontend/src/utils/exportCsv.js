/**
 * Client-Side CSV Export Utility (SIH_26246)
 * Generates and triggers instant browser download of tabular datasets as RFC-4180 compliant CSV files.
 */

export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const separator = ',';
  const keys = columns.map(c => c.key);
  const headers = columns.map(c => `"${(c.label || c.key || '').toString().replace(/"/g, '""')}"`).join(separator);

  const csvRows = rows.map(row => {
    return keys.map(k => {
      let val = row[k];
      if (val === null || val === undefined) val = '';
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(separator);
  });

  const csvContent = [headers, ...csvRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanFilename = (filename || 'export').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanFilename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
