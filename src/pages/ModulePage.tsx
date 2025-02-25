import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BookOpen, Video, FileText, ChevronRight } from "lucide-react";

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
        .order("created_at", { ascending: true }); 

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
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2 justify-self-center">
        {moduleTitle}
      </h1>
      <p className="text-gray-600 mb-8 justify-self-center">
        {moduleDescription}
      </p>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600">
          No courses available in this module.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all marginleftandright"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
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
          ))}
        </div>
      )}
    </div>
  );
}
