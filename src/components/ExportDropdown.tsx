import React, { useState, useRef, useEffect } from 'react';
import { FileDown, Download } from 'lucide-react';

interface ExportDropdownProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExportPDF, onExportCSV }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
      >
        <Download className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onExportPDF();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={() => {
              onExportCSV();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileDown className="w-4 h-4 mr-2" />
            CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;