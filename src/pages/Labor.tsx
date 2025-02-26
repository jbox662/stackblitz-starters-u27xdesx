import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';

interface LaborRate {
  id: string;
  name: string;
  description: string;
  hourly_rate: number;
}

const Labor = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<LaborRate | null>(null);

  const { data: laborRates, isLoading } = useQuery({
    queryKey: ['labor-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as LaborRate[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newRate: Omit<LaborRate, 'id'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert([newRate])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create labor rate');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (rate: LaborRate) => {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: rate.name,
          description: rate.description,
          hourly_rate: rate.hourly_rate
        })
        .eq('id', rate.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate updated successfully');
      setIsModalOpen(false);
      setEditingRate(null);
    },
    onError: (error) => {
      toast.error('Failed to update labor rate');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labor-rates'] });
      toast.success('Labor rate deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete labor rate');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      hourly_rate: parseFloat(formData.get('hourly_rate') as string),
    };

    if (editingRate) {
      updateMutation.mutate({ ...rateData, id: editingRate.id });
    } else {
      createMutation.mutate(rateData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Labor Rates</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          Add Labor Rate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {laborRates?.map((rate) => (
          <Card key={rate.id}>
            <CardBody className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white">{rate.name}</h3>
                  <div className="flex items-center text-green-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{rate.hourly_rate}/hr</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4 flex-1">{rate.description}</p>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                  <Button
                    variant="secondary"
                    icon={Edit}
                    onClick={() => {
                      setEditingRate(rate);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this labor rate?')) {
                        deleteMutation.mutate(rate.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRate(null);
        }}
        title={editingRate ? 'Edit Labor Rate' : 'Add New Labor Rate'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            name="name"
            defaultValue={editingRate?.name}
            required
          />
          <FormInput
            label="Description"
            name="description"
            multiline
            rows={3}
            defaultValue={editingRate?.description}
          />
          <FormInput
            label="Hourly Rate ($)"
            name="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={editingRate?.hourly_rate}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingRate(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingRate ? 'Update' : 'Create'} Labor Rate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Labor;