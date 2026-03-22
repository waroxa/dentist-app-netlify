import React from 'react';

interface DataTableProps {
  columns: string[];
  rows: React.ReactNode[][];
}

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((column, i) => (
              <th
                key={i}
                className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-3.5 text-sm text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
