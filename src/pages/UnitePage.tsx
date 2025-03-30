import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import Loader from "../components/Loader";
import { Helmet } from "react-helmet-async";

export function UnitePage() {
  const { uniteId } = useParams();
  const [modules, setModules] = useState([]);
  const [uniteTitle, setUniteTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uniteId) return;

    async function fetchUniteData() {
      setLoading(true);
      setError("");

      // Fetch the unite title
      const { data: uniteData, error: uniteError } = await supabase
        .from("unites")
        .select("title")
        .eq("id", uniteId)
        .single();

      if (uniteError) {
        setError("Unite not found.");
        setLoading(false);
        return;
      }

      setUniteTitle(uniteData.title);

      // Fetch modules for this unite
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, title, description, course_count")
        .eq("unite_id", uniteId)
        .order("title", { ascending: true });

      if (modulesError) {
        setError("Error fetching modules.");
      } else {
        setModules(modulesData);
      }

      setLoading(false);
    }

    fetchUniteData();
  }, [uniteId]);

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
      <Helmet>
        <title> {uniteTitle} - TBiB Cours</title>
        <meta
          name="description"
          content={`Accédez aux modules de l'unité ${uniteTitle}. Retrouvez les meilleurs cours, résumés et flashcards pour maîtriser l'unité et réussir vos examens.`}
        />
        <meta
          name="keywords"
          content={`${uniteTitle}, ${uniteTitle} médecine, ${uniteTitle} cours, ${uniteTitle} tbib, ${uniteTitle} tbib cours, tbib ${uniteTitle}, tbib cours ${uniteTitle} études médicales, cours de médecine, طب, دروس طب, TBiB, TBiB Cours, طب الجزائر, ملخصات طبية, امتحانات طب, QCM, TBiB Academy, TBiiBe, tbib space, study with tbib, médecine algérie, support médical, cours médical en ligne`}
        />
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        {uniteTitle}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Select a module to view its courses
      </p>

      {modules.length === 0 ? (
        <p className="text-center text-gray-600">
          No modules available for this unite.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
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
        </motion.div>
      )}
    </div>
  );
}
