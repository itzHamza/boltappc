import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Video,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import { PDFViewer } from "../components/PDFViewer";
import Flashcards from "../components/Flashcards";

// Mock data for modules and their courses
const MODULE_COURSES = {
  anatomy: ["anatomy-renal", "anatomy-cardiac", "anatomy-digestive"],
  physiology: ["physiology-renal", "physiology-cardiac"],
};

// Mock data for courses
const COURSE_DATA = {
  "anatomy-renal": {
    title: "Anatomie rénale",
    description: "Introduction à l'anatomie rénale",
    moduleId: "anatomy",
    videos: [
      {
        id: 1,
        title: "Anatomie des uretères",
        url: "https://www.youtube.com/embed/jKWtF27b6io?si=uCYxWpQ6JQavHKgd",
      },
      {
        id: 2,
        title: "Anatomie de la vessie",
        url: "https://www.youtube.com/embed/PSna_fZmzZM",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Anatomie des uretères",
        url: "/Ostéologie.pdf",
      },
      {
        id: 2,
        title: "Anatomie de la vessie",
        url: "/Ostéologie.pdf",
      },
    ],
  },
  "anatomy-cardiac": {
    title: "Anatomie cardiaque",
    description: "Structure du cœur et vaisseaux",
    moduleId: "anatomy",
    videos: [
      {
        id: 1,
        title: "Introduction à l'anatomie cardiaque",
        url: "https://www.youtube-nocookie.com/embed/Kh_XBp8Y5YI",
      },
      {
        id: 2,
        title: "Les valves cardiaques",
        url: "https://www.youtube-nocookie.com/embed/ssE-ZeY9JVk",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Anatomie du cœur",
        url: "https://www.africau.edu/images/default/sample.pdf",
      },
      {
        id: 2,
        title: "Circulation sanguine",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
  },
  "anatomy-digestive": {
    title: "Système digestif",
    description: "Anatomie du système digestif",
    moduleId: "anatomy",
    videos: [
      {
        id: 1,
        title: "Vue d'ensemble du système digestif",
        url: "https://www.youtube-nocookie.com/embed/Kh_XBp8Y5YI",
      },
      {
        id: 2,
        title: "L'estomac",
        url: "https://www.youtube-nocookie.com/embed/ssE-ZeY9JVk",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Système digestif complet",
        url: "https://www.africau.edu/images/default/sample.pdf",
      },
      {
        id: 2,
        title: "L'estomac en détail",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
  },
  "physiology-renal": {
    title: "Physiologie rénale",
    description: "Fonction rénale et filtration",
    moduleId: "physiology",
    videos: [
      {
        id: 1,
        title: "Introduction à la physiologie rénale",
        url: "https://www.youtube-nocookie.com/embed/Kh_XBp8Y5YI",
      },
      {
        id: 2,
        title: "Filtration glomérulaire",
        url: "https://www.youtube-nocookie.com/embed/ssE-ZeY9JVk",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Physiologie rénale",
        url: "https://www.africau.edu/images/default/sample.pdf",
      },
      {
        id: 2,
        title: "Mécanismes de filtration",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
  },
  "physiology-cardiac": {
    title: "Physiologie cardiaque",
    description: "Fonction cardiaque et circulation",
    moduleId: "physiology",
    videos: [
      {
        id: 1,
        title: "Le cycle cardiaque",
        url: "https://www.youtube-nocookie.com/embed/Kh_XBp8Y5YI",
      },
      {
        id: 2,
        title: "Régulation de la pression artérielle",
        url: "https://www.youtube-nocookie.com/embed/ssE-ZeY9JVk",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Physiologie cardiaque",
        url: "https://www.africau.edu/images/default/sample.pdf",
      },
      {
        id: 2,
        title: "Régulation cardiovasculaire",
        url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    ],
  },
};

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(0);
  const courseData = courseId ? COURSE_DATA[courseId] : null;

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
      </div>
    );
  }

  // Get the module's course list
  const moduleCourses = MODULE_COURSES[courseData.moduleId] || [];
  const currentIndex = moduleCourses.indexOf(courseId);
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
    <div className="space-y-8 lg:px-8">
      <div className="px-4 lg:px-0">
        {/* Course Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => previousCourse && navigateToCourse(previousCourse)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              previousCourse
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed"
            )}
            disabled={!previousCourse}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous Course</span>
          </button>
          <button
            onClick={() => nextCourse && navigateToCourse(nextCourse)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              nextCourse
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed"
            )}
            disabled={!nextCourse}
          >
            <span className="hidden sm:inline">Next Course</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">{courseData.title}</h1>
        <p className="mt-2 text-gray-600">{courseData.description}</p>
      </div>

      {/* Main content with reordered sections for mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Video Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Controls */}
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
                  className={cn(
                    "flex items-center p-3 rounded-lg text-left transition-colors",
                    selectedVideo === index
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 mr-2 flex-shrink-0",
                      selectedVideo === index
                        ? "text-blue-600"
                        : "text-gray-400"
                    )}
                  />
                  <span className="line-clamp-1">{video.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Video Player */}
          <div className="bg-white shadow-sm overflow-hidden">
            <iframe
              src={courseData.videos[selectedVideo].url}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              className="w-full aspect-video"
              title="Course Video"
            />
          </div>

          {/* PDF Controls */}
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
                  className={cn(
                    "flex items-center p-3 rounded-lg text-left transition-colors",
                    selectedPdf === index
                      ? "bg-red-50 text-red-600"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 mr-2 flex-shrink-0",
                      selectedPdf === index ? "text-red-600" : "text-gray-400"
                    )}
                  />
                  <span className="line-clamp-1">{pdf.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="mx-4 lg:mx-0"></div>
        </div>
        <PDFViewer url={courseData.pdfs[selectedPdf].url} className="w-full" />
        <Flashcards lessonId={courseData.title} />
        {/* Sidebar for larger screens */}
        <div className="lg:block space-y-6 mx-4 lg:mx-0">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Content
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Videos</h4>
                <div className="space-y-1 text-sm">
                  {courseData.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center text-gray-600"
                    >
                      <span className="w-6 text-right mr-2">{index + 1}.</span>
                      <span className="line-clamp-1">{video.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">PDFs</h4>
                <div className="space-y-1 text-sm">
                  {courseData.pdfs.map((pdf, index) => (
                    <div
                      key={pdf.id}
                      className="flex items-center text-gray-600"
                    >
                      <span className="w-6 text-right mr-2">{index + 1}.</span>
                      <span className="line-clamp-1">{pdf.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
