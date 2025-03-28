import React, { useState, useEffect, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Video,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Dices,
} from "lucide-react";
import Loader from "../components/Loader";

// Lazy load components that aren't needed immediately
const Chatbot = lazy(() => import("../components/Chatbot"));
const PDFViewer = lazy(() => import("../components/PDFViewer"));
const Flashcards = lazy(() => import("../components/Flashcards"));

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [moduleCourses, setModuleCourses] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCourse() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (error) {
          console.error("Error fetching course:", error);
        } else if (isMounted) {
          setCourseData(data);
        }
      } catch (error) {
        console.error("Error in fetch operation:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (courseId) {
      fetchCourse();
    }

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchModuleCourses() {
      if (!courseData?.module_id) return;

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id, title")
          .eq("module_id", courseData.module_id)
          .order("order", { ascending: true });

        if (error) {
          console.error("Error fetching module courses:", error);
        } else if (isMounted) {
          setModuleCourses(data);
        }
      } catch (error) {
        console.error("Error in fetch operation:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (courseData) {
      fetchModuleCourses();
    }

    return () => {
      isMounted = false;
    };
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

  const currentIndex = moduleCourses.findIndex(
    (course) => course.id === courseId
  );
  const previousCourse =
    currentIndex > 0 ? moduleCourses[currentIndex - 1] : null;
  const nextCourse =
    currentIndex < moduleCourses.length - 1
      ? moduleCourses[currentIndex + 1]
      : null;

  const navigateToCourse = (courseId) => {
    navigate(`/course/${courseId}`);
    setSelectedVideo(0);
    setSelectedPdf(0);
  };

  return (
    <div className="w-full space-y-8 lg:px-8">
      <Helmet>
        <title>{courseData.title} - TBiB Cours</title>
        <meta
          name="keywords"
          content={`${courseData.title}, ${courseData.title} cours, ${courseData.title} tbib cours, tbib cours ${courseData.title}, ${courseData.title} tbib, ${courseData.title} PDF, ${courseData.title} vidéo, ${courseData.title} cours médecine, apprendre ${courseData.title}, ${courseData.title} en ligne, cours ${courseData.module}, ${courseData.module} médecine, formation ${courseData.module}, éducation médicale, plateforme d'apprentissage médecine, Tbib, Tbib Cours, Tbib Academy, Tbib QCM, Tbib Series, cours médecine Algérie, faculté de médecine Algérie, cours gratuits médecine, cours en ligne médecine, meilleure plateforme pour étudiants en médecine`}
        />
      </Helmet>

      <div className="px-4 lg:px-0">
        <Suspense
          fallback={
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg"></div>
          }
        >
          {/* <Chatbot /> */}
        </Suspense>

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
            aria-label={
              previousCourse
                ? `Previous course: ${previousCourse.title}`
                : "No previous course"
            }
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
            aria-label={
              nextCourse ? `Next course: ${nextCourse.title}` : "No next course"
            }
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Video className="w-5 h-5 mr-2 text-blue-600" />
          Videos
        </h2>
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
              aria-label={`Select video: ${video.title}`}
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

      {/* Video Player - Lazy loaded with intersection observer */}
      <div className="w-full bg-white shadow-sm overflow-hidden">
        {courseData.videos.length > 0 && (
          <iframe
            src={courseData.videos[selectedVideo]?.url}
            loading="lazy"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full aspect-video sm:h-auto px-1 rounded-2xl"
            title={`Video: ${courseData.videos[selectedVideo]?.title}`}
            width="100%"
            height="100%"
          />
        )}
      </div>

      {/* PDF Section */}
      <div className="bg-white shadow-sm p-4 mx-4 lg:mx-0 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-red-600" />
          PDF Resources
        </h2>
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
              aria-label={`Select PDF: ${pdf.title}`}
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

      {/* PDF Viewer - Show directly without waiting for user interaction */}
      {courseData.pdfs.length > 0 && (
        <div className="mx-4 lg:mx-0">
          <Suspense
            fallback={
              <div className="h-80vh w-full bg-gray-100 animate-pulse rounded-lg"></div>
            }
          >
            <PDFViewer
              url={courseData.pdfs[selectedPdf]?.url}
              className="h-[80vh]"
              style={{ width: "100%", height: "80vh" }}
            />
          </Suspense>

          <div className="flex justify-center items-center h-20 mt-4">
            <button
              onClick={() =>
                window.open(
                  `/pdf-viewer/${encodeURIComponent(
                    courseData.pdfs[selectedPdf]?.url
                  )}`,
                  "_blank"
                )
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition"
              aria-label="Open PDF in new window"
            >
              Show PDF
            </button>
          </div>
        </div>
      )}

      {/* Flashcards - Lazy loaded */}
      <div className="bg-white shadow-sm p-4 lg:mx-0 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Dices className="w-5 h-5 mr-2 text-black" />
          Flashcards
        </h2>
      </div>
      <div className="flex justify-center">
        <div className="w-full sm:w-2/3">
          <Suspense
            fallback={
              <div className="h-40 w-full bg-gray-100 animate-pulse rounded-lg"></div>
            }
          >
            <Flashcards
              lessonId={courseData.id}
              courseName={courseData.title}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
