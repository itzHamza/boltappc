// hooks/useCourseForms.ts
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../../lib/supabaseClient";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";

interface Video {
  id: string;
  title: string;
  url: string;
}

interface Pdf {
  id: string;
  title: string;
  url: string;
}

interface CourseData {
  title: string;
  description: string;
  module_id: string;
  videos: Video[];
  pdfs: Pdf[];
}

export function useCourseForms(
  getNextOrder: (moduleId: string) => Promise<number>
) {
  const [newCourse, setNewCourse] = useState<CourseData>({
    title: "",
    description: "",
    module_id: "",
    videos: [],
    pdfs: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  // Add new course
  const addCourse = async () => {
    if (!newCourse.title || !newCourse.module_id) {
      return toast.warning("يجب إدخال العنوان واختيار المقياس!");
    }

    // Validate videos and PDFs
    const hasEmptyVideos = newCourse.videos.some(
      (video) => !video.title || !video.url
    );
    const hasEmptyPdfs = newCourse.pdfs.some((pdf) => !pdf.title || !pdf.url);

    if (hasEmptyVideos || hasEmptyPdfs) {
      return toast.warning("يرجى ملء جميع حقول الفيديوهات وملفات PDF!");
    }

    const nextOrder = await getNextOrder(newCourse.module_id);

    const courseData = {
      id: uuidv4(),
      title: newCourse.title,
      description: newCourse.description || null,
      module_id: newCourse.module_id,
      videos: newCourse.videos,
      pdfs: newCourse.pdfs,
      created_at: new Date().toISOString(),
      order: nextOrder,
    };

    const { error } = await supabase.from("courses").insert([courseData]);

    if (error) {
      toast.error(`Error adding course: ${error.message}`);
    } else {
      const { data: moduleData } = await supabase
        .from("modules")
        .select("course_count")
        .eq("id", newCourse.module_id)
        .single();

      const currentCount = moduleData?.course_count || 0;

      const { error: updateError } = await supabase
        .from("modules")
        .update({ course_count: currentCount + 1 })
        .eq("id", newCourse.module_id);

      if (updateError) {
        toast.error("Error updating module course count:", updateError);
      }

      toast.success("تمت إضافة الدرس بنجاح!");
      setNewCourse({
        title: "",
        description: "",
        module_id: "",
        videos: [],
        pdfs: [],
      });
    }
  };

  // Add new video
  const addVideo = () => {
    setNewCourse({
      ...newCourse,
      videos: [...newCourse.videos, { id: uuidv4(), url: "", title: "" }],
    });
  };

  // Add PDF manually
  const addManualPdf = () => {
    setNewCourse({
      ...newCourse,
      pdfs: [...newCourse.pdfs, { id: uuidv4(), url: "", title: "" }],
    });
  };

  // Remove video
  const removeVideo = (index: number) => {
    const updatedVideos = newCourse.videos.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, videos: updatedVideos });
  };

  // Handle video field changes
  const handleVideoChange = (index: number, field: string, value: string) => {
    const videos = [...newCourse.videos];
    videos[index][field] = value;
    setNewCourse({ ...newCourse, videos });
  };

  // Handle PDF field changes
  const handlePdfChange = (index: number, field: string, value: string) => {
    const pdfs = [...newCourse.pdfs];
    pdfs[index][field] = value;
    setNewCourse({ ...newCourse, pdfs });
  };

  // Handle drag end for videos
  const handleDragEndVideos = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNewCourse((prevState) => {
        const oldIndex = prevState.videos.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = prevState.videos.findIndex(
          (item) => item.id === over.id
        );

        return {
          ...prevState,
          videos: arrayMove(prevState.videos, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  // Handle drag end for PDFs
  const handleDragEndPdfs = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNewCourse((prevState) => {
        const oldIndex = prevState.pdfs.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = prevState.pdfs.findIndex(
          (item) => item.id === over.id
        );

        return {
          ...prevState,
          pdfs: arrayMove(prevState.pdfs, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  return {
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
  };
}

export default useCourseForms;
