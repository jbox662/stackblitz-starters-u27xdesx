import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import Button from './Button';
import { Trash2, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  hourly_rate: number;
}

interface Item {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  type: 'item' | 'labor';
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  total_amount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    type: 'item' | 'labor';
  }>;
}

interface CreateInvoiceFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingInvoice?: any;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ 
  onSubmit, 
  onCancel,
  editingInvoice = null
}) => {
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>(editingInvoice?.items || []);
  const [totalAmount, setTotalAmount] = useState(editingInvoice?.total_amount || 0);
  const [markup, setMarkup] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(editingInvoice?.customer_id || '');

  // Fetch accepted quotes
  const { data: quotes } = useQuery<Quote[]>({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          customer_id,
          total_amount,
          customer:customers (
            id,
            name,
            email
          ),
          items:quote_items (
            description,
            quantity,
            unit_price,
            total,
            type
          )
        `)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }
      
      return data || [];
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

  const { data: availableItems } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('category')
        .order('name');
      
      if (error) throw error;
      return data as Item[];
    }
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  // Update customer when quote is selected
  useEffect(() => {
    if (selectedQuote && quotes) {
      const quote = quotes.find(q => q.id === selectedQuote);
      if (quote) {
        setSelectedCustomerId(quote.customer_id);
      }
    }
  }, [selectedQuote, quotes]);

  const categories = useMemo(() => {
    if (!availableItems) return [];
    const uniqueCategories = Array.from(new Set(availableItems.map(item => item.category)));
    return uniqueCategories.sort();
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    if (!availableItems) return [];
    if (!selectedCategory) return availableItems;
    return availableItems.filter(item => item.category === selectedCategory);
  }, [availableItems, selectedCategory]);

  const summaryTotals = useMemo(() => {
    const partsTotal = selectedItems
      .filter(item => item.type === 'item')
      .reduce((sum, item) => sum + (item.total || 0), 0);
    
    const laborTotal = selectedItems
      .filter(item => item.type === 'labor')
      .reduce((sum, item) => sum + (item.total || 0), 0);

    return {
      parts: partsTotal,
      labor: laborTotal,
      total: partsTotal + laborTotal
    };
  }, [selectedItems]);

  useEffect(() => {
    setTotalAmount(summaryTotals.total);
  }, [summaryTotals.total]);

  const applyMarkup = (price: number): number => {
    return price * (1 + markup / 100);
  };

  const handleQuoteSelect = (quoteId: string) => {
    if (!quoteId) {
      setSelectedQuote('');
      setSelectedItems([]);
      setTotalAmount(0);
      setSelectedCustomerId('');
      return;
    }

    const quote = quotes?.find(q => q.id === quoteId);
    if (!quote || !quote.items) {
      toast.error('Failed to load quote details');
      return;
    }

    const invoiceItems = quote.items.map(item => ({
      id: Math.random().toString(),
      invoice_id: '',
      description: item.description,
      quantity: item.quantity,
      unit_price: applyMarkup(item.unit_price),
      total: applyMarkup(item.total),
      type: item.type || 'item'
    }));

    setSelectedItems(invoiceItems);
    setTotalAmount(calculateTotal(invoiceItems));
    setSelectedQuote(quoteId);
    setSelectedCustomerId(quote.customer_id);
  };

  const calculateTotal = (items: InvoiceItem[]): number => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleAddItem = (itemId: string) => {
    if (!itemId) return;
    
    const item = availableItems?.find(i => i.id === itemId);
    if (!item) return;

    const newItem = {
      id: Math.random().toString(),
      invoice_id: '',
      description: item.name,
      quantity: 1,
      unit_price: applyMarkup(item.price),
      total: applyMarkup(item.price),
      type: 'item' as const
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleAddLabor = (serviceId: string) => {
    if (!serviceId) return;
    
    const service = services?.find(s => s.id === serviceId);
    if (!service) return;

    const newItem = {
      id: Math.random().toString(),
      invoice_id: '',
      description: service.name,
      quantity: 1,
      unit_price: service.hourly_rate,
      total: service.hourly_rate,
      type: 'labor' as const
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setSelectedItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          const total = item.unit_price * quantity;
          return { ...item, quantity, total };
        }
        return item;
      })
    );
  };

  const handlePriceChange = (itemId: string, price: number) => {
    if (price < 0) return;

    setSelectedItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          const total = price * item.quantity;
          return { ...item, unit_price: price, total };
        }
        return item;
      })
    );
  };

  const handleMarkupChange = (value: number) => {
    const newMarkup = Math.max(0, Math.min(100, value));
    setMarkup(newMarkup);

    const updatedItems = selectedItems.map(item => {
      if (item.type === 'labor') return item;
      
      const basePrice = item.unit_price / (1 + markup / 100);
      const newUnitPrice = basePrice * (1 + newMarkup / 100);
      return {
        ...item,
        unit_price: newUnitPrice,
        total: newUnitPrice * item.quantity
      };
    });

    setSelectedItems(updatedItems);
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    // Clear quote selection if customer changes
    if (selectedQuote) {
      const quote = quotes?.find(q => q.id === selectedQuote);
      if (quote && quote.customer_id !== customerId) {
        setSelectedQuote('');
        setSelectedItems([]);
        setTotalAmount(0);
      }
    }
  };

  // Separate items and labor
  const partsItems = selectedItems.filter(item => item.type === 'item');
  const laborItems = selectedItems.filter(item => item.type === 'labor');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      quote_id: selectedQuote || null,
      customer_id: selectedCustomerId,
      date: formData.get('date'),
      due_date: formData.get('due_date'),
      items: selectedItems,
      total_amount: totalAmount,
      notes: formData.get('notes'),
      status: editingInvoice ? formData.get('status') : 'pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!editingInvoice && (
        <FormSelect
          label="Create from Quote (Optional)"
          name="quote"
          value={selectedQuote}
          onChange={(e) => handleQuoteSelect(e.target.value)}
          options={[
            { value: '', label: 'Select a quote' },
            ...(quotes?.map(quote => ({
              value: quote.id,
              label: `${quote.quote_number} - ${quote.customer.name} ($${quote.total_amount.toFixed(2)})`
            })) || [])
          ]}
        />
      )}

      <FormSelect
        label="Customer"
        name="customer_id"
        value={selectedCustomerId}
        onChange={(e) => handleCustomerChange(e.target.value)}
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
          defaultValue={editingInvoice?.date || new Date().toISOString().split('T')[0]}
          required
        />
        <FormInput
          label="Due Date"
          name="due_date"
          type="date"
          defaultValue={editingInvoice?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-2">Parts</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                name="category"
                placeholder="Filter by category..."
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map(category => ({
                    value: category,
                    label: category
                  }))
                ]}
              />
              <FormSelect
                name="item"
                placeholder="Add an item..."
                value=""
                onChange={(e) => handleAddItem(e.target.value)}
                options={[
                  { value: '', label: 'Select an item' },
                  ...filteredItems.map(item => ({
                    value: item.id,
                    label: `${item.name} ($${item.price})`
                  }))
                ]}
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-white mb-2">
              Markup %
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={markup}
                onChange={(e) => handleMarkupChange(parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-8 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {partsItems.length > 0 && (
          <div className="mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {partsItems.map((item) => (
                  <tr key={item.id} className="text-white">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                      />
                    </td>
                    <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-white font-semibold">
                  <td colSpan={3} className="py-4 text-right">Parts Subtotal:</td>
                  <td className="py-4 text-right">${summaryTotals.parts.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-2">Labor</h3>
        <FormSelect
          name="service"
          placeholder="Add labor..."
          value=""
          onChange={(e) => handleAddLabor(e.target.value)}
          options={[
            { value: '', label: 'Select labor type' },
            ...(services?.map(service => ({
              value: service.id,
              label: `${service.name} ($${service.hourly_rate}/hr)`
            })) || [])
          ]}
        />

        {laborItems.length > 0 && (
          <div className="mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Hours</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {laborItems.map((item) => (
                  <tr key={item.id} className="text-white">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                      />
                    </td>
                    <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-white font-semibold">
                  <td colSpan={3} className="py-4 text-right">Labor Subtotal:</td>
                  <td className="py-4 text-right">${summaryTotals.labor.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {(partsItems.length > 0 || laborItems.length > 0) && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-end text-lg font-bold text-white">
            <span className="mr-8">Total:</span>
            <span>${summaryTotals.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <FormInput
        label="Notes"
        name="notes"
        multiline
        rows={3}
        defaultValue={editingInvoice?.notes}
        placeholder="Additional notes or payment terms..."
      />

      {editingInvoice && (
        <FormSelect
          label="Status"
          name="status"
          defaultValue={editingInvoice.status}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'cancelled', label: 'Cancelled' }
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
          {editingInvoice ? 'Update' : 'Create'} Invoice
        </Button>
      </div>
    </form>
  );
};

export default CreateInvoiceForm;