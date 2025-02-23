import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Video, FileText, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { PDFViewer } from "../components/PDFViewer";

// Mock data for courses
const COURSE_DATA = {
  "anatomy-renal": {
    title: "Anatomie rénale",
    description: "",
    videos: [
      {
        id: 1,
        title: "Anatomie des uretères",
        url: "https://www.youtube-nocookie.com/embed/jTQBx15l6m8",
      },
      {
        id: 2,
        title: "Anatomie de la vessie",
        url: "https://www.youtube-nocookie.com/embed/5ToeaQu-4IU",
      },
    ],
    pdfs: [
      {
        id: 1,
        title: "Anatomie des uretères",
        url: "https://tbiibe.netlify.app/qcm%20digestive.pdf",
      },
      {
        id: 2,
        title: "Anatomie de la vessie",
        url: "/Ostéologie.pdf",
      },
      {
        id: 3,
        title: "Anatomie de la vessie",
        url: "/Ostéologie.pdf",
      },
    ],
  },
  "anatomy-cardiac": {
    title: "Anatomie cardiaque",
    description: "Structure du cœur et vaisseaux",
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
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(0);
  const courseData = courseId ? COURSE_DATA[courseId] : null;

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Coming Soon...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{courseData.title}</h1>
        <p className="mt-2 text-gray-600">{courseData.description}</p>
      </div>

      {/* Main content with full width on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-[-1rem] px-4 lg:mx-0 lg:px-0">
        {/* Video Section - full width on mobile */}
        <div className="lg:col-span-2 space-y-8 w-full">
          {/* Video Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4">
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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <iframe
              src={courseData.videos[selectedVideo].url}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Course Video"
            />
          </div>

          {/* PDF Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4">
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
          <PDFViewer
            url={courseData.pdfs[selectedPdf].url}
            className="w-full"
          />
        </div>

        {/* Sidebar for larger screens */}
        <div className="hidden lg:block space-y-6">
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
