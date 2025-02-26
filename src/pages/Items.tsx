import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

interface Item {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  brand: string;
  price: number;
}

const Items = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  const { data: items, isLoading } = useQuery({
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

  // Get unique categories and brands
  const categories = React.useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(item => item.category))).sort();
  }, [items]);

  const brands = React.useMemo(() => {
    if (!items) return [];
    return Array.from(new Set(items.map(item => item.brand))).sort();
  }, [items]);

  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<Item, 'id'>) => {
      const { data, error } = await supabase
        .from('items')
        .insert([newItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create item');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (item: Item) => {
      const { data, error } = await supabase
        .from('items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error('Failed to update item');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete item');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      brand: formData.get('brand') as string,
      price: parseFloat(formData.get('price') as string),
    };

    if (editingItem) {
      updateMutation.mutate({ ...itemData, id: editingItem.id });
    } else {
      createMutation.mutate(itemData);
    }
  };

  const filteredItems = items?.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesBrand = !selectedBrand || item.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

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
        <h1 className="text-3xl font-bold text-white">Items</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          Add Item
        </Button>
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{item.sku}</td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {item.brand}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-right text-gray-900 dark:text-white">${item.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          icon={Edit}
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                        />
                        <Button
                          variant="danger"
                          icon={Trash2}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            name="name"
            defaultValue={editingItem?.name}
            required
          />
          <FormInput
            label="SKU"
            name="sku"
            defaultValue={editingItem?.sku}
            required
          />
          <FormInput
            label="Description"
            name="description"
            multiline
            rows={3}
            defaultValue={editingItem?.description}
          />
          <FormSelect
            label="Category"
            name="category"
            defaultValue={editingItem?.category}
            options={categories.map(category => ({
              value: category,
              label: category
            }))}
            required
          />
          <FormSelect
            label="Brand"
            name="brand"
            defaultValue={editingItem?.brand}
            options={brands.map(brand => ({
              value: brand,
              label: brand
            }))}
            required
          />
          <FormInput
            label="Price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={editingItem?.price}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update' : 'Create'} Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Items;