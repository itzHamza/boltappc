import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, FolderClosed } from "lucide-react";
import Loader from "../components/Loader";

export function YearPage() {
  const { yearId } = useParams();
  const [unites, setUnites] = useState([]);
  const [modules, setModules] = useState([]);
  const [yearTitle, setYearTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!yearId) return;

    async function fetchYearData() {
      setLoading(true);
      setError("");

      // Fetch the year title
      const { data: yearData, error: yearError } = await supabase
        .from("years")
        .select("title")
        .eq("id", yearId)
        .single();

      if (yearError) {
        setError("Year not found.");
        setLoading(false);
        return;
      }

      setYearTitle(yearData.title);

      // Fetch unites for this year
      const { data: unitesData, error: unitesError } = await supabase
        .from("unites")
        .select("id, title, description")
        .eq("year_id", yearId)
        .order("title", { ascending: true });

      if (unitesError) {
        setError("Error fetching unites.");
      } else {
        setUnites(unitesData);
      }

      // Fetch modules for this year (without unite)
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, title, description, course_count")
        .eq("year_id", yearId)
        .is("unite_id", null)
        .order("title", { ascending: true });

      if (modulesError) {
        setError("Error fetching modules.");
      } else {
        setModules(modulesData);
      }

      setLoading(false);
    }

    fetchYearData();
  }, [yearId]);

  if (loading) {
    return (
      <div className="text-center py-12 h-80 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">{error}</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        {yearTitle}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Select a unit or module to view its courses
      </p>

      {/* Display Unites */}
      {unites.length > 0 && (
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Units
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unites.map((unite, index) => (
              <motion.div
                key={unite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/unite/${unite.id}`}
                  className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                             hover:shadow-lg transition-all transform hover:scale-[1.02] marginleftandright"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <FolderClosed className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {unite.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {unite.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Display Modules */}
      {modules.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/module/${module.id}`}
                  className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                             hover:shadow-lg transition-all transform hover:scale-[1.02] marginleftandright"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {module.description}
                      </p>
                      <div className="mt-4 text-sm font-medium text-blue-600">
                        {module.course_count}{" "}
                        {module.course_count === 1 ? "course" : "courses"}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {unites.length === 0 && modules.length === 0 && (
        <p className="text-center text-gray-600">
          No units or modules available for this year.
        </p>
      )}
    </div>
  );
}
