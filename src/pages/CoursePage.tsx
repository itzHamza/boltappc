import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Video,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ClipboardX,
} from "lucide-react";
import PDFViewer from "../components/PDFViewer";
import Flashcards from "../components/Flashcards";
import Loader from "../components/Loader";

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [moduleCourses, setModuleCourses] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(0);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
      } else {
        setCourseData(data);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    async function fetchModuleCourses() {
      if (!courseData?.module_id) return;

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("module_id", courseData.module_id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching module courses:", error);
      } else {
        setModuleCourses(data);
      }
      setLoading(false);
    }
    if (courseData) {
      fetchModuleCourses();
    }
  }, [courseData]);

  if (loading) {
    return (
      <div className="text-center py-12 h-80 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
      </div>
    );
  }

  // Determine previous and next courses within the same module
  const currentIndex = moduleCourses.findIndex(
    (course) => course.id === courseId
  );
  const previousCourse =
    currentIndex > 0 ? moduleCourses[currentIndex - 1] : null;
  const nextCourse =
    currentIndex < moduleCourses.length - 1
      ? moduleCourses[currentIndex + 1]
      : null;

  const navigateToCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
    setSelectedVideo(0);
    setSelectedPdf(0);
  };

  return (
    <div className="w-screen sm:w-full space-y-8 lg:px-8">
      <div className="px-4 lg:px-0">
        {/* Course Navigation (only within the same module) */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              previousCourse && navigateToCourse(previousCourse.id)
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              previousCourse
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            disabled={!previousCourse}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">
              {previousCourse ? previousCourse.title : "No Previous Course"}
            </span>
          </button>

          <button
            onClick={() => nextCourse && navigateToCourse(nextCourse.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              nextCourse
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed"
            }`}
            disabled={!nextCourse}
          >
            <span className="hidden sm:inline">
              {nextCourse ? nextCourse.title : "No Next Course"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{courseData.title}</h1>
        <p className="mt-2 text-gray-600">{courseData.description}</p>
      </div>

      {/* Video Section */}
      <div className="bg-white shadow-sm p-4 mx-4 lg:mx-0 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Video className="w-5 h-5 mr-2 text-blue-600" />
          Videos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {courseData.videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(index)}
              className={`flex items-center p-3 rounded-lg text-left transition-colors ${
                selectedVideo === index
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <ChevronRight
                className={`w-4 h-4 mr-2 flex-shrink-0 ${
                  selectedVideo === index ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <span className="line-clamp-1">{video.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Player */}
      <div className="w-screen sm:w-full bg-white shadow-sm overflow-hidden">
        <iframe
          src={courseData.videos[selectedVideo]?.url}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-full aspect-video sm:h-auto px-1 rounded-2xl"
          title="Course Video"
        />
      </div>

      {/* PDF Section */}
      <div className="bg-white shadow-sm p-4 mx-4 lg:mx-0 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-red-600" />
          PDF Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {courseData.pdfs.map((pdf, index) => (
            <button
              key={pdf.id}
              onClick={() => setSelectedPdf(index)}
              className={`flex items-center p-3 rounded-lg text-left transition-colors ${
                selectedPdf === index
                  ? "bg-red-50 text-red-600"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <ChevronRight
                className={`w-4 h-4 mr-2 flex-shrink-0 ${
                  selectedPdf === index ? "text-red-600" : "text-gray-400"
                }`}
              />
              <span className="line-clamp-1">{pdf.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="mx-4 lg:mx-0">
        <PDFViewer
          url={courseData.pdfs[selectedPdf]?.url}
          className="h-[80vh]"
        />
        {/* زر فتح الـ PDF في نافذة جديدة */}
        <div className="flex justify-center items-center h-40">
          <button
            onClick={() =>
              window.open(`/pdf-viewer/${encodeURIComponent(courseData.pdfs[selectedPdf]?.url)}`,"_blank")
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition">
            Show PDF
          </button>
        </div>
      </div>

      {/* Flashcards */}
      <div className="bg-white shadow-sm p-4 lg:mx-0 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ClipboardX className="w-5 h-5 mr-2 text-black" />
          Flashcards
        </h3>
      </div>
      <div className="flex justify-center">
        <div className="w-full sm:w-2/3">
          <Flashcards lessonId={courseData.id} />
        </div>
      </div>
    </div>
  );
}
