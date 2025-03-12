import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileText,
  Video,
  Brain,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function AdminHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: "Add Unites",
      icon: LayoutDashboard,
      href: "/admin",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Edit Unites",
      icon: LayoutDashboard,
      href: "/admin/editunitemodules",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Add Lessons",
      icon: BookOpen,
      href: "/admin/lessons",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Edit Courses",
      icon: Video,
      href: "/admin/edit",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Edit Order",
      icon: Video,
      href: "/admin/editcourseorder",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },

    {
      name: "Flashcards",
      icon: Brain,
      href: "/admin/flashcards",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      name: "Edit Flashcards",
      icon: Brain,
      href: "/admin/editflashcards",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/admin/login");
    } else {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <>
      <SpeedInsights />
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900 text-white"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Link to="/admin" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="px-4 py-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800"
                )}
              >
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <item.icon className={cn("w-5 h-5", item.color)} />
                </div>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-3 mt-8 w-full rounded-lg hover:bg-gray-800 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <div
        className={cn(
          "lg:ml-64 transition-all duration-200",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* Content goes here */}
      </div>
    </>
  );
}
