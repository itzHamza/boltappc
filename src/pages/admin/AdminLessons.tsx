import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";

// SortableItem component for Videos
function SortableVideoItem({ video, index, onRemove, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: video.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm mb-2"
    >
      <div className="flex items-center mb-2">
        <div
          className="mr-2 text-gray-500 cursor-move"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </div>
        <div className="font-medium">فيديو {index + 1}</div>
        <button
          onClick={() => onRemove(index)}
          className="ml-auto px-3 py-1 bg-red-500 text-white rounded-lg"
        >
          حذف
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="عنوان الفيديو"
          value={video.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          className="p-2 border w-full"
        />
        <input
          type="text"
          placeholder="رابط الفيديو"
          value={video.url}
          onChange={(e) => onChange(index, "url", e.target.value)}
          className="p-2 border w-full"
        />
      </div>
    </div>
  );
}

// SortableItem component for PDFs
function SortablePdfItem({ pdf, index, onRemove, onChange }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: pdf.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm mb-2"
    >
      <div className="flex items-center mb-2">
        <div
          className="mr-2 text-gray-500 cursor-move"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </div>
        <div className="font-medium">PDF {index + 1}</div>
        <button
          onClick={() => onRemove(index)}
          className="ml-auto px-3 py-1 bg-red-500 text-white rounded-lg"
        >
          حذف
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="عنوان الملف"
          value={pdf.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          className="p-2 border w-full"
        />
        <input
          type="text"
          placeholder="رابط الملف"
          value={pdf.url}
          onChange={(e) => onChange(index, "url", e.target.value)}
          className="p-2 border w-full"
        />
      </div>
    </div>
  );
}

export default function AddCourse() {
  const [years, setYears] = useState([]);
  const [unites, setUnites] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedUniteId, setSelectedUniteId] = useState("");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    module_id: "",
    videos: [],
    pdfs: [],
  });
  const [uploading, setUploading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cloudflare R2 client configuration
  const r2Client = new S3Client({
    region: "auto",
    endpoint:
      "https://06893eb6afdfa9c91367be3c95e2c07b.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: "4b81a819904dda6a2cf386c580557b9b",
      secretAccessKey:
        "2a2bafce1722b2bdb01f0ee763b528d88ffd4c50ae3eeae37cbd25194d484fa1",
    },
  });

  useEffect(() => {
    fetchYears();
  }, []);

  // Fetch school years
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) {
      toast.error("Error fetching years:", error);
    } else {
      console.log("السنوات التي تم جلبها:", data);
      setYears(data);
    }
  }

  // Fetch units and modules when selected year changes
  async function fetchUnitesAndModules(yearId) {
    setSelectedYear(yearId);
    setSelectedUniteId("");
    setUnites([]);
    setModules([]);
    setNewCourse({ ...newCourse, module_id: "" });

    if (!yearId) return;

    // Fetch units for the selected year
    const { data: unites, error: uniteError } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (uniteError) toast.error("Error fetching unites:", uniteError);
    else setUnites(unites);

    // Fetch modules directly linked to the year (without a unit)
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) toast.error("Error fetching modules:", moduleError);
    else setModules(modules);
  }

  // Fetch modules linked to the selected unit
  async function fetchModulesByUnite(uniteId) {
    setSelectedUniteId(uniteId);
    setModules([]);
    setNewCourse({ ...newCourse, module_id: "" });

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) toast.error("Error fetching modules:", error);
    else setModules(data);
  }

  // Calculate order for new lesson
  async function getNextOrder(moduleId) {
    const { data, error } = await supabase
      .from("courses")
      .select("order")
      .eq("module_id", moduleId)
      .order("order", { ascending: false })
      .limit(1);

    if (error) {
      toast.error("Error getting course count:", error);
      return 0;
    }

    if (data && data.length > 0 && data[0].order !== null) {
      return data[0].order + 1;
    }

    return 0;
  }

  // Add new course
  async function addCourse() {
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
  }

  // Add new video
  function addVideo() {
    setNewCourse({
      ...newCourse,
      videos: [...newCourse.videos, { id: uuidv4(), url: "", title: "" }],
    });
  }

  // Add PDF manually
  function addManualPdf() {
    setNewCourse({
      ...newCourse,
      pdfs: [...newCourse.pdfs, { id: uuidv4(), url: "", title: "" }],
    });
  }

  // Extract filename from R2 URL
  function extractKeyFromUrl(url) {
    if (!url || !url.includes("r2.dev/")) return null;
    return url.split("r2.dev/")[1];
  }

  // Remove video
  function removeVideo(index) {
    const updatedVideos = newCourse.videos.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, videos: updatedVideos });
  }

  // Handle video field changes
  function handleVideoChange(index, field, value) {
    const videos = [...newCourse.videos];
    videos[index][field] = value;
    setNewCourse({ ...newCourse, videos });
  }

  // Handle PDF field changes
  function handlePdfChange(index, field, value) {
    const pdfs = [...newCourse.pdfs];
    pdfs[index][field] = value;
    setNewCourse({ ...newCourse, pdfs });
  }

  // Remove PDF and delete file from R2
  async function removePdf(index) {
    try {
      const pdfToRemove = newCourse.pdfs[index];

      // Check if file URL exists
      if (pdfToRemove.url && pdfToRemove.url.includes("r2.dev")) {
        const fileKey = extractKeyFromUrl(pdfToRemove.url);

        if (fileKey) {
          // Delete file from Cloudflare R2
          const command = new DeleteObjectCommand({
            Bucket: "tbibcours",
            Key: fileKey,
          });

          await r2Client.send(command);
          toast.success(`✅ تم حذف الملف ${fileKey} من R2 بنجاح`);
        }
      }

      // Remove file from the list
      const updatedPdfs = newCourse.pdfs.filter((_, i) => i !== index);
      setNewCourse({ ...newCourse, pdfs: updatedPdfs });
    } catch (error) {
      console.error("❌ خطأ أثناء حذف الملف من R2:", error);
      toast.error("❌ حدث خطأ أثناء حذف الملف من Cloudflare R2!");

      // Remove from list anyway
      const updatedPdfs = newCourse.pdfs.filter((_, i) => i !== index);
      setNewCourse({ ...newCourse, pdfs: updatedPdfs });
    }
  }

  // Upload PDF to Cloudflare R2
  async function uploadPdf(file, index) {
    setUploading(true);

    try {
      // ✅ Verify file is PDF
      if (file.type !== "application/pdf") {
        toast.warning("❌ يرجى تحميل ملف PDF فقط!");
        setUploading(false);
        return;
      }

      // ✅ Verify selectedYear is set correctly
      if (!selectedYear) {
        toast.warning("❌ يرجى اختيار سنة أولاً!");
        setUploading(false);
        return;
      }

      // ✅ Convert selectedYear to match the year id type
      const selectedYearId =
        typeof years[0].id === "number" ? Number(selectedYear) : selectedYear;

      // ✅ Find selected year
      const selectedYearData = years.find((year) => year.id === selectedYearId);
      if (!selectedYearData) {
        toast.error("❌ حدث خطأ: لم يتم العثور على السنة!");
        console.error("السنة المختارة (selectedYear):", selectedYear);
        console.error("قائمة السنوات (years):", years);
        setUploading(false);
        return;
      }

      // ✅ Find selected unit (if exists)
      const selectedUniteData = unites.find(
        (unite) => unite.id === selectedUniteId
      );

      // ✅ Find selected module
      const selectedModuleData = modules.find(
        (module) => module.id === newCourse.module_id
      );
      if (!selectedModuleData) {
        toast.error("❌ حدث خطأ: لم يتم العثور على الموديل!");
        setUploading(false);
        return;
      }

      // ✅ Sanitize names (remove forbidden characters)
      const sanitizeName = (name) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .toLowerCase();
      };

      // ✅ Create path based on unit existence
      const yearFolder = sanitizeName(selectedYearData.title);
      const uniteFolder = selectedUniteData
        ? sanitizeName(selectedUniteData.title)
        : null;
      const moduleFolder = sanitizeName(selectedModuleData.title);

      // ✅ Create full path
      const path = selectedUniteData
        ? `${yearFolder}/${uniteFolder}/${moduleFolder}`
        : `${yearFolder}/${moduleFolder}`;

      // ✅ Sanitize filename
      const sanitizeFileName = (name) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "")
          .toLowerCase();
      };

      const cleanFileName = sanitizeFileName(file.name);
      const uniqueFileName = `${path}/${uuidv4()}-${cleanFileName}`;

      // ✅ Convert PDF file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // ✅ Upload file to Cloudflare R2 using PutObjectCommand
      const command = new PutObjectCommand({
        Bucket: "tbibcours",
        Key: uniqueFileName,
        Body: arrayBuffer,
        ContentType: "application/pdf",
      });

      await r2Client.send(command);

      // ✅ Create final file URL
      const fileUrl = `https://pub-26d82a51e954464d8c48f5d1307898a3.r2.dev/${uniqueFileName}`;

      // ✅ Update PDF list with correct URL
      setNewCourse((prevState) => {
        const updatedPdfs = [...prevState.pdfs];
        updatedPdfs[index] = { ...updatedPdfs[index], url: fileUrl };
        return { ...prevState, pdfs: updatedPdfs };
      });

      toast.success("✅ تم تحميل الملف بنجاح!");
    } catch (error) {
      console.error("❌ خطأ أثناء رفع الملف إلى R2:", error);
      toast.error("❌ حدث خطأ أثناء رفع الملف إلى Cloudflare R2!");
    } finally {
      setUploading(false);
    }
  }

  // Handle drag end for videos
  function handleDragEndVideos(event) {
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
  }

  // Handle drag end for PDFs
  function handleDragEndPdfs(event) {
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
  }

  // Dropzone configuration for PDF upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const newPdf = {
          id: uuidv4(),
          title: file.name,
          url: "",
        };

        setNewCourse((prevState) => {
          const updatedPdfs = [...prevState.pdfs, newPdf];
          return { ...prevState, pdfs: updatedPdfs };
        });

        // Upload file to Cloudflare R2
        // We need to wait a tick for React to update state before accessing the new index
        setTimeout(() => {
          uploadPdf(file, newCourse.pdfs.length);
        }, 0);
      }
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إضافة درس جديد</h1>

      {/* Year selection */}
      <select
        value={selectedYear}
        onChange={(e) => fetchUnitesAndModules(e.target.value)}
        className="p-2 border w-full mb-2"
      >
        <option value="">اختر السنة</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.title}
          </option>
        ))}
      </select>

      {/* Unit selection (if available) */}
      {unites.length > 0 && (
        <select
          value={selectedUniteId}
          onChange={(e) => fetchModulesByUnite(e.target.value)}
          className="p-2 border w-full mb-2"
        >
          <option value="">اختر الوحدة</option>
          {unites.map((unite) => (
            <option key={unite.id} value={unite.id}>
              {unite.title}
            </option>
          ))}
        </select>
      )}

      {/* Module selection */}
      {(selectedUniteId || modules.length > 0) && (
        <select
          value={newCourse.module_id}
          onChange={(e) =>
            setNewCourse({ ...newCourse, module_id: e.target.value })
          }
          className="p-2 border w-full mb-2"
        >
          <option value="">اختر المقياس</option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      )}

      {/* Course title input */}
      <input
        type="text"
        placeholder="عنوان الدرس"
        value={newCourse.title}
        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
        className="p-2 border w-full mb-2"
      />

      {/* Description input */}
      <textarea
        placeholder="وصف الدرس (اختياري)"
        value={newCourse.description}
        onChange={(e) =>
          setNewCourse({ ...newCourse, description: e.target.value })
        }
        className="p-2 border w-full mb-2"
      />

      {/* Videos section with drag and drop */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mt-4 mb-2">الفيديوهات</h3>
        <button
          onClick={addVideo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
        >
          + أضف فيديو
        </button>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(event.active.id)}
          onDragEnd={handleDragEndVideos}
        >
          <SortableContext
            items={newCourse.videos.map((video) => video.id)}
            strategy={verticalListSortingStrategy}
          >
            {newCourse.videos.map((video, index) => (
              <SortableVideoItem
                key={video.id}
                video={video}
                index={index}
                onRemove={removeVideo}
                onChange={handleVideoChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* PDFs section with drag and drop */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mt-4 mb-2">ملفات PDF</h3>
        <div className="flex flex-col space-y-2 mb-4">
          <div
            {...getRootProps()}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <p>اسحب وأسقط ملف PDF هنا، أو انقر لتحديد ملف</p>
          </div>

          <button
            onClick={addManualPdf}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            + أضف PDF يدويًا
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(event.active.id)}
          onDragEnd={handleDragEndPdfs}
        >
          <SortableContext
            items={newCourse.pdfs.map((pdf) => pdf.id)}
            strategy={verticalListSortingStrategy}
          >
            {newCourse.pdfs.map((pdf, index) => (
              <SortablePdfItem
                key={pdf.id}
                pdf={pdf}
                index={index}
                onRemove={removePdf}
                onChange={handlePdfChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

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
