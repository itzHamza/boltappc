// AddCourse.tsx
import React from "react";
import { useFetchData } from "./add/hooks/useFetchData";
import { useCourseForms } from "./add/hooks/useCourseForms";
import { useUpload } from "./add/hooks/useUpload";
import CourseForm from "./add/CourseForm";
import VideoSection from "./add/VideoSection";
import PdfSection from "./add/PdfSection";

export default function AddCourse() {
  // Get data fetching hooks
  const {
    years,
    unites,
    modules,
    selectedYear,
    selectedUniteId,
    fetchUnitesAndModules,
    fetchModulesByUnite,
    getNextOrder,
  } = useFetchData();

  // Get form management hooks
  const {
    newCourse,
    setNewCourse,
    activeId,
    setActiveId,
    addCourse,
    addVideo,
    addManualPdf,
    removeVideo,
    handleVideoChange,
    handlePdfChange,
    handleDragEndVideos,
    handleDragEndPdfs,
  } = useCourseForms(getNextOrder);

  // Get upload hooks
  const { uploading, removePdf, uploadPdf } = useUpload(
    selectedYear,
    selectedUniteId,
    years,
    unites,
    modules,
    newCourse,
    setNewCourse
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إضافة درس جديد</h1>

      {/* Course Form */}
      <CourseForm
        years={years}
        unites={unites}
        modules={modules}
        selectedYear={selectedYear}
        selectedUniteId={selectedUniteId}
        newCourse={newCourse}
        onYearChange={fetchUnitesAndModules}
        onUniteChange={fetchModulesByUnite}
        onModuleChange={(moduleId) =>
          setNewCourse({ ...newCourse, module_id: moduleId })
        }
        onTitleChange={(title) => setNewCourse({ ...newCourse, title })}
        onDescriptionChange={(description) =>
          setNewCourse({ ...newCourse, description })
        }
      />

      {/* Videos Section */}
      <VideoSection
        videos={newCourse.videos}
        onAddVideo={addVideo}
        onRemoveVideo={removeVideo}
        onVideoChange={handleVideoChange}
        onDragEnd={handleDragEndVideos}
        activeId={activeId}
        setActiveId={setActiveId}
      />

      {/* PDFs Section */}
      <PdfSection
        pdfs={newCourse.pdfs}
        onAddManualPdf={addManualPdf}
        onRemovePdf={removePdf}
        onPdfChange={handlePdfChange}
        onDragEnd={handleDragEndPdfs}
        uploadPdf={uploadPdf}
        activeId={activeId}
        setActiveId={setActiveId}
        setNewCourse={setNewCourse}
      />

      {/* Submit button */}
      <button
        onClick={addCourse}
        className="px-4 py-2 bg-green-600 text-white rounded-lg mt-6 w-full"
        disabled={uploading}
      >
        {uploading ? "جاري الإضافة..." : "إضافة الدرس"}
      </button>
    </div>
  );
}
