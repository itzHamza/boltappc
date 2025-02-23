import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, GraduationCap, BookOpen, Video, FileText, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    {
      name: 'First Year Medicine',
      icon: GraduationCap,
      href: '/year/1',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Second Year Medicine',
      icon: GraduationCap,
      href: '/year/2',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Third Year Medicine',
      icon: GraduationCap,
      href: '/year/3',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Fourth Year Medicine',
      icon: GraduationCap,
      href: '/year/4',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      name: 'Fifth Year Medicine',
      icon: GraduationCap,
      href: '/year/5',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      name: 'Sixth Year Medicine',
      icon: GraduationCap,
      href: '/year/6',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-900"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://qcm-configue.netlify.app/logo.jpg" alt="TBIB" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">
              <b>TBIB</b><sub> Cours</sub>
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="search"
              placeholder="Search lessons..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <item.icon className={cn("w-5 h-5", item.color)} />
                </div>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="flex items-center space-x-2 px-4 py-3 mt-8 w-full rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 rounded-lg bg-gray-50">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <span>Login</span>
          </Link>
        </nav>
      </div>

      {/* Main content wrapper */}
      <div className={cn(
        "lg:ml-64 transition-all duration-200",
        isSidebarOpen ? "ml-64" : "ml-0"
      )}>
        {/* Content goes here */}
      </div>
    </>
  );
}