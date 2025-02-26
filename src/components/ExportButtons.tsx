import React from 'react';
import { FileDown } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportPDF, onExportCSV }) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onExportPDF}
        className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
      >
        <FileDown className="w-4 h-4 mr-2" />
        PDF
      </button>
      <button
        onClick={onExportCSV}
        className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
      >
        <FileDown className="w-4 h-4 mr-2" />
        CSV
      </button>
    </div>
  );
};

export default ExportButtons;