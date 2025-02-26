import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, FileText, Download, DollarSign, Users, Briefcase, ClipboardCheck } from 'lucide-react';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import { exportToCSV } from '../utils/exportData';

interface ReportMetrics {
  totalRevenue: number;
  totalJobs: number;
  completedJobs: number;
  newCustomers: number;
  averageJobValue: number;
  quotesIssued: number;
  quotesAccepted: number;
  invoicesPaid: number;
  topCustomers: {
    name: string;
    revenue: number;
  }[];
  topServices: {
    name: string;
    count: number;
  }[];
}

const Reports = () => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    }
  });

  const isAdmin = currentUser?.role === 'admin';

  const getDateRange = () => {
    if (reportType === 'weekly') {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      return { start, end };
    } else {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return { start, end };
    }
  };

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['report-metrics', reportType, selectedMonth],
    queryFn: async () => {
      const { start, end } = getDateRange();

      // Get all the required data in parallel
      const [
        { data: invoices },
        { data: jobs },
        { data: quotes },
        { data: customers }
      ] = await Promise.all([
        // Get invoices
        supabase
          .from('invoices')
          .select(`
            id,
            total_amount,
            status,
            created_at,
            customer:customers (
              name
            )
          `)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),

        // Get jobs
        supabase
          .from('jobs')
          .select(`
            id,
            status,
            created_at,
            quote:quotes (
              total_amount
            )
          `)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),

        // Get quotes
        supabase
          .from('quotes')
          .select('id, status, total_amount, created_at')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),

        // Get new customers
        supabase
          .from('customers')
          .select('id, name, created_at')
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
      ]);

      if (!invoices || !jobs || !quotes || !customers) {
        throw new Error('Failed to fetch data');
      }

      // Calculate metrics
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const completedJobs = jobs.filter(job => job.status === 'completed');
      const jobValues = jobs
        .filter(job => job.quote?.total_amount)
        .map(job => job.quote?.total_amount || 0);
      
      const averageJobValue = jobValues.length
        ? jobValues.reduce((sum, val) => sum + val, 0) / jobValues.length
        : 0;

      // Calculate top customers by revenue
      const customerRevenue = paidInvoices.reduce((acc, inv) => {
        const customerName = inv.customer?.name || 'Unknown';
        acc[customerName] = (acc[customerName] || 0) + (inv.total_amount || 0);
        return acc;
      }, {} as Record<string, number>);

      const topCustomers = Object.entries(customerRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate top services (using quotes as a proxy)
      const acceptedQuotes = quotes.filter(q => q.status === 'accepted');

      return {
        totalRevenue,
        totalJobs: jobs.length,
        completedJobs: completedJobs.length,
        newCustomers: customers.length,
        averageJobValue,
        quotesIssued: quotes.length,
        quotesAccepted: acceptedQuotes.length,
        invoicesPaid: paidInvoices.length,
        topCustomers,
        topServices: [] // You can implement this if you track services per job/quote
      } as ReportMetrics;
    }
  });

  const handleExport = () => {
    if (!metrics) return;

    const { start, end } = getDateRange();
    const reportData = [
      {
        Metric: 'Report Period',
        Value: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
      },
      {
        Metric: 'Total Revenue',
        Value: `$${metrics.totalRevenue.toFixed(2)}`
      },
      {
        Metric: 'Total Jobs',
        Value: metrics.totalJobs
      },
      {
        Metric: 'Completed Jobs',
        Value: metrics.completedJobs
      },
      {
        Metric: 'New Customers',
        Value: metrics.newCustomers
      },
      {
        Metric: 'Average Job Value',
        Value: `$${metrics.averageJobValue.toFixed(2)}`
      },
      {
        Metric: 'Quotes Issued',
        Value: metrics.quotesIssued
      },
      {
        Metric: 'Quotes Accepted',
        Value: metrics.quotesAccepted
      },
      {
        Metric: 'Quotes Conversion Rate',
        Value: `${((metrics.quotesAccepted / metrics.quotesIssued) * 100).toFixed(1)}%`
      },
      {
        Metric: 'Invoices Paid',
        Value: metrics.invoicesPaid
      }
    ];

    // Add top customers
    metrics.topCustomers.forEach((customer, index) => {
      reportData.push({
        Metric: `Top Customer #${index + 1}`,
        Value: `${customer.name} ($${customer.revenue.toFixed(2)})`
      });
    });

    exportToCSV(
      reportData,
      `business-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}`
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'engineer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'electrician':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'programmer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          {isAdmin && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor('admin')}`}>
              Admin Access
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setReportType('weekly')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium ${
                reportType === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium ${
                reportType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>
          {reportType === 'monthly' && (
            <select
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value))}
              className="w-full sm:w-auto rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const date = subMonths(new Date(), i);
                return (
                  <option key={i} value={format(date, 'yyyy-MM')}>
                    {format(date, 'MMMM yyyy')}
                  </option>
                );
              })}
            </select>
          )}
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            Export Report
          </Button>
        </div>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${metrics.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.completedJobs}/{metrics.totalJobs}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Customers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metrics.newCustomers}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quote Success</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((metrics.quotesAccepted / metrics.quotesIssued) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <ClipboardCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Customers
                </h3>
                <div className="space-y-4">
                  {metrics.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </span>
                        </div>
                        <span className="text-gray-900 dark:text-white">{customer.name}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${customer.revenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Job Value</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${metrics.averageJobValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Quotes Issued</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.quotesIssued}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Quotes Accepted</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.quotesAccepted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Invoices Paid</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.invoicesPaid}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;