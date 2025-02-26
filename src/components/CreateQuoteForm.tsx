import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import Button from './Button';
import { Trash2, Percent } from 'lucide-react';

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
  brand: string;
}

interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  type: 'item' | 'labor';
}

interface ItemWithMarkup extends QuoteItem {
  _basePrice?: number;
}

interface CreateQuoteFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editingQuote?: any;
}

const CreateQuoteForm: React.FC<CreateQuoteFormProps> = ({ 
  onSubmit, 
  onCancel,
  editingQuote = null
}) => {
  const [selectedItems, setSelectedItems] = useState<ItemWithMarkup[]>(() => {
    if (editingQuote?.items) {
      return editingQuote.items.map(item => ({
        ...item,
        id: item.id || Math.random().toString(),
        _basePrice: item.type === 'item' ? item.unit_price : undefined,
        type: item.type || 'item'
      }));
    }
    return [];
  });

  const [totalAmount, setTotalAmount] = useState(editingQuote?.total_amount || 0);
  const [markup, setMarkup] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSimplifiedView, setIsSimplifiedView] = useState(() => editingQuote?.simplified || false);
  const [selectedCustomer, setSelectedCustomer] = useState(editingQuote?.customer_id || '');

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
        .order('brand', { ascending: true })
        .order('name', { ascending: true });
      
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

  const brands = useMemo(() => {
    if (!availableItems) return [];
    return Array.from(new Set(availableItems.map(item => item.brand))).sort();
  }, [availableItems]);

  const categories = useMemo(() => {
    if (!availableItems) return [];
    const filteredItems = selectedBrand 
      ? availableItems.filter(item => item.brand === selectedBrand)
      : availableItems;
    return Array.from(new Set(filteredItems.map(item => item.category))).sort();
  }, [availableItems, selectedBrand]);

  const filteredItems = useMemo(() => {
    if (!availableItems) return [];
    return availableItems.filter(item => {
      const matchesBrand = !selectedBrand || item.brand === selectedBrand;
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesBrand && matchesCategory;
    });
  }, [availableItems, selectedBrand, selectedCategory]);

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
    return price * (1 + (markup / 100));
  };

  const handleMarkupChange = (value: number) => {
    const newMarkup = Math.max(0, Math.min(100, value));
    setMarkup(newMarkup);

    // Only update items, not labor
    const updatedItems = selectedItems.map(item => {
      if (item.type === 'labor') return item;
      
      const basePrice = item._basePrice || item.unit_price / (1 + (markup / 100));
      const newUnitPrice = applyMarkup(basePrice);
      return {
        ...item,
        _basePrice: basePrice,
        unit_price: newUnitPrice,
        total: newUnitPrice * item.quantity
      };
    });

    setSelectedItems(updatedItems);
  };

  const handleAddItem = (itemId: string) => {
    const item = availableItems?.find(i => i.id === itemId);
    if (!item) return;

    const markedUpPrice = applyMarkup(item.price);

    const newItem: ItemWithMarkup = {
      id: Math.random().toString(),
      quote_id: editingQuote?.id || '',
      description: item.name,
      quantity: 1,
      unit_price: markedUpPrice,
      _basePrice: item.price,
      total: markedUpPrice,
      type: 'item'
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleAddService = (serviceId: string) => {
    const service = services?.find(s => s.id === serviceId);
    if (!service) return;

    const newItem: QuoteItem = {
      id: Math.random().toString(),
      quote_id: editingQuote?.id || '',
      description: service.name,
      quantity: 1,
      unit_price: service.hourly_rate,
      total: service.hourly_rate,
      type: 'labor'
    };

    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (isNaN(quantity) || quantity < 1) return;

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
    if (isNaN(price) || price < 0) return;

    setSelectedItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          const total = price * item.quantity;
          const isItem = item.type === 'item';
          return { 
            ...item, 
            unit_price: price,
            _basePrice: isItem ? price / (1 + (markup / 100)) : price,
            total 
          };
        }
        return item;
      })
    );
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value);
    setSelectedCategory('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      customer_id: selectedCustomer,
      date: formData.get('date'),
      valid_until: formData.get('valid_until'),
      items: selectedItems,
      total_amount: summaryTotals.total,
      notes: formData.get('notes'),
      proposal_letter: formData.get('proposal_letter'),
      status: editingQuote ? formData.get('status') : 'pending',
      simplified: isSimplifiedView
    };

    onSubmit(data);
  };

  // Separate items and labor
  const productItems = selectedItems.filter(item => item.type === 'item');
  const laborItems = selectedItems.filter(item => item.type === 'labor');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Simplified View Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-sm text-gray-400">Simplified View</span>
        <button
          type="button"
          onClick={() => setIsSimplifiedView(!isSimplifiedView)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSimplifiedView ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSimplifiedView ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Customer Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Customer</label>
        <div className="relative">
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            required
          >
            <option value="">Select a customer</option>
            {customers?.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Date and Valid Until */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={editingQuote?.date || new Date().toISOString().split('T')[0]}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Valid Until</label>
          <input
            type="date"
            name="valid_until"
            defaultValue={editingQuote?.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Proposal Letter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Proposal Letter</label>
        <textarea
          name="proposal_letter"
          rows={12}
          defaultValue={editingQuote?.proposal_letter}
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Dear [Customer Name],

Thank you for the opportunity to provide this proposal. We are pleased to offer the following solution for your consideration.

Project Overview:
[Describe the project scope, objectives, and deliverables]

Proposed Solution:
[Detail the proposed solution, including technical specifications and implementation approach]`}
        />
      </div>

      {/* Summary Section */}
      {isSimplifiedView && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Quote Summary</h3>
          <div className="bg-gray-800 p-4 rounded-lg space-y-3">
            {summaryTotals.parts > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Parts Total:</span>
                <span className="text-white">${summaryTotals.parts.toFixed(2)}</span>
              </div>
            )}
            {summaryTotals.labor > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-300">Labor Total:</span>
                <span className="text-white">${summaryTotals.labor.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <span className="font-medium text-gray-300">Total:</span>
              <span className="font-medium text-white">${summaryTotals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Parts and Labor sections */}
      {!isSimplifiedView && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Parts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormSelect
                  name="brand"
                  placeholder="Filter by brand..."
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  options={[
                    { value: '', label: 'All Brands' },
                    ...brands.map(brand => ({
                      value: brand,
                      label: brand
                    }))
                  ]}
                />
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
              </div>
              <FormSelect
                name="item"
                placeholder="Add an item..."
                value=""
                onChange={(e) => handleAddItem(e.target.value)}
                options={[
                  { value: '', label: 'Select an item' },
                  ...filteredItems.map(item => ({
                    value: item.id,
                    label: `${item.name} ($${applyMarkup(item.price).toFixed(2)})`
                  }))
                ]}
              />
            </div>

            {productItems.length > 0 && (
              <div className="mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-sm">
                      <th className="py-2">Parts</th>
                      <th className="py-2 text-right">Quantity</th>
                      <th className="py-2 text-right">Base Price</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {productItems.map((item) => (
                      <tr key={item.id} className="text-white">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2">
                          <input
                            type="text"
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              handleQuantityChange(item.id, parseInt(value) || 0);
                            }}
                            className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                          />
                        </td>
                        <td className="py-2 text-right text-gray-400">
                          ${item._basePrice?.toFixed(2)}
                        </td>
                        <td className="py-2">
                          <input
                            type="text"
                            value={item.unit_price || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d.]/g, '');
                              handlePriceChange(item.id, parseFloat(value) || 0);
                            }}
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
                </table>
              </div>
            )}
          </div>

          {/* Labor Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Labor</h3>
            <FormSelect
              name="service"
              placeholder="Add labor..."
              value=""
              onChange={(e) => handleAddService(e.target.value)}
              options={[
                { value: '', label: 'Select a service' },
                ...(services?.map(service => ({
                  value: service.id,
                  label: `${service.name} ($${service.hourly_rate.toFixed(2)}/hr)`
                })) || [])
              ]}
            />

            {laborItems.length > 0 && (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm">
                    <th className="py-2">Service</th>
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
                          type="text"
                          value={item.quantity || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            handleQuantityChange(item.id, parseInt(value) || 0);
                          }}
                          className="w-20 px-2 py-1 text-right bg-gray-700 border border-gray-600 rounded"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="text"
                          value={item.unit_price || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, '');
                            handlePriceChange(item.id, parseFloat(value) || 0);
                          }}
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
              </table>
            )}
          </div>

          {/* Markup Control */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-400">Markup %</label>
            <div className="relative">
              <input
                type="text"
                value={markup}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  handleMarkupChange(parseInt(value) || 0);
                }}
                className="w-24 pl-3 pr-8 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {editingQuote ? 'Update Quote' : 'Create Quote'}
        </button>
      </div>
    </form>
  );
};

export default CreateQuoteForm;