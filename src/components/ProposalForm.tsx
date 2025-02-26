import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import Button from './Button';

interface ProposalFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingProposal?: any;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ 
  onSubmit, 
  onCancel,
  editingProposal = null
}) => {
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      customer_id: formData.get('customer_id'),
      date: formData.get('date'),
      valid_until: formData.get('valid_until'),
      proposal_letter: formData.get('proposal_letter'),
      status: editingProposal ? formData.get('status') : 'pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSelect
        label="Customer"
        name="customer_id"
        defaultValue={editingProposal?.customer_id}
        options={[
          { value: '', label: 'Select a customer' },
          ...(customers?.map(customer => ({
            value: customer.id,
            label: customer.name
          })) || [])
        ]}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Date"
          name="date"
          type="date"
          defaultValue={editingProposal?.date || new Date().toISOString().split('T')[0]}
          required
        />
        <FormInput
          label="Valid Until"
          name="valid_until"
          type="date"
          defaultValue={editingProposal?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          required
        />
      </div>

      {/* Proposal Letter Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-white">Proposal Letter</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <FormInput
            name="proposal_letter"
            multiline
            rows={12}
            defaultValue={editingProposal?.proposal_letter}
            placeholder={`Dear [Customer Name],

Thank you for the opportunity to provide this proposal. We are pleased to offer the following solution for your consideration.

Project Overview:
[Describe the project scope, objectives, and deliverables]

Proposed Solution:
[Detail the proposed solution, including technical specifications and implementation approach]

Timeline:
[Outline project timeline and major milestones]

Terms and Conditions:
1. This proposal is valid for the period specified above
2. Payment terms: [Specify payment terms]
3. Warranty: [Specify warranty terms]

Additional Notes:
- [Any additional important information]
- [Special considerations or requirements]

Legal Disclosures:
[Include any necessary legal disclosures, warranties, or limitations]

We look forward to working with you on this project. Please feel free to contact us with any questions.

Best regards,
[Your Name]
[Your Company]`}
            className="font-mono text-sm"
          />
        </div>
      </div>

      {editingProposal && (
        <FormSelect
          label="Status"
          name="status"
          defaultValue={editingProposal.status}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'expired', label: 'Expired' }
          ]}
          required
        />
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editingProposal ? 'Update' : 'Create'} Proposal
        </Button>
      </div>
    </form>
  );
};

export default ProposalForm;