import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function QuoteApproval() {
  const { id } = useParams();
  const navigate = useNavigate();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Quote approved successfully');
      navigate(`/quotes/${id}`);
    },
    onError: () => {
      toast.error('Failed to approve quote');
    }
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Approve Quote</h1>
        <p className="text-gray-300 mb-8">
          Are you sure you want to approve this quote? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/quotes/${id}`)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Approve Quote
          </button>
        </div>
      </div>
    </div>
  );
} 