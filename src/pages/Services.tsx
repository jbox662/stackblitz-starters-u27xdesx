import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  hourly_rate: number;
}

const Services = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newService: Omit<Service, 'id'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert([newService])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create service');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (service: Service) => {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', service.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
      setIsModalOpen(false);
      setEditingService(null);
    },
    onError: (error) => {
      toast.error('Failed to update service');
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete service');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const hourlyRate = parseFloat(formData.get('hourly_rate') as string);
    const serviceData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      hourly_rate: hourlyRate,
      price: hourlyRate, // Same as hourly rate since we're not using duration
    };

    if (editingService) {
      updateMutation.mutate({ ...serviceData, id: editingService.id });
    } else {
      createMutation.mutate(serviceData);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services?.map((service) => (
          <Card key={service.id}>
            <CardBody className="p-3">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">{service.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">{service.description}</p>
                <div className="flex items-center text-gray-900 dark:text-white mb-3">
                  <DollarSign className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                  <span className="text-base font-semibold">${service.hourly_rate}/hour</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    icon={Edit}
                    className="flex-1 py-1.5 text-sm"
                    onClick={() => {
                      setEditingService(service);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    className="py-1.5 text-sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this service?')) {
                        deleteMutation.mutate(service.id);
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
          setEditingService(null);
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            name="name"
            defaultValue={editingService?.name}
            required
          />
          <FormInput
            label="Description"
            name="description"
            multiline
            rows={3}
            defaultValue={editingService?.description}
          />
          <FormInput
            label="Hourly Rate ($)"
            name="hourly_rate"
            type="number"
            step="0.01"
            defaultValue={editingService?.hourly_rate}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingService(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingService ? 'Update' : 'Create'} Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;