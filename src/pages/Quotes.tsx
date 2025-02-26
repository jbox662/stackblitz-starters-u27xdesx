import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import CreateQuoteForm from '../components/CreateQuoteForm';
import ImportExport from '../components/ImportExport';
import { exportToCSV, exportToPDF } from '../utils/exportData';
import Table from '../components/Table';
import EmailButton from '../components/EmailButton';
import ExportDropdown from '../components/ExportDropdown';
import { Link } from 'react-router-dom';

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  date: string;
  valid_until: string;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes: string;
  proposal_letter?: string;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items?: QuoteItem[];
}

interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  type: 'item' | 'labor';
}

const Quotes = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, email, phone, address),
          items:quote_items(
            id,
            description,
            quantity,
            unit_price,
            total,
            type
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Quote[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newQuote: any) => {
      try {
        console.log('Creating quote with data:', newQuote);

        // Generate quote number
        const quoteNumber = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        // First create the quote
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .insert([{
            quote_number: quoteNumber,
            customer_id: newQuote.customer_id,
            date: newQuote.date,
            valid_until: newQuote.valid_until,
            total_amount: newQuote.total_amount,
            status: 'pending',
            notes: newQuote.notes,
            title: newQuote.title,
            proposal_letter: newQuote.proposal_letter
          }])
          .select()
          .single();
        
        if (quoteError) {
          console.error('Error creating quote:', quoteError);
          throw quoteError;
        }

        console.log('Created quote:', quote);

        // Then create the quote items if we have any
        if (newQuote.items?.length > 0) {
          console.log('Creating quote items:', newQuote.items);

          const itemsToInsert = newQuote.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            type: item.type,
            quote_id: quote.id
          }));

          console.log('Items to insert:', itemsToInsert);

          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(itemsToInsert);
          
          if (itemsError) {
            console.error('Error creating quote items:', itemsError);
            throw itemsError;
          }
        }

        return quote;
      } catch (error) {
        console.error('Failed to create quote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote created successfully');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to create quote: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (quote: Quote & { items?: QuoteItem[] }) => {
      try {
        const { error: quoteError } = await supabase
          .from('quotes')
          .update({
            customer_id: quote.customer_id,
            date: quote.date,
            valid_until: quote.valid_until,
            total_amount: quote.total_amount,
            status: quote.status,
            notes: quote.notes,
            proposal_letter: quote.proposal_letter
          })
          .eq('id', quote.id);
        
        if (quoteError) throw quoteError;

        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quote.id);
        
        if (deleteError) throw deleteError;

        if (quote.items?.length > 0) {
          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(
              quote.items.map(item => ({
                quote_id: quote.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total,
                type: item.type
              }))
            );
          
          if (itemsError) throw itemsError;
        }

        return quote;
      } catch (error) {
        console.error('Error updating quote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote updated successfully');
      setIsModalOpen(false);
      setEditingQuote(null);
    },
    onError: (error) => {
      toast.error('Failed to update quote');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      try {
        console.log('Deleting quote:', quoteId);

        // First delete all quote items
        const { error: itemsError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quoteId);

        if (itemsError) {
          console.error('Error deleting quote items:', itemsError);
          throw itemsError;
        }

        // Then delete the quote
        const { error: quoteError } = await supabase
          .from('quotes')
          .delete()
          .eq('id', quoteId);

        if (quoteError) {
          console.error('Error deleting quote:', quoteError);
          throw quoteError;
        }
      } catch (error) {
        console.error('Failed to delete quote:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast.error(`Failed to delete quote: ${error.message}`);
    }
  });

  const handleExportCSV = () => {
    if (!quotes) return;

    const data = quotes.map(quote => ({
      'Quote Number': quote.quote_number,
      'Customer': quote.customer.name,
      'Date': format(new Date(quote.date), 'MMM d, yyyy'),
      'Valid Until': format(new Date(quote.valid_until), 'MMM d, yyyy'),
      'Total Amount': `$${quote.total_amount.toFixed(2)}`,
      'Status': quote.status.charAt(0).toUpperCase() + quote.status.slice(1),
      'Notes': quote.notes || ''
    }));

    exportToCSV(data, `quotes-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const handleExportPDF = () => {
    if (!quotes) return;

    const data = quotes.map(quote => ({
      'Quote #': quote.quote_number,
      'Customer': quote.customer.name,
      'Date': format(new Date(quote.date), 'MMM d, yyyy'),
      'Valid Until': format(new Date(quote.valid_until), 'MMM d, yyyy'),
      'Amount': `$${quote.total_amount.toFixed(2)}`,
      'Status': quote.status.charAt(0).toUpperCase() + quote.status.slice(1)
    }));

    exportToPDF({
      title: 'Quotes',
      subtitle: `Generated on ${format(new Date(), 'MMM d, yyyy')}`,
      filename: `quotes-${format(new Date(), 'yyyy-MM-dd')}`,
      data,
      columns: [
        { header: 'Quote #', dataKey: 'Quote #' },
        { header: 'Customer', dataKey: 'Customer' },
        { header: 'Date', dataKey: 'Date' },
        { header: 'Valid Until', dataKey: 'Valid Until' },
        { header: 'Amount', dataKey: 'Amount' },
        { header: 'Status', dataKey: 'Status' }
      ]
    });
  };

  const handleSingleQuoteExportCSV = (quote: Quote) => {
    const data = [{
      'Quote Number': quote.quote_number,
      'Customer': quote.customer.name,
      'Date': format(new Date(quote.date), 'MMM d, yyyy'),
      'Valid Until': format(new Date(quote.valid_until), 'MMM d, yyyy'),
      'Total Amount': `$${quote.total_amount.toFixed(2)}`,
      'Status': quote.status.charAt(0).toUpperCase() + quote.status.slice(1),
      'Notes': quote.notes || ''
    }];

    if (quote.items) {
      data[0]['Items'] = quote.items.map(item => 
        `${item.description} (${item.quantity} x $${item.unit_price})`
      ).join('; ');
    }

    exportToCSV(data, `quote-${quote.quote_number}-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  const handleSingleQuotePDF = (quote: Quote) => {
    const partsItems = quote.items?.filter(item => item.type === 'item') || [];
    const laborItems = quote.items?.filter(item => item.type === 'labor') || [];

    const partsTotal = partsItems.reduce((sum, item) => sum + item.total, 0);
    const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);

    exportToPDF({
      title: `Quote ${quote.quote_number}`,
      subtitle: `Generated on ${format(new Date(), 'MMM d, yyyy')}`,
      filename: `quote-${quote.quote_number}`,
      data: quote.items || [],
      columns: [
        { header: 'Description', dataKey: 'description' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Unit Price', dataKey: 'unit_price' },
        { header: 'Total', dataKey: 'total' }
      ],
      customer: quote.customer,
      totals: [
        { label: 'Parts Total:', amount: partsTotal },
        { label: 'Labor Total:', amount: laborTotal },
        { label: 'Total:', amount: quote.total_amount }
      ],
      proposalLetter: quote.proposal_letter,
      simplified: true,
      items: {
        parts: partsItems,
        labor: laborItems
      }
    });
  };

  const handleImport = async (data: any[]) => {
    try {
      for (const item of data) {
        const quoteNumber = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('name', item.Customer)
          .single();

        if (!customer) {
          toast.error(`Customer "${item.Customer}" not found`);
          continue;
        }

        const { error: quoteError } = await supabase
          .from('quotes')
          .insert([{
            quote_number: quoteNumber,
            customer_id: customer.id,
            date: new Date().toISOString().split('T')[0],
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: parseFloat(item['Total Amount'].replace('$', '')),
            status: 'pending',
            notes: item.Notes
          }]);

        if (quoteError) throw quoteError;
      }

      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quotes imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import quotes');
    }
  };

  const columns = [
    {
      header: 'Quote #',
      accessor: 'quote_number',
      className: 'font-medium'
    },
    {
      header: 'Customer',
      accessor: (row: Quote) => (
        <div>
          <div className="text-white">{row.customer.name}</div>
          <div className="text-sm text-gray-400 hidden sm:block">{row.customer.email}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (row: Quote) => format(new Date(row.date), 'MMM d, yyyy'),
      hideOnMobile: true
    },
    {
      header: 'Amount',
      accessor: (row: Quote) => `$${row.total_amount.toFixed(2)}`,
      align: 'right' as const
    },
    {
      header: 'Status',
      accessor: (row: Quote) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
          row.status === 'expired' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      header: '',
      accessor: (row: Quote) => (
        <div className="flex justify-end space-x-2">
          <ExportDropdown
            onExportPDF={() => handleSingleQuotePDF(row)}
            onExportCSV={() => handleSingleQuoteExportCSV(row)}
          />
          <EmailButton
            type="quote"
            document={row}
          />
          <Button
            variant="secondary"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              setEditingQuote(row);
              setIsModalOpen(true);
            }}
          />
          <Button
            variant="danger"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this quote?')) {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quotes</h1>
        <Link 
          to="/quotes/new" 
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          <span className="text-2xl">+</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Search"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700">
            Filter: All
          </button>
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700">
            Date: All
          </button>
          <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700">
            Sort: Newest
          </button>
        </div>
      </div>

      {/* Quotes List */}
      <div className="flex-1">
        {quotes?.map((quote) => (
          <Link
            to={`/quotes/${quote.id}`}
            key={quote.id}
            className="block p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-200 rounded-xl mb-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {quote.customer.name}
                </h2>
                <div className="text-gray-400 text-sm">
                  #{quote.quote_number}
                </div>
                <div className="text-gray-400 text-sm">
                  {format(new Date(quote.date), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${quote.total_amount.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">
                  {quote.status === 'pending' ? 'Pending' : 'Approved'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuote(null);
        }}
        title={editingQuote ? 'Edit Quote' : 'Create New Quote'}
      >
        <CreateQuoteForm
          onSubmit={(data) => {
            if (editingQuote) {
              updateMutation.mutate({ ...editingQuote, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingQuote(null);
          }}
          editingQuote={editingQuote}
        />
      </Modal>
    </div>
  );
};

export default Quotes;