import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BookOpen, ChevronRight } from "lucide-react";
import Loader from "../components/Loader";

export function YearPage() {
  const { yearId } = useParams();
  const [modules, setModules] = useState([]);
  const [yearTitle, setYearTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!yearId) return;

    async function fetchModules() {
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

      // Fetch modules for this year
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, title, description, course_count")
        .eq("year_id", yearId)
        .order("title", { ascending: true });

      if (modulesError) {
        setError("Error fetching modules.");
      } else {
        setModules(modulesData);
      }

      setLoading(false);
    }

    fetchModules();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2 justify-self-center ">
        {yearTitle}
      </h1>
      <p className="text-gray-600 mb-8 justify-self-center">
        Select a module to view its courses
      </p>

      {modules.length === 0 ? (
        <p className="text-center text-gray-600">
          No modules available for this year.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Link
              key={module.id}
              to={`/module/${module.id}`}
              className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all marginleftandright"
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
          ))}
        </div>
      )}
    </div>
  );
}
