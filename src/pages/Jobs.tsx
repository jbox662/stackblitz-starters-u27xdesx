import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Clock, DollarSign, User, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

interface Job {
  id: string;
  customer_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  assigned_to?: string;
  created_at: string;
  quote_id?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  quote?: {
    quote_number: string;
    total_amount: number;
  };
  assigned_user?: {
    name: string;
    role: string;
  };
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  total_amount: number;
  notes: string;
  customer: {
    name: string;
    address: string;
  };
}

const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusLabels = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const Jobs = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // Get current user's role
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
      return data;
    }
  });

  const isAdmin = currentUser?.role === 'admin';

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:customers (
            name,
            phone,
            address
          ),
          quote:quotes (
            quote_number,
            total_amount
          ),
          assigned_user:app_users (
            name,
            role
          )
        `)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Job[];
    }
  });

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          customer_id,
          total_amount,
          notes,
          customer:customers (
            name,
            address
          )
        `)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data as Quote[];
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, address')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, name, role')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newJob: Omit<Job, 'id' | 'created_at' | 'customer' | 'quote' | 'assigned_user'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([newJob])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
      setIsModalOpen(false);
      setSelectedQuote(null);
    },
    onError: (error) => {
      toast.error('Failed to create job');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (job: Omit<Job, 'created_at' | 'customer' | 'quote' | 'assigned_user'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          description: job.description,
          customer_id: job.customer_id,
          start_time: job.start_time,
          end_time: job.end_time,
          status: job.status,
          location: job.location,
          quote_id: job.quote_id,
          assigned_to: job.assigned_to
        })
        .eq('id', job.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
      setIsModalOpen(false);
      setEditingJob(null);
      setSelectedQuote(null);
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete job');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jobData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      customer_id: selectedQuote ? selectedQuote.customer_id : formData.get('customer_id') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      status: formData.get('status') as Job['status'],
      location: formData.get('location') as string,
      quote_id: selectedQuote?.id,
      assigned_to: formData.get('assigned_to') as string || null
    };

    if (editingJob) {
      updateMutation.mutate({ ...jobData, id: editingJob.id });
    } else {
      createMutation.mutate(jobData);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job status updated');
    } catch (error) {
      toast.error('Failed to update job status');
      console.error('Error:', error);
    }
  };

  const handleQuoteSelect = (quoteId: string) => {
    const quote = quotes?.find(q => q.id === quoteId);
    setSelectedQuote(quote || null);
  };

  const handleDelete = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      deleteMutation.mutate(jobId);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs?.map((job) => (
          <Card key={job.id}>
            <CardBody className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-white line-clamp-1">{job.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[job.status]}`}>
                    {statusLabels[job.status]}
                  </span>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{job.customer.name}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(job.start_time), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm line-clamp-1">
                      {job.location || job.customer.address}
                    </span>
                  </div>
                  {job.quote && (
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Quote #{job.quote.quote_number}
                      </span>
                    </div>
                  )}
                  {job.assigned_user && (
                    <div className="flex items-center text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Assigned to: {job.assigned_user.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                  {job.status === 'scheduled' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(job.id, 'in_progress')}
                      icon={CheckCircle}
                      className="flex-1"
                    >
                      Start
                    </Button>
                  )}
                  {job.status === 'in_progress' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(job.id, 'completed')}
                      icon={CheckCircle}
                      className="flex-1"
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingJob(job);
                      setIsModalOpen(true);
                    }}
                    icon={Edit}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  {(isAdmin || job.status !== 'completed') && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  )}
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
          setEditingJob(null);
          setSelectedQuote(null);
        }}
        title={editingJob ? 'Edit Job' : 'Create New Job'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingJob && (
            <FormSelect
              label="Create from Quote (Optional)"
              name="quote"
              value={selectedQuote?.id || ''}
              onChange={(e) => handleQuoteSelect(e.target.value)}
              options={[
                { value: '', label: 'Select a quote' },
                ...(quotes?.map(quote => ({
                  value: quote.id,
                  label: `${quote.quote_number} - ${quote.customer.name} ($${quote.total_amount})`
                })) || [])
              ]}
            />
          )}
          <FormInput
            label="Title"
            name="title"
            defaultValue={editingJob?.title || selectedQuote?.notes}
            required
          />
          {!selectedQuote && (
            <FormSelect
              label="Customer"
              name="customer_id"
              defaultValue={editingJob?.customer_id}
              options={[
                { value: '', label: 'Select a customer' },
                ...(customers?.map(customer => ({
                  value: customer.id,
                  label: customer.name
                })) || [])
              ]}
              required
            />
          )}
          <FormInput
            label="Description"
            name="description"
            multiline
            rows={3}
            defaultValue={editingJob?.description}
          />
          <FormInput
            label="Start Time"
            name="start_time"
            type="datetime-local"
            defaultValue={editingJob?.start_time ? new Date(editingJob.start_time).toISOString().slice(0, 16) : ''}
            required
          />
          <FormInput
            label="End Time"
            name="end_time"
            type="datetime-local"
            defaultValue={editingJob?.end_time ? new Date(editingJob.end_time).toISOString().slice(0, 16) : ''}
            required
          />
          <FormInput
            label="Location"
            name="location"
            defaultValue={editingJob?.location || selectedQuote?.customer.address}
            placeholder="Leave blank to use customer's address"
          />
          <FormSelect
            label="Status"
            name="status"
            defaultValue={editingJob?.status || 'scheduled'}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            required
          />
          <FormSelect
            label="Assigned To"
            name="assigned_to"
            defaultValue={editingJob?.assigned_to || ''}
            options={[
              { value: '', label: 'Unassigned' },
              ...(users?.map(user => ({
                value: user.id,
                label: `${user.name} (${user.role})`
              })) || [])
            ]}
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingJob(null);
                setSelectedQuote(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingJob ? 'Update' : 'Create'} Job
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Jobs;