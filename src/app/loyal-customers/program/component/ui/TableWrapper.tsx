import React, { JSX } from "react";

interface TableWrapperProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const TableWrapper = ({
  title,
  children,
  className = "",
}: TableWrapperProps) => (
  <div className={`bg-transparent rounded-lg p-4 text-sm ${className}`}>
    {title && (
      <h3 className="text-gray-800 mb-3 font-semibold tracking-tight">{title}</h3>
    )}
    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
      {children}
    </div>
  </div>
);

interface TableProps {
  headers: string[];
  rows: (string | JSX.Element)[][];
  striped?: boolean;
  compact?: boolean;
  align?: "left" | "center" | "right";
}

export const Table = ({
  headers,
  rows,
  striped = true,
  compact = false,
  align = "left",
}: TableProps) => (
  <table
    className={`min-w-full text-sm text-gray-800 ${
      compact ? "text-xs" : "text-sm"
    }`}
  >
    <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide">
      <tr>
        {headers.map((header, i) => (
          <th
            key={i}
            className={`px-4 py-2 text-${align} font-semibold whitespace-nowrap`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((cols, rowIndex) => (
        <tr
          key={rowIndex}
          className={`border-t transition-colors ${
            striped && rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
          } hover:bg-gray-100`}
        >
          {cols.map((col, colIndex) => (
            <td
              key={colIndex}
              className={`px-4 py-2 text-${align} align-middle whitespace-nowrap`}
            >
              {col}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
