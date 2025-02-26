import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  className?: string;
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

function Table<T extends { id?: string | number }>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
          <div className="min-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className={`px-3 sm:px-6 py-3 text-sm font-semibold text-white whitespace-nowrap ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : 
                        'text-left'
                      } ${column.hideOnMobile ? 'hidden sm:table-cell' : ''} ${column.className || ''}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-[#1a1f2b]">
                {data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-gray-700/50' : ''
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`whitespace-nowrap px-3 sm:px-6 py-2 sm:py-4 text-sm text-white ${
                          column.align === 'right' ? 'text-right' : 
                          column.align === 'center' ? 'text-center' : 
                          'text-left'
                        } ${column.hideOnMobile ? 'hidden sm:table-cell' : ''} ${column.className || ''}`}
                      >
                        {typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Table;