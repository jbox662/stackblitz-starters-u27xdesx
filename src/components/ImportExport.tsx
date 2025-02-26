import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileText, Table } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';
import { parseCSV, handlePDFImport } from '../utils/importData';

interface ImportExportProps {
  onImport: (data: any) => void | Promise<void>;
  onExport: () => void;
  onExportPDF?: () => void;
  accept?: string;
}

const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport, onExportPDF, accept = '.csv,.pdf' }) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const importDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (importDropdownRef.current && !importDropdownRef.current.contains(event.target as Node)) {
        setIsImportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      let data;
      
      if (file.type === 'application/pdf') {
        data = await handlePDFImport(file);
      } else {
        const reader = new FileReader();
        data = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              resolve(parseCSV(content));
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
      
      // Call the onImport handler with the parsed data
      await onImport(data);
      
      // Clear the file inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      
      setIsImportOpen(false);
      toast.success('File imported successfully');
    } catch (error: any) {
      console.error('Error importing file:', error);
      toast.error(error.message || 'Failed to import file. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="relative flex-1 sm:flex-none" ref={importDropdownRef}>
        <button
          onClick={() => setIsImportOpen(!isImportOpen)}
          disabled={isImporting}
          className="flex items-center justify-center w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImporting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </>
          )}
        </button>

        {isImportOpen && !isImporting && (
          <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setIsImportOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Table className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={() => {
                pdfInputRef.current?.click();
                setIsImportOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Import PDF
            </button>
          </div>
        )}
      </div>

      <div className="relative flex-1 sm:flex-none" ref={exportDropdownRef}>
        <button
          onClick={() => setIsExportOpen(!isExportOpen)}
          className="flex items-center justify-center w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>

        {isExportOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onExport();
                setIsExportOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Table className="w-4 h-4 mr-2" />
              Export as CSV
            </button>
            {onExportPDF && (
              <button
                onClick={() => {
                  onExportPDF();
                  setIsExportOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExport;