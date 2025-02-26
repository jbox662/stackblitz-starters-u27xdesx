import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Add this type declaration to help TypeScript understand the autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  data: any[];
  columns: { header: string; dataKey: string }[];
  customer?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  totals?: { label: string; amount: number }[];
  proposalLetter?: string;
  simplified?: boolean;
  items?: {
    parts: any[];
    labor: any[];
  };
}

export const exportToPDF = ({
  title,
  subtitle,
  filename,
  data,
  columns,
  customer,
  totals,
  proposalLetter,
  items,
  simplified
}: PDFExportOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 20);

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);
  }

  let yPos = 40;

  // Add customer details if provided
  if (customer) {
    doc.setFontSize(12);
    doc.text('Customer Details:', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(customer.name, 14, yPos);
    yPos += 5;
    doc.text(customer.email, 14, yPos);
    yPos += 5;
    doc.text(customer.phone, 14, yPos);
    yPos += 5;
    doc.text(customer.address, 14, yPos);
    yPos += 15;
  }

  // Add proposal letter if provided
  if (proposalLetter) {
    doc.setFontSize(12);
    doc.text('Proposal:', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(proposalLetter, pageWidth - 28);
    doc.text(splitText, 14, yPos);
    yPos += splitText.length * 5 + 10;
  }

  if (simplified) {
    // Show Quote Summary for simplified view
    doc.setFontSize(14);
    doc.text('Quote Summary', 14, yPos);
    yPos += 15;

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Amount']],
      body: totals.map(total => [
        total.label,
        `$${total.amount.toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [26, 188, 156] },
      styles: { fontSize: 12 },
      margin: { left: 14 }
    });
  } else {
    // Show detailed items tables
    if (items?.parts.length > 0) {
      doc.setFontSize(12);
      doc.text('Parts:', 14, yPos);
      yPos += 10;
      doc.autoTable({
        startY: yPos,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: items.parts.map(item => [
          item.description,
          item.quantity,
          `$${item.unit_price.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ]),
        margin: { left: 14 },
        theme: 'grid'
      });
      yPos = doc.previousAutoTable.finalY + 10;
    }

    if (items?.labor.length > 0) {
      doc.setFontSize(12);
      doc.text('Labor:', 14, yPos);
      yPos += 10;
      doc.autoTable({
        startY: yPos,
        head: [['Description', 'Hours', 'Rate', 'Total']],
        body: items.labor.map(item => [
          item.description,
          item.quantity,
          `$${item.unit_price.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ]),
        margin: { left: 14 },
        theme: 'grid'
      });
      yPos = doc.previousAutoTable.finalY + 10;
    }
  }

  doc.save(`${filename}.pdf`);
};