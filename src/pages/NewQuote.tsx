import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import CreateQuoteForm from '../components/CreateQuoteForm';

export default function NewQuote() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newQuote: any) => {
      const quoteNumber = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Create quote
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
          proposal_letter: newQuote.proposal_letter,
          simplified: newQuote.simplified
        }])
        .select()
        .single();
      
      if (quoteError) throw quoteError;

      // Create quote items - remove _basePrice before inserting
      if (newQuote.items?.length > 0) {
        const cleanedItems = newQuote.items.map((item: any) => ({
          quote_id: quote.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          type: item.type
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(cleanedItems);
        
        if (itemsError) throw itemsError;
      }

      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Quote created successfully');
      navigate('/quotes');
    },
    onError: () => {
      toast.error('Failed to create quote');
    }
  });

  return (
    <div className="h-full bg-gray-900">
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">
        <button 
          onClick={() => navigate('/quotes')}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
        >
          ←
        </button>
        <h1 className="text-2xl font-semibold text-white">New Quote</h1>
      </div>
      <div className="p-4">
        <CreateQuoteForm 
          onSubmit={createMutation.mutate}
          onCancel={() => navigate('/quotes')}
        />
      </div>
    </div>
  );
} 