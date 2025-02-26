import React, { useState, useRef } from 'react';
import { UserCircle, Mail, Calendar, Shield, Users as UsersIcon, Plus, Camera, Pencil, Trash2 } from 'lucide-react';
import Card, { CardBody } from '../components/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import toast from 'react-hot-toast';

interface User {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'programmer', label: 'Programmer' },
  { value: 'user', label: 'User' }
];

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const Users = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // First get the auth user
  const { data: authUser } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Then get the app user profile
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ['current-user', authUser?.id],
    enabled: !!authUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_user_id', authUser!.id)
        .single();
      
      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
      return data as User | null;
    }
  });

  const isAdmin = currentUser?.role === 'admin';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    }
  });

  const uploadAvatar = async (file: File, userId: string) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('app_users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    await uploadAvatar(file, userId);
  };

  const createMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string; role: string }) => {
      // First create the auth user with signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create the app user
      const { data, error } = await supabase
        .from('app_users')
        .insert([{
          auth_user_id: authData.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully. They will receive an email to confirm their account.');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create user');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (user: Pick<User, 'id' | 'name' | 'role'>) => {
      const { data, error } = await supabase
        .from('app_users')
        .update({
          name: user.name,
          role: user.role
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error('Failed to update user');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (user: User) => {
      const { error: deleteUserError } = await supabase
        .from('app_users')
        .delete()
        .eq('id', user.id);
      
      if (deleteUserError) throw deleteUserError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
      setDeleteConfirmationOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error('Failed to delete user');
      console.error('Error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        name: formData.get('name') as string,
        role: formData.get('role') as string
      });
    } else {
      createMutation.mutate({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
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

  if (isLoading || isCurrentUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white">Users</h1>
          {isAdmin && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor('admin')}`}>
              Admin Access
            </span>
          )}
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            Add User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardBody>
              <div className="flex items-center mb-4">
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  {user.auth_user_id === authUser?.id && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, user.id)}
                      />
                    </>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <div className="flex items-center text-gray-400">
                    <Mail className="w-4 h-4 mr-1" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Role</span>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                    <span className={`font-semibold capitalize px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Member Since</span>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="font-semibold text-white">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              {(isAdmin || user.auth_user_id === authUser?.id) && (
                <div className="mt-4 pt-4 border-t border-gray-700 flex space-x-2">
                  <Button
                    variant="secondary"
                    icon={Pencil}
                    className="flex-1"
                    onClick={() => {
                      setEditingUser(user);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  {isAdmin && user.auth_user_id !== authUser?.id && (
                    <Button
                      variant="danger"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(user)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            name="name"
            defaultValue={editingUser?.name}
            required
          />
          {!editingUser && (
            <>
              <FormInput
                label="Email"
                name="email"
                type="email"
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                required
              />
            </>
          )}
          {(isAdmin || editingUser?.auth_user_id === authUser?.id) && (
            <FormSelect
              label="Role"
              name="role"
              value={editingUser?.role}
              options={ROLES}
              required
            />
          )}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmationOpen}
        onClose={() => {
          setDeleteConfirmationOpen(false);
          setUserToDelete(null);
        }}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Are you sure you want to delete {userToDelete?.name}? This will remove their access to the system, but all records they created will be preserved.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteConfirmationOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;