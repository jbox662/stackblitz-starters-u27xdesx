import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign,
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import Card, { CardHeader, CardBody } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const DashboardCard = ({ title, value, icon: Icon, color, onClick }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  onClick?: () => void;
}) => (
  <Card className={`cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`} onClick={onClick}>
    <CardBody className="flex items-center">
      <div className={`p-3 rounded-full ${color} text-white mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </CardBody>
  </Card>
);

const ActivityItem = ({ icon: Icon, title, description, time, color }: {
  icon: any;
  title: string;
  description: string;
  time: string;
  color: string;
}) => (
  <div className="flex items-start space-x-3">
    <div className={`${color} p-2 rounded-full`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="flex-shrink-0">
      <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { count: customersCount },
        { count: quotesCount },
        { count: jobsCount },
        { data: revenue }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total_amount').eq('status', 'paid')
      ]);

      const totalRevenue = revenue?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      return {
        customers: customersCount || 0,
        quotes: quotesCount || 0,
        jobs: jobsCount || 0,
        revenue: totalRevenue
      };
    }
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data: activities } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:customers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return activities;
    }
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'quote':
        navigate('/quotes', { state: { openModal: true } });
        break;
      case 'invoice':
        navigate('/invoices', { state: { openModal: true } });
        break;
      case 'customer':
        navigate('/customers', { state: { openModal: true } });
        break;
      case 'job':
        navigate('/calendar', { state: { openModal: true } });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Revenue"
          value={`$${stats?.revenue.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="bg-green-500"
          onClick={() => navigate('/invoices')}
        />
        <DashboardCard
          title="Active Jobs"
          value={stats?.jobs || 0}
          icon={Briefcase}
          color="bg-blue-500"
          onClick={() => navigate('/jobs')}
        />
        <DashboardCard
          title="Total Customers"
          value={stats?.customers || 0}
          icon={Users}
          color="bg-purple-500"
          onClick={() => navigate('/customers')}
        />
        <DashboardCard
          title="Pending Quotes"
          value={stats?.quotes || 0}
          icon={FileText}
          color="bg-yellow-500"
          onClick={() => navigate('/quotes')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activities</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivities?.length ? (
                recentActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    icon={activity.status === 'completed' ? CheckCircle : Clock}
                    title={activity.title}
                    description={`Customer: ${activity.customer.name}`}
                    time={format(new Date(activity.created_at), 'MMM d, h:mm a')}
                    color={
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }
                  />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No recent activities to display</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => handleQuickAction('quote')}
                className="flex items-center justify-center py-4 text-sm font-medium"
              >
                Create Quote
              </Button>
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => handleQuickAction('invoice')}
                className="flex items-center justify-center py-4 text-sm font-medium"
              >
                New Invoice
              </Button>
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => handleQuickAction('customer')}
                className="flex items-center justify-center py-4 text-sm font-medium"
              >
                Add Customer
              </Button>
              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => handleQuickAction('job')}
                className="flex items-center justify-center py-4 text-sm font-medium"
              >
                Schedule Job
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;