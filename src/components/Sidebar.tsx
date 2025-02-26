import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Briefcase,
  Wrench,
  Package,
  Map,
  Calendar as CalendarIcon,
  UserCog,
  Settings as SettingsIcon,
  BarChart,
  Menu,
  X,
  FileCheck
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: FileCheck, label: 'Proposals', path: '/proposals' },
  { icon: FileText, label: 'Quotes', path: '/quotes' },
  { icon: Receipt, label: 'Invoices', path: '/invoices' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
  { icon: Wrench, label: 'Labor', path: '/labor' },
  { icon: Package, label: 'Items', path: '/items' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
  { icon: BarChart, label: 'Reports', path: '/reports' },
  { icon: UserCog, label: 'Users', path: '/users' },
  { icon: SettingsIcon, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-2 left-2 z-[60] p-2 rounded-lg bg-gray-900 text-white"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[45] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-[50] bg-gray-900 dark:bg-gray-950 text-white w-64 flex-shrink-0 transition-transform duration-300 transform lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:flex flex-col h-screen`}
      >
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold truncate">Business Manager</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                  isActive ? 'bg-gray-800 text-white' : ''
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5 min-w-[1.25rem]" />
              <span className="ml-3 text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Sidebar;