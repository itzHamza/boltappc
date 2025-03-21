import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  User,
  Menu,
  X,
  GraduationCap,
  Calculator,
  Briefcase,
  HeartPulse,
  Dna,
  Stethoscope,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { cn } from "../../lib/utils";
import logo from "/lgo.svg"; // ✅ يضمن تحميل الصورة بشكل صحيح
import { Analytics } from "@vercel/analytics/react";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const navigationItems = [
    {
      name: "Première Année",
      icon: Dna,
      href: "/year/1",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Deuxième Année",
      icon: HeartPulse,
      href: "/year/2",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Troisième Année",
      icon: Stethoscope,
      href: "/year/3",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Quatrième Année",
      icon: Briefcase,
      href: "/year/4",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    // {
    //   name: "Fifth Year Medicine",
    //   icon: GraduationCap,
    //   href: "/year/5",
    //   color: "text-amber-600",
    //   bgColor: "bg-amber-50",
    // },
    // {
    //   name: "Sixth Year Medicine",
    //   icon: GraduationCap,
    //   href: "/year/6",
    //   color: "text-indigo-600",
    //   bgColor: "bg-indigo-50",
    // },
    {
      name: "Calc grades",
      icon: Calculator,
      href: "/calc",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  // ✅ البحث في Supabase عند تغيير نص البحث
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .ilike("title", `%${searchTerm}%`); // 🔍 البحث بدون حساسية لحالة الأحرف

      if (error) {
        console.error("Error fetching search results:", error);
      } else {
        setSearchResults(data);
      }
    };

    fetchResults();
  }, [searchTerm]);

  return (
    <>
      <Analytics />
      {/* زر فتح القائمة الجانبية في الجوال */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-900"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* الشريط الجانبي */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* الشعار */}
        <div className="flex justify-center items-center py-4">
          <Link className="w-full flex justify-center" to="/">
            <img
              src={logo}
              alt="TBIB"
              className="w-40 md:w-56 lg:w-72 h-auto"
            />
          </Link>
        </div>

        {/* البحث */}
        <div className="p-4 border-b border-gray-200 relative">
          <div className="relative">
            <input
              type="search"
              placeholder="Seatrch for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* عرض نتائج البحث */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 w-full bg-white shadow-lg border border-gray-200 rounded-lg mt-2 z-50">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  to={`/course/${result.id}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-900"
                  onClick={() => setSearchTerm("")} // ✅ إخفاء النتائج عند الضغط
                >
                  {result.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* القائمة الجانبية */}
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
        </nav>
      </div>

      {/* محتوى الصفحة الأساسي */}
      <div
        className={cn(
          "lg:ml-64 transition-all duration-200",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        {/* المحتوى هنا */}
      </div>
    </>
  );
}
