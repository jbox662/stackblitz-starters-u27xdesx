import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import CreateInvoiceForm from '../components/CreateInvoiceForm';
import ImportExport from '../components/ImportExport';
import { exportToCSV, exportToPDF } from '../utils/exportData';
import Table from '../components/Table';
import EmailButton from '../components/EmailButton';
import ExportDropdown from '../components/ExportDropdown';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items?: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const Invoices = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, email, phone, address),
          items:invoice_items(
            id,
            description,
            quantity,
            unit_price,
            total
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newInvoice: any) => {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      try {
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([{
            invoice_number: invoiceNumber,
            customer_id: newInvoice.customer_id,
            date: newInvoice.date,
            due_date: newInvoice.due_date,
            total_amount: newInvoice.total_amount,
            status: 'pending',
            notes: newInvoice.notes
          }])
          .select()
          .single();
        
        if (invoiceError) throw invoiceError;

        if (newInvoice.items?.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(
              newInvoice.items.map((item: any) => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total
              }))
            );
          
          if (itemsError) throw itemsError;
        }

        return invoice;
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create invoice');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (invoice: Invoice & { items?: InvoiceItem[] }) => {
      try {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            customer_id: invoice.customer_id,
            date: invoice.date,
            due_date: invoice.due_date,
            total_amount: invoice.total_amount,
            status: invoice.status,
            notes: invoice.notes
          })
          .eq('id', invoice.id);
        
        if (invoiceError) throw invoiceError;

        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);
        
        if (deleteError) throw deleteError;

        if (invoice.items?.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(
              invoice.items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total
              }))
            );
          
          if (itemsError) throw itemsError;
        }

        return invoice;
      } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
      setIsModalOpen(false);
      setEditingInvoice(null);
    },
    onError: (error) => {
      toast.error('Failed to update invoice');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete invoice');
      console.error('Error:', error);
    }
  });

  const handleExportCSV = () => {
    if (!invoices) return;

    const data = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Customer': invoice.customer.name,
      'Date': format(new Date(invoice.date), 'MMM d, yyyy'),
      'Due Date': format(new Date(invoice.due_date), 'MMM d, yyyy'),
      'Total Amount': `$${invoice.total_amount.toFixed(2)}`,
      'Status': invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
      'Notes': invoice.notes || ''
    }));

    exportToCSV(data, `invoices-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const handleExportPDF = () => {
    if (!invoices) return;

    const data = invoices.map(invoice => ({
      'Invoice #': invoice.invoice_number,
      'Customer': invoice.customer.name,
      'Date': format(new Date(invoice.date), 'MMM d, yyyy'),
      'Due Date': format(new Date(invoice.due_date), 'MMM d, yyyy'),
      'Amount': `$${invoice.total_amount.toFixed(2)}`,
      'Status': invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
    }));

    exportToPDF({
      title: 'Invoices',
      subtitle: `Generated on ${format(new Date(), 'MMM d, yyyy')}`,
      filename: `invoices-${format(new Date(), 'yyyy-MM-dd')}`,
      data,
      columns: [
        { header: 'Invoice #', dataKey: 'Invoice #' },
        { header: 'Customer', dataKey: 'Customer' },
        { header: 'Date', dataKey: 'Date' },
        { header: 'Due Date', dataKey: 'Due Date' },
        { header: 'Amount', dataKey: 'Amount' },
        { header: 'Status', dataKey: 'Status' }
      ]
    });
  };

  const handleSingleInvoiceExportCSV = (invoice: Invoice) => {
    const data = [{
      'Invoice Number': invoice.invoice_number,
      'Customer': invoice.customer.name,
      'Date': format(new Date(invoice.date), 'MMM d, yyyy'),
      'Due Date': format(new Date(invoice.due_date), 'MMM d, yyyy'),
      'Total Amount': `$${invoice.total_amount.toFixed(2)}`,
      'Status': invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
      'Notes': invoice.notes || ''
    }];

    if (invoice.items) {
      data[0]['Items'] = invoice.items.map(item => 
        `${item.description} (${item.quantity} x $${item.unit_price})`
      ).join('; ');
    }

    exportToCSV(data, `invoice-${invoice.invoice_number}-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const handleSingleInvoicePDF = (invoice: Invoice) => {
    const itemsData = invoice.items?.map(item => ({
      'Description': item.description,
      'Quantity': item.quantity,
      'Unit Price': `$${item.unit_price.toFixed(2)}`,
      'Total': `$${item.total.toFixed(2)}`
    })) || [];

    exportToPDF({
      title: `Invoice ${invoice.invoice_number}`,
      subtitle: `Generated on ${format(new Date(), 'MMM d, yyyy')}`,
      filename: `invoice-${invoice.invoice_number}`,
      data: itemsData,
      columns: [
        { header: 'Description', dataKey: 'Description' },
        { header: 'Quantity', dataKey: 'Quantity' },
        { header: 'Unit Price', dataKey: 'Unit Price' },
        { header: 'Total', dataKey: 'Total' }
      ],
      customer: invoice.customer,
      totals: [
        { label: 'Subtotal:', amount: invoice.total_amount },
        { label: 'Total:', amount: invoice.total_amount }
      ]
    });
  };

  const handleImport = async (data: any[]) => {
    try {
      for (const item of data) {
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('name', item.Customer)
          .single();

        if (!customer) {
          toast.error(`Customer "${item.Customer}" not found`);
          continue;
        }

        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert([{
            invoice_number: invoiceNumber,
            customer_id: customer.id,
            date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: parseFloat(item['Total Amount'].replace('$', '')),
            status: 'pending',
            notes: item.Notes
          }]);

        if (invoiceError) throw invoiceError;
      }

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoices imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import invoices');
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoice_number',
      className: 'font-medium'
    },
    {
      header: 'Customer',
      accessor: (row: Invoice) => (
        <div>
          <div className="text-white">{row.customer.name}</div>
          <div className="text-sm text-gray-400 hidden sm:block">{row.customer.email}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (row: Invoice) => format(new Date(row.date), 'MMM d, yyyy'),
      hideOnMobile: true
    },
    {
      header: 'Amount',
      accessor: (row: Invoice) => `$${row.total_amount.toFixed(2)}`,
      align: 'right' as const
    },
    {
      header: 'Status',
      accessor: (row: Invoice) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          row.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          row.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      header: '',
      accessor: (row: Invoice) => (
        <div className="flex justify-end space-x-2">
          <ExportDropdown
            onExportPDF={() => handleSingleInvoicePDF(row)}
            onExportCSV={() => handleSingleInvoiceExportCSV(row)}
          />
          <EmailButton
            type="invoice"
            document={row}
          />
          <Button
            variant="secondary"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              setEditingInvoice(row ());
              setIsModalOpen(true);
            }}
          />
          <Button
            variant="danger"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this invoice?')) {
                deleteMutation.mutate(row.id);
              }
            }}
          />
        </div>
      ),
      align: 'right' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <ImportExport
            onImport={handleImport}
            onExport={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
            className="w-full sm:w-auto"
          >
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0 sm:p-4">
          <Table
            columns={columns}
            data={invoices || []}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
      >
        <CreateInvoiceForm
          onSubmit={(data) => {
            if (editingInvoice) {
              updateMutation.mutate({ ...editingInvoice, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingInvoice(null);
          }}
          editingInvoice={editingInvoice}
        />
      </Modal>
    </div>
  );
};

export default Invoices;