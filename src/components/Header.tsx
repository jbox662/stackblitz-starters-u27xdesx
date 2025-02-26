import React from 'react';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Button from './Button';
import { useQuery } from '@tanstack/react-query';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('app_users')
        .select('name')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    }
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to sign out');
      console.error('Error:', error);
    } else {
      navigate('/login');
      toast.success('Signed out successfully');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm h-12 lg:h-16">
      <div className="flex justify-between items-center h-full px-4 lg:px-6">
        <div className="flex items-center pl-12 lg:pl-0"> {/* Add left padding on mobile to accommodate hamburger */}
          <h2 className="text-sm lg:text-base font-semibold text-gray-800 dark:text-white truncate max-w-[200px] sm:max-w-none">
            {isLoading ? (
              <span className="animate-pulse">Welcome back</span>
            ) : currentUser?.name ? (
              <>Welcome back, <span className="text-blue-600 dark:text-blue-400">{currentUser.name}</span></>
            ) : (
              'Welcome back'
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <Moon className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
          </button>
          <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          <Button
            variant="secondary"
            icon={LogOut}
            onClick={handleSignOut}
            className="ml-2 text-sm lg:text-base py-1 lg:py-2"
          >
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;