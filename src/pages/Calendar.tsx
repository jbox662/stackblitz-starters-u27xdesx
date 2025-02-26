import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, User, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import './calendar.css';

interface Job {
  id: string;
  title: string;
  customer_id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  assigned_to?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  assigned_user?: {
    name: string;
    role: string;
  };
}

const statusColors = {
  scheduled: '#FCD34D', // yellow
  in_progress: '#60A5FA', // blue
  completed: '#34D399', // green
  cancelled: '#F87171', // red
};

const statusLabels = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const Calendar = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    mutationFn: async (newJob: Omit<Job, 'id' | 'customer' | 'assigned_user'>) => {
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
      toast.success('Job scheduled successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to schedule job');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (job: Omit<Job, 'customer' | 'assigned_user'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          customer_id: job.customer_id,
          start_time: job.start_time,
          end_time: job.end_time,
          status: job.status,
          location: job.location,
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
      setSelectedJob(null);
    },
    onError: (error) => {
      toast.error('Failed to update job');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const date = formData.get('date') as string;
    const startTime = formData.get('start_time') as string;
    const endTime = formData.get('end_time') as string;
    
    const jobData = {
      title: formData.get('title') as string,
      customer_id: formData.get('customer_id') as string,
      start_time: `${date}T${startTime}`,
      end_time: `${date}T${endTime}`,
      status: (formData.get('status') as Job['status']) || 'scheduled',
      location: formData.get('location') as string,
      assigned_to: formData.get('assigned_to') as string || null
    };

    if (selectedJob) {
      updateMutation.mutate({ ...jobData, id: selectedJob.id });
    } else {
      createMutation.mutate(jobData);
    }
  };

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setIsDayModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const job = jobs?.find(j => j.id === info.event.id);
    if (job) {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  // Transform jobs data for the calendar
  const calendarEvents = jobs?.map(job => ({
    id: job.id,
    title: `${job.title} - ${job.customer.name}`,
    start: job.start_time,
    end: job.end_time,
    backgroundColor: statusColors[job.status],
    borderColor: statusColors[job.status],
    extendedProps: {
      customer: job.customer.name,
      location: job.location || job.customer.address,
      status: job.status,
      assignedTo: job.assigned_user?.name
    }
  })) || [];

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
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <button
          onClick={() => {
            setSelectedJob(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Job
        </button>
      </div>

      <div className="bg-[#1a1f2b] rounded-lg shadow p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          editable={true}
          selectable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
        />
      </div>

      {/* Day Jobs Modal */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title={`Jobs for ${selectedDate ? format(new Date(selectedDate), 'MMMM d, yyyy') : ''}`}
      >
        <div className="space-y-4">
          {jobs?.filter(job => {
            const jobDate = new Date(job.start_time).toISOString().split('T')[0];
            return jobDate === selectedDate;
          }).map(job => (
            <div
              key={job.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                setSelectedJob(job);
                setIsDayModalOpen(false);
                setIsModalOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{job.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {statusLabels[job.status]}
                </span>
              </div>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{job.customer.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{format(new Date(job.start_time), 'h:mm a')} - {format(new Date(job.end_time), 'h:mm a')}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{job.location || job.customer.address}</span>
                </div>
                {job.assigned_user && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Assigned to: {job.assigned_user.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                setIsDayModalOpen(false);
                setSelectedJob(null);
                setIsModalOpen(true);
              }}
              icon={Plus}
            >
              Add Job
            </Button>
          </div>
        </div>
      </Modal>

      {/* Job Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        title={selectedJob ? 'Edit Job' : 'Schedule New Job'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Title"
            name="title"
            defaultValue={selectedJob?.title}
            required
          />
          <FormSelect
            label="Customer"
            name="customer_id"
            defaultValue={selectedJob?.customer_id}
            options={[
              { value: '', label: 'Select a customer' },
              ...(customers?.map(customer => ({
                value: customer.id,
                label: customer.name
              })) || [])
            ]}
            required
          />
          <FormSelect
            label="Assigned To"
            name="assigned_to"
            defaultValue={selectedJob?.assigned_to || ''}
            options={[
              { value: '', label: 'Unassigned' },
              ...(users?.map(user => ({
                value: user.id,
                label: `${user.name} (${user.role})`
              })) || [])
            ]}
          />
          <FormInput
            label="Date"
            name="date"
            type="date"
            defaultValue={selectedJob ? format(new Date(selectedJob.start_time), 'yyyy-MM-dd') : selectedDate}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Time"
              name="start_time"
              type="time"
              defaultValue={selectedJob ? format(new Date(selectedJob.start_time), 'HH:mm') : undefined}
              required
            />
            <FormInput
              label="End Time"
              name="end_time"
              type="time"
              defaultValue={selectedJob ? format(new Date(selectedJob.end_time), 'HH:mm') : undefined}
              required
            />
          </div>
          <FormInput
            label="Location"
            name="location"
            defaultValue={selectedJob?.location}
            placeholder="Leave blank to use customer's address"
          />
          {selectedJob && (
            <FormSelect
              label="Status"
              name="status"
              defaultValue={selectedJob.status}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedJob(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedJob ? 'Update' : 'Schedule'} Job
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Calendar;