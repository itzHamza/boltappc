import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  ChevronRight,
  FolderClosed,
  NotebookText,
} from "lucide-react";
import Loader from "../components/Loader";
import { Helmet } from "react-helmet-async";

export function ModulePage() {
  const { moduleId } = useParams();
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModuleData() {
      setLoading(true);

      // Fetch module details (title & description)
      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("title, description")
        .eq("id", moduleId)
        .single();

      if (moduleError) {
        console.error("Error fetching module:", moduleError);
      } else {
        setModuleTitle(moduleData.title);
        setModuleDescription(moduleData.description);
      }

      // Fetch courses that belong to this module
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, videos, pdfs")
        .eq("module_id", moduleId)
        .order("order", { ascending: true });

      if (coursesError) {
        console.error("Error fetching courses:", coursesError);
      } else {
        // Convert video/pdf count
        const formattedCourses = coursesData.map((course) => ({
          ...course,
          videoCount: course.videos.length,
          pdfCount: course.pdfs.length,
        }));

        setCourses(formattedCourses);
      }

      setLoading(false);
    }

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId]);

  if (loading) {
    return (
      <div className="text-center py-12 h-80 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!moduleTitle) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Module not found</h1>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{moduleTitle} - TBiB Cours</title>
        <meta
          name="description"
          content={`Accédez aux cours du module "${moduleTitle}". Retrouvez toutes les ressources essentielles pour le comprendre, le maîtriser et réussir vos examens.`}
        />
        <meta
          name="keywords"
          content={`${moduleTitle}, ${moduleTitle} médecine, ${moduleTitle} cours, ${moduleTitle} tbib, ${moduleTitle} tbib cours, tbib ${moduleTitle}, tbib cours ${moduleTitle}, études médicales, cours de médecine, طب, دروس طب, TBiB, TBiB Cours, طب الجزائر, ملخصات طبية, امتحانات طب, QCM, TBiB Academy, TBiiBe, tbib space, study with tbib, médecine algérie, support médical, cours médical en ligne`}
        />
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        {moduleTitle}
      </h1>
      <p className="text-gray-600 mb-8 text-center">{moduleDescription}</p>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600">
          No courses available in this module.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/course/${course.id}`}
                className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm 
                           hover:shadow-lg transition-all transform hover:scale-[1.02] marginleftandright"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <NotebookText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Video className="w-4 h-4 mr-1" />
                        <span>{course.videoCount} videos</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-1" />
                        <span>{course.pdfCount} PDFs</span>
                      </div>
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
