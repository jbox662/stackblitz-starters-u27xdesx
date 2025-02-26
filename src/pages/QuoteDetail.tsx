import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import CreateQuoteForm from '../components/CreateQuoteForm';
import { exportToPDF } from '../utils/exportData';
import { Edit } from 'lucide-react';

export default function QuoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      console.log('Fetching quote with ID:', id);

      // First, let's check what items we have
      const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', id);
      
      console.log('Direct items query:', items); // Debug log

      // Get quote with all related data
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(*),
          items:quote_items!quote_id(
            id,
            quote_id,
            description,
            quantity,
            unit_price,
            total,
            type
          ),
          simplified
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Full quote data:', data);
      console.log('Quote items:', data?.items);
      console.log('Quote data from DB:', data);

      // Add type if missing
      if (data?.items) {
        data.items = data.items.map(item => ({
          ...item,
          type: item.type || 'item' // Default to 'item' if type is missing
        }));
      }

      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedQuote: any) => {
      try {
        console.log('Updating quote with data:', updatedQuote);

        const { error: quoteError } = await supabase
          .from('quotes')
          .update({
            customer_id: updatedQuote.customer_id,
            date: updatedQuote.date,
            valid_until: updatedQuote.valid_until,
            total_amount: updatedQuote.total_amount,
            status: updatedQuote.status || 'pending',
            notes: updatedQuote.notes,
            title: updatedQuote.title,
            simplified: updatedQuote.simplified,
            proposal_letter: updatedQuote.proposal_letter
          })
          .eq('id', id);
        
        if (quoteError) {
          console.error('Error updating quote:', quoteError);
          throw quoteError;
        }

        // Always delete existing items first
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id);
        
        if (deleteError) throw deleteError;

        // Insert new items if we have any
        if (updatedQuote.items?.length > 0) {
          // Clean items before inserting
          const cleanedItems = updatedQuote.items.map((item: any) => ({
            quote_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            type: item.type || 'item'
          }));

          const { error: insertError } = await supabase
            .from('quote_items')
            .insert(cleanedItems);

          if (insertError) {
            console.error('Error inserting items:', insertError);
            throw insertError;
          }
        }

        return updatedQuote;
      } catch (error) {
        console.error('Update failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      toast.success('Quote updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to update quote: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      try {
        // First delete all quote items
        const { data: deletedItems, error: itemsError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id)
          .select();

        console.log('Deleted items:', deletedItems);
        
        if (itemsError) {
          console.error('Error deleting items:', itemsError);
          throw itemsError;
        }

        // Then delete the quote
        const { data: deletedQuote, error: quoteError } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id)
          .select();

        console.log('Deleted quote:', deletedQuote);
        
        if (quoteError) {
          console.error('Error deleting quote:', quoteError);
          throw quoteError;
        }

        return { deletedQuote, deletedItems };
      } catch (error) {
        console.error('Failed to delete quote:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote deleted successfully');
      navigate('/quotes');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(`Failed to delete quote: ${error.message}`);
    }
  });

  const handleOptionClick = (action: string) => {
    switch(action) {
      case 'convert':
        // Handle convert to invoice
        break;
      case 'accept':
        // Handle mark as accepted
        break;
      case 'duplicate':
        // Handle duplicate
        break;
      case 'share':
        // Handle share
        break;
      case 'archive':
        // Handle archive
        break;
    }
    setShowOptions(false);
  };

  const handleEmailQuote = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-quote-email', {
        body: {
          quoteId: id,
          quoteNumber: quote.quote_number,
          customerEmail: quote.customer.email,
          customerName: quote.customer.name,
          total: quote.total_amount,
          simplified: quote.simplified
        }
      });

      if (error) throw error;
      toast.success('Quote sent successfully');
      setShowOptions(false);
    } catch (error) {
      console.error('Failed to send quote:', error);
      toast.error('Failed to send quote');
    }
  };

  const handleExportPDF = () => {
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
      items: quote.simplified ? undefined : {
        parts: partsItems,
        labor: laborItems
      },
      simplified: quote.simplified
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching quote:', error);
    return <div>Error loading quote: {error.message}</div>;
  }

  if (!quote) {
    return (
      <div className="p-4">
        <div>Quote not found. ID: {id}</div>
        <button 
          onClick={() => navigate('/quotes')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Back to Quotes
        </button>
      </div>
    );
  }

  console.log('Quote data:', quote);
  console.log('Quote items:', quote.items);
  console.log('Items before rendering:', quote.items);

  return (
    <div className="h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 mb-6 bg-gray-800 rounded-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/quotes')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            ←
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white">
                {quote.customer.name}
              </h1>
              <span className="text-gray-400 text-sm">
                #{quote.quote_number}
              </span>
            </div>
            <p className="text-gray-400">
              {format(new Date(quote.date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              ${quote.total_amount.toFixed(2)}
            </div>
            <p className="text-gray-400">
              {quote.status === 'pending' ? 'Pending' : 'Approved'}
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Options Menu */}
      {showOptions && (
        <div className="absolute right-4 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button onClick={() => handleOptionClick('convert')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              Convert to invoice
            </button>
            <button onClick={() => handleOptionClick('accept')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              Mark as accepted
            </button>
            <button onClick={() => handleOptionClick('duplicate')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              Duplicate
            </button>
            <button onClick={() => handleOptionClick('share')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              Share
            </button>
            <button onClick={() => handleOptionClick('archive')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
              Archive
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this quote?')) {
                  console.log('Attempting to delete quote:', id);
                  deleteMutation.mutate();
                  setShowOptions(false);
                }
              }} 
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Delete
            </button>
            <button 
              onClick={() => {
                handleEmailQuote();
                setShowOptions(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Email for Approval
            </button>
            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
            <button 
              onClick={() => {
                handleExportPDF();
                setShowOptions(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 dark:text-white">
            ${quote.total_amount.toFixed(2)}
          </h2>
          <p className="text-gray-500">Quote total</p>
        </div>

        {/* Line Items */}
        <div className="border-t border-b py-4 mb-4 dark:border-gray-700">
          {/* Parts Section */}
          {Array.isArray(quote.items) && quote.items.filter(item => item.type === 'item').length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Parts</h3>
              {quote.items
                .filter(item => item.type === 'item')
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between mb-2 p-3 hover:bg-gray-700 transition-all duration-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold dark:text-white">
                        {item.description} × {item.quantity}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${item.unit_price.toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-semibold dark:text-white">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Labor Section */}
          {Array.isArray(quote.items) && quote.items.filter(item => item.type === 'labor').length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Labor</h3>
              {quote.items
                .filter(item => item.type === 'labor')
                .map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between mb-2 p-3 hover:bg-gray-700 transition-all duration-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold dark:text-white">
                        {item.description} × {item.quantity}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${item.unit_price.toFixed(2)} per hour
                      </p>
                    </div>
                    <p className="font-semibold dark:text-white">
                      ${item.total.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Customer</h3>
            <div className="text-gray-600 dark:text-gray-400">
              <p>{quote.customer.name}</p>
              <p>{quote.customer.email}</p>
              <p>{quote.customer.phone}</p>
              <p>{quote.customer.address}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Project</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {quote.title}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 dark:text-white">Message</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {quote.notes}
            </p>
          </div>

          {quote.attachments && (
            <div>
              <h3 className="font-semibold mb-2 dark:text-white">Attachments</h3>
              <div className="text-gray-600 dark:text-gray-400">
                {/* Add attachment handling here */}
                <p>View attachment</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Quote"
      >
        <CreateQuoteForm
          onSubmit={(data) => updateMutation.mutate(data)}
          onCancel={() => setIsEditModalOpen(false)}
          editingQuote={{
            id: quote.id,
            quote_number: quote.quote_number,
            customer_id: quote.customer_id,
            date: quote.date,
            valid_until: quote.valid_until,
            total_amount: quote.total_amount,
            status: quote.status,
            notes: quote.notes,
            title: quote.title,
            proposal_letter: quote.proposal_letter,
            simplified: quote.simplified,
            items: quote.items?.map(item => ({
              id: item.id,
              quote_id: item.quote_id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total,
              type: item.type
            }))
          }}
        />
      </Modal>
    </div>
  );
} 