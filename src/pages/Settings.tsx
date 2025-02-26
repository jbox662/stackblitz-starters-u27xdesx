import React, { useState, useRef } from 'react';
import {
  User,
  Building2,
  Bell,
  Shield,
  Moon,
  Sun,
  CreditCard,
  Lock,
  Key,
  Camera,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card, { CardBody } from '../components/Card';
import FormInput from '../components/FormInput';
import { useTheme } from '../contexts/ThemeContext';

interface UserProfile {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

interface Settings {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

const SettingsSection = ({ 
  title, 
  icon: Icon,
  isActive,
  onClick 
}: { 
  title: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-600' 
        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    <div className="flex items-center">
      <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
      <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
        {title}
      </span>
    </div>
  </button>
);

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as Settings;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const { error } = await supabase
        .from('app_users')
        .update(data)
        .eq('id', profile?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error:', error);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const { error } = await supabase
        .from('settings')
        .update(data)
        .eq('id', settings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Error:', error);
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error('Failed to update password');
      console.error('Error:', error);
    }
  });

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await updateProfileMutation.mutateAsync({ avatar_url: publicUrl });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    await handleAvatarUpload(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (activeSection === 'profile') {
      updateProfileMutation.mutate({
        name: formData.get('name') as string,
      });
    } else if (activeSection === 'company') {
      updateSettingsMutation.mutate({
        company_name: formData.get('company_name') as string,
        company_email: formData.get('company_email') as string,
        company_phone: formData.get('company_phone') as string,
        company_address: formData.get('company_address') as string,
      });
    } else if (activeSection === 'notifications') {
      updateSettingsMutation.mutate({
        email_notifications: formData.get('email_notifications') === 'on',
        sms_notifications: formData.get('sms_notifications') === 'on',
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Details</h2>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
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
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="Name"
                        name="name"
                        defaultValue={profile?.name}
                        disabled={!isEditing}
                        required
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={profile?.email}
                        disabled={true}
                        required
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <FormInput
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <FormInput
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <FormInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
                <Button variant="secondary">Enable 2FA</Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <Card>
            <CardBody>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={toggleTheme}
                  icon={theme === 'dark' ? Sun : Moon}
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            </CardBody>
          </Card>
        );

      case 'company':
        return (
          <Card>
            <CardBody>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company Information</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Company Name"
                    name="company_name"
                    defaultValue={settings?.company_name}
                    required
                  />
                  <FormInput
                    label="Company Email"
                    name="company_email"
                    type="email"
                    defaultValue={settings?.company_email}
                    required
                  />
                  <FormInput
                    label="Phone"
                    name="company_phone"
                    type="tel"
                    defaultValue={settings?.company_phone}
                    required
                  />
                  <FormInput
                    label="Address"
                    name="company_address"
                    defaultValue={settings?.company_address}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardBody>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      name="email_notifications"
                      defaultChecked={settings?.email_notifications}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Email notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sms_notifications"
                      name="sms_notifications"
                      defaultChecked={settings?.sms_notifications}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sms_notifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      SMS notifications
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>
        );

      case 'billing':
        return (
          <div className="space-y-4">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Plan</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Professional
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$49.99</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
                  </div>
                  <Button variant="secondary">Change Plan</Button>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Plan Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Unlimited quotes and invoices
                    </li>
                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Advanced reporting
                    </li>
                    <li className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Method</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        •••• •••• •••• 4242
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Expires 12/25
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary">Update</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardBody className="p-2">
              <nav className="space-y-1">
                <SettingsSection
                  title="Profile"
                  icon={User}
                  isActive={activeSection === 'profile'}
                  onClick={() => setActiveSection('profile')}
                />
                <SettingsSection
                  title="Company"
                  icon={Building2}
                  isActive={activeSection === 'company'}
                  onClick={() => setActiveSection('company')}
                />
                <SettingsSection
                  title="Security"
                  icon={Shield}
                  isActive={activeSection === 'security'}
                  onClick={() => setActiveSection('security')}
                />
                <SettingsSection
                  title="Notifications"
                  icon={Bell}
                  isActive={activeSection === 'notifications'}
                  onClick={() => setActiveSection('notifications')}
                />
                <SettingsSection
                  title="Appearance"
                  icon={Moon}
                  isActive={activeSection === 'appearance'}
                  onClick={() => setActiveSection('appearance')}
                />
                <SettingsSection
                  title="Billing"
                  icon={CreditCard}
                  isActive={activeSection === 'billing'}
                  onClick={() => setActiveSection('billing')}
                />
              </nav>
            </CardBody>
          </Card>
        </div>

        <div className="col-span-12 md:col-span-9">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;