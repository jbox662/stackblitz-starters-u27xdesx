import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ExportConfig {
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
  totals?: {
    label: string;
    amount: number;
  }[];
}

export const exportToPDF = ({
  title,
  subtitle,
  filename,
  data,
  columns,
  customer,
  totals
}: ExportConfig) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add company header
  doc.setFontSize(20);
  doc.text('Business Manager', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(title, pageWidth / 2, 30, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, 38, { align: 'center' });
  }

  // Add date
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(), 'MMM d, yyyy')}`, 15, 45);

  let yPos = 45;

  // Add customer information if provided
  if (customer) {
    yPos += 15;
    doc.setFontSize(11);
    doc.text('Customer Information:', 15, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(customer.name, 15, yPos);
    yPos += 5;
    doc.text(customer.email, 15, yPos);
    yPos += 5;
    doc.text(customer.phone, 15, yPos);
    yPos += 5;
    doc.text(customer.address, 15, yPos);
    yPos += 10;
  }

  // Add table
  autoTable(doc, {
    startY: yPos,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => item[col.dataKey])),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
  });

  // Add totals if provided
  if (totals) {
    const finalY = (doc as any).lastAutoTable.finalY || yPos;
    let totalY = finalY + 10;
    
    totals.forEach((total, index) => {
      const isLast = index === totals.length - 1;
      doc.setFontSize(10);
      doc.setFont(undefined, isLast ? 'bold' : 'normal');
      doc.text(total.label, pageWidth - 60, totalY);
      doc.text(`$${total.amount.toFixed(2)}`, pageWidth - 15, totalY, { align: 'right' });
      totalY += 6;
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
};