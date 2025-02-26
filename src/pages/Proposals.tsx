import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import ImportExport from '../components/ImportExport';
import { exportToCSV, exportToPDF } from '../utils/exportData';
import EmailButton from '../components/EmailButton';
import ExportDropdown from '../components/ExportDropdown';
import ProposalForm from '../components/ProposalForm';

interface Proposal {
  id: string;
  proposal_number: string;
  customer_id: string;
  date: string;
  valid_until: string;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes: string;
  proposal_letter: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items?: ProposalItem[];
}

interface ProposalItem {
  id: string;
  proposal_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  type: 'item' | 'labor';
}

const Proposals = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customers(name, email, phone, address),
          items:proposal_items(
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
      return data as Proposal[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newProposal: any) => {
      const proposalNumber = `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      try {
        const { data: proposal, error: proposalError } = await supabase
          .from('proposals')
          .insert([{
            proposal_number: proposalNumber,
            customer_id: newProposal.customer_id,
            date: newProposal.date,
            valid_until: newProposal.valid_until,
            total_amount: newProposal.total_amount,
            status: 'pending',
            notes: newProposal.notes,
            proposal_letter: newProposal.proposal_letter
          }])
          .select()
          .single();
        
        if (proposalError) throw proposalError;

        if (newProposal.items?.length > 0) {
          const { error: itemsError } = await supabase
            .from('proposal_items')
            .insert(
              newProposal.items.map((item: any) => ({
                proposal_id: proposal.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total,
                type: item.type
              }))
            );
          
          if (itemsError) throw itemsError;
        }

        return proposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (proposal: Proposal) => {
      try {
        const { error: proposalError } = await supabase
          .from('proposals')
          .update({
            customer_id: proposal.customer_id,
            date: proposal.date,
            valid_until: proposal.valid_until,
            total_amount: proposal.total_amount,
            status: proposal.status,
            notes: proposal.notes,
            proposal_letter: proposal.proposal_letter
          })
          .eq('id', proposal.id);
        
        if (proposalError) throw proposalError;

        const { error: deleteError } = await supabase
          .from('proposal_items')
          .delete()
          .eq('proposal_id', proposal.id);
        
        if (deleteError) throw deleteError;

        if (proposal.items?.length > 0) {
          const { error: itemsError } = await supabase
            .from('proposal_items')
            .insert(
              proposal.items.map(item => ({
                proposal_id: proposal.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total,
                type: item.type
              }))
            );
          
          if (itemsError) throw itemsError;
        }

        return proposal;
      } catch (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsModalOpen(false);
      setEditingProposal(null);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  const handleExportCSV = () => {
    if (!proposals) return;

    const data = proposals.map(proposal => ({
      'Proposal Number': proposal.proposal_number,
      'Customer': proposal.customer.name,
      'Date': new Date(proposal.date).toLocaleDateString(),
      'Valid Until': new Date(proposal.valid_until).toLocaleDateString(),
      'Total Amount': `$${proposal.total_amount.toFixed(2)}`,
      'Status': proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1),
      'Notes': proposal.notes || ''
    }));

    exportToCSV(data, `proposals-${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    if (!proposals) return;

    const data = proposals.map(proposal => ({
      'Proposal #': proposal.proposal_number,
      'Customer': proposal.customer.name,
      'Date': new Date(proposal.date).toLocaleDateString(),
      'Valid Until': new Date(proposal.valid_until).toLocaleDateString(),
      'Amount': `$${proposal.total_amount.toFixed(2)}`,
      'Status': proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)
    }));

    exportToPDF({
      title: 'Proposals',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      filename: `proposals-${new Date().toISOString().split('T')[0]}`,
      data,
      columns: [
        { header: 'Proposal #', dataKey: 'Proposal #' },
        { header: 'Customer', dataKey: 'Customer' },
        { header: 'Date', dataKey: 'Date' },
        { header: 'Valid Until', dataKey: 'Valid Until' },
        { header: 'Amount', dataKey: 'Amount' },
        { header: 'Status', dataKey: 'Status' }
      ]
    });
  };

  const handleSingleProposalExportCSV = (proposal: Proposal) => {
    const data = [{
      'Proposal Number': proposal.proposal_number,
      'Customer': proposal.customer.name,
      'Date': new Date(proposal.date).toLocaleDateString(),
      'Valid Until': new Date(proposal.valid_until).toLocaleDateString(),
      'Total Amount': `$${proposal.total_amount.toFixed(2)}`,
      'Status': proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1),
      'Notes': proposal.notes || ''
    }];

    if (proposal.items) {
      data[0]['Items'] = proposal.items.map(item => 
        `${item.description} (${item.quantity} x $${item.unit_price})`
      ).join('; ');
    }

    exportToCSV(data, `proposal-${proposal.proposal_number}-${new Date().toISOString().split('T')[0]}`);
  };

  const handleSingleProposalPDF = (proposal: Proposal) => {
    const partsItems = proposal.items?.filter(item => item.type === 'item') || [];
    const laborItems = proposal.items?.filter(item => item.type === 'labor') || [];

    const partsTotal = partsItems.reduce((sum, item) => sum + item.total, 0);
    const laborTotal = laborItems.reduce((sum, item) => sum + item.total, 0);

    exportToPDF({
      title: `Proposal ${proposal.proposal_number}`,
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      filename: `proposal-${proposal.proposal_number}`,
      data: proposal.items || [],
      columns: [
        { header: 'Description', dataKey: 'description' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Unit Price', dataKey: 'unit_price' },
        { header: 'Total', dataKey: 'total' }
      ],
      customer: proposal.customer,
      totals: [
        { label: 'Parts Total:', amount: partsTotal },
        { label: 'Labor Total:', amount: laborTotal },
        { label: 'Total:', amount: proposal.total_amount }
      ],
      proposalLetter: proposal.proposal_letter,
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
        const proposalNumber = `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('name', item.Customer)
          .single();

        if (!customer) {
          toast.error(`Customer "${item.Customer}" not found`);
          continue;
        }

        const { error: proposalError } = await supabase
          .from('proposals')
          .insert([{
            proposal_number: proposalNumber,
            customer_id: customer.id,
            date: new Date().toISOString().split('T')[0],
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_amount: parseFloat(item['Total Amount'].replace('$', '')),
            status: 'pending',
            notes: item.Notes
          }]);

        if (proposalError) throw proposalError;
      }

      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposals imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import proposals');
    }
  };

  const columns = [
    {
      header: 'Proposal #',
      accessor: 'proposal_number',
      className: 'font-medium'
    },
    {
      header: 'Customer',
      accessor: (row: Proposal) => (
        <div>
          <div className="text-white">{row.customer.name}</div>
          <div className="text-sm text-gray-400 hidden sm:block">{row.customer.email}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: (row: Proposal) => new Date(row.date).toLocaleDateString(),
      hideOnMobile: true
    },
    {
      header: 'Amount',
      accessor: (row: Proposal) => `$${row.total_amount.toFixed(2)}`,
      align: 'right' as const
    },
    {
      header: 'Status',
      accessor: (row: Proposal) => (
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
      accessor: (row: Proposal) => (
        <div className="flex justify-end space-x-2">
          <ExportDropdown
            onExportPDF={() => handleSingleProposalPDF(row)}
            onExportCSV={() => handleSingleProposalExportCSV(row)}
          />
          <EmailButton
            type="proposal"
            document={row}
          />
          <Button
            variant="secondary"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              setEditingProposal(row);
              setIsModalOpen(true);
            }}
          />
          <Button
            variant="danger"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this proposal?')) {
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
        <h1 className="text-3xl font-bold text-white">Proposals</h1>
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
            New Proposal
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0 sm:p-4">
          <Table
            columns={columns}
            data={proposals || []}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProposal(null);
        }}
        title={editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
      >
        <ProposalForm
          onSubmit={(data) => {
            if (editingProposal) {
              updateMutation.mutate({ ...editingProposal, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProposal(null);
          }}
          editingProposal={editingProposal}
        />
      </Modal>
    </div>
  );
};

export default Proposals;