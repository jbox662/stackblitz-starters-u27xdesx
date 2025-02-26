import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set worker path
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${getDocument.version}/pdf.worker.min.js`;

export const parseCSV = (csv: string): any[] => {
  // Remove BOM if present
  const content = csv.charCodeAt(0) === 0xFEFF ? csv.slice(1) : csv;
  
  // Split into lines and filter out empty lines
  const lines = content.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse headers
  const headers = parseCSVRow(lines[0]);
  if (headers.length === 0) {
    throw new Error('No headers found in CSV file');
  }

  // Parse data rows
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    
    // Skip rows that don't match header length
    if (values.length !== headers.length) continue;

    // Create object from headers and values
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    result.push(obj);
  }

  return result;
};

const parseCSVRow = (row: string): string[] => {
  const values: string[] = [];
  let value = '';
  let insideQuotes = false;
  let previousChar = '';

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    // Handle escaped quotes
    if (char === '"' && previousChar === '"') {
      value += '"';
      previousChar = '';
      continue;
    }

    // Toggle quote state
    if (char === '"') {
      insideQuotes = !insideQuotes;
      previousChar = char;
      continue;
    }

    // Handle commas
    if (char === ',' && !insideQuotes) {
      values.push(value.trim());
      value = '';
      previousChar = char;
      continue;
    }

    value += char;
    previousChar = char;
  }

  // Add the last value
  values.push(value.trim());

  // Clean up values (remove surrounding quotes and handle escaped quotes)
  return values.map(v => {
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      v = v.slice(1, -1);
    }
    return v.replace(/""/g, '"');
  });
};

export const handlePDFImport = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        
        const textContent: string[] = [];
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items
            .map((item: any) => item.str)
            .join(' ');
          textContent.push(text);
        }

        // Parse the extracted text into structured data
        const data = parsePDFContent(textContent);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse PDF file. Please check the file format.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const parsePDFContent = (textContent: string[]): any[] => {
  const data: any[] = [];
  
  textContent.forEach((text) => {
    // Split text into lines and remove empty lines
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    
    // Try to identify table-like structures
    const tableData: Record<string, string>[] = [];
    let currentRecord: Record<string, string> = {};
    let isInTable = false;
    
    lines.forEach((line) => {
      // Check if line contains key-value pair (e.g., "Name: John")
      const keyValueMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        currentRecord[key.trim()] = value.trim();
        isInTable = true;
      } 
      // Check if line might be a table header
      else if (line.includes('\t') || line.includes(',')) {
        const values = line.split(/[\t,]/).map(v => v.trim());
        if (values.length > 1) {
          if (Object.keys(currentRecord).length > 0) {
            tableData.push(currentRecord);
            currentRecord = {};
          }
          const record: Record<string, string> = {};
          values.forEach((value, index) => {
            record[`Column${index + 1}`] = value;
          });
          tableData.push(record);
          isInTable = true;
        }
      }
      // If we've collected some data and hit a non-matching line, save the record
      else if (isInTable && Object.keys(currentRecord).length > 0) {
        tableData.push(currentRecord);
        currentRecord = {};
        isInTable = false;
      }
    });

    // Add any remaining record
    if (Object.keys(currentRecord).length > 0) {
      tableData.push(currentRecord);
    }

    // If we found structured data, add it
    if (tableData.length > 0) {
      data.push(...tableData);
    }
  });

  return data.length > 0 ? data : textContent.map((text, index) => ({
    page: index + 1,
    content: text,
    extracted_at: new Date().toISOString()
  }));
};