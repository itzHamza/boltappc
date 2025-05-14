import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Loader from "../../components/Loader";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
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
import { table } from "console";


// Sortable Item Components
const SortableVideoItem = ({ video, index, onRemove, onUpdate }) => {
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
          {...attributes}
          {...listeners}
          className="mr-2 text-gray-500 cursor-move px-2 py-1 hover:bg-gray-200 rounded"
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
          onChange={(e) => onUpdate(index, "title", e.target.value)}
          className="p-2 border w-full"
        />
        <input
          type="text"
          placeholder="رابط الفيديو"
          value={video.url}
          onChange={(e) => onUpdate(index, "url", e.target.value)}
          className="p-2 border w-full"
        />
      </div>
    </div>
  );
};

const SortablePdfItem = ({ pdf, index, onRemove, onUpdate }) => {
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
          {...attributes}
          {...listeners}
          className="mr-2 text-gray-500 cursor-move px-2 py-1 hover:bg-gray-200 rounded"
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
          onChange={(e) => onUpdate(index, "title", e.target.value)}
          className="p-2 border w-full"
        />
        <input
          type="text"
          placeholder="رابط الملف"
          value={pdf.url}
          onChange={(e) => onUpdate(index, "url", e.target.value)}
          className="p-2 border w-full"
        />
      </div>
    </div>
  );
};

export default function EditCourse() {
  const [years, setYears] = useState([]);
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [unites, setUnites] = useState([]);
  const [selectedUniteId, setSelectedUniteId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // تكوين عميل Cloudflare R2
  const r2Client = new S3Client({
    region: "auto", // Cloudflare R2 يتطلب region = 'auto'
    endpoint: import.meta.env.VITE_CLOUDFLARE_R2_ENDPOINT, // استيراد endpoint من متغيرات البيئة
    credentials: {
      accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY, // استبدل بـ access key الخاص بك
      secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_SECRET_KEY, // استبدل بـ secret key الخاص بك
    },
  });

  // Configure sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchYears();
  }, []);

  // جلب السنوات الدراسية
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) console.error("Error fetching years:", error);
    else setYears(data);
  }

  // جلب الوحدات والمقاييس عند تغيير السنة المختارة
  async function fetchUnitesAndModules(yearId) {
    setSelectedYearId(yearId);
    setSelectedUniteId("");
    setSelectedModuleId("");
    setSelectedCourseId("");
    setCourses([]);
    setCourseData(null);

    // جلب الوحدات الخاصة بالسنة
    const { data: unites, error: uniteError } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (uniteError) console.error("Error fetching unites:", uniteError);
    else setUnites(unites);

    // جلب المقاييس المرتبطة مباشرة بالسنة (بدون وحدة)
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) console.error("Error fetching modules:", moduleError);
    else setModules(modules);
  }

  // جلب المقاييس المرتبطة بالوحدة المختارة
  async function fetchModulesByUnite(uniteId) {
    setSelectedUniteId(uniteId);
    setSelectedModuleId("");
    setSelectedCourseId("");
    setCourses([]);
    setCourseData(null);

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
  }

  // جلب قائمة الدروس حسب المقياس المختار
  async function fetchCourses(moduleId) {
    setSelectedModuleId(moduleId);
    setSelectedCourseId("");
    setCourseData(null);

    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("module_id", moduleId);

    if (error) console.error("Error fetching courses:", error);
    else setCourses(data);
  }

  // جلب بيانات الدرس المختار
  async function fetchCourseDetails(courseId) {
    setSelectedCourseId(courseId);
    setLoading(true);

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      console.error("Error fetching course details:", error);
    } else {
      // Make sure videos and pdfs have string IDs and properly formatted data
      const formattedData = {
        ...data,
        videos: data.videos.map((video) => ({
          ...video,
          id: video.id ? String(video.id) : uuidv4(),
        })),
        pdfs: data.pdfs.map((pdf) => ({
          ...pdf,
          id: pdf.id ? String(pdf.id) : uuidv4(),
        })),
      };
      setCourseData(formattedData);
    }

    setLoading(false);
  }

  // تحديث بيانات الدرس
  async function updateCourse() {
    if (!courseData) return;

    // التحقق من الفيديوهات وملفات PDF
    const hasEmptyVideos = courseData.videos.some(
      (video) => !video.title || !video.url
    );
    const hasEmptyPdfs = courseData.pdfs.some((pdf) => !pdf.title || !pdf.url);

    if (hasEmptyVideos || hasEmptyPdfs) {
      return toast.warning("يرجى ملء جميع حقول الفيديوهات وملفات PDF!");
    }

    const { error } = await supabase
      .from("courses")
      .update({
        title: courseData.title,
        description: courseData.description || null,
        videos: courseData.videos,
        pdfs: courseData.pdfs,
      })
      .eq("id", selectedCourseId);

    if (error) {
      console.error("Error updating course:", error.message);
      toast.error(`Error updating course: ${error.message}`);
    } else {
      toast.success("تم تحديث الدرس بنجاح!");
      fetchCourses(selectedModuleId);
    }
  }

  // حذف الدرس
  async function deleteCourse() {
    if (!selectedCourseId) return;

    if (
      !confirm("هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذه العملية.")
    ) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", selectedCourseId);

    if (error) {
      console.error("Error deleting course:", error.message);
      toast.error(`خطأ في حذف الدرس: ${error.message}`);
    } else {
      toast.success("تم حذف الدرس بنجاح!");
      setCourseData(null);
      setSelectedCourseId("");
      fetchCourses(selectedModuleId);
    }

    setLoading(false);
  }

  // إضافة فيديو جديد
  function addVideo() {
    if (!courseData) return;
    setCourseData({
      ...courseData,
      videos: [...courseData.videos, { id: uuidv4(), url: "", title: "" }],
    });
  }

  // إضافة PDF يدويًا
  function addManualPdf() {
    if (!courseData) return;
    setCourseData({
      ...courseData,
      pdfs: [...courseData.pdfs, { id: uuidv4(), url: "", title: "" }],
    });
  }

  // استخراج اسم الملف من رابط R2
  function extractKeyFromUrl(url) {
    if (!url || !url.includes("r2.dev/")) return null;
    return url.split("r2.dev/")[1];
  }

  // حذف فيديو
  function removeVideo(index) {
    const updatedVideos = courseData.videos.filter((_, i) => i !== index);
    setCourseData({ ...courseData, videos: updatedVideos });
  }

  // حذف PDF مع حذف الملف من R2
  async function removePdf(index) {
    try {
      const pdfToRemove = courseData.pdfs[index];

      // التحقق من وجود رابط للملف
      if (pdfToRemove.url && pdfToRemove.url.includes("r2.dev")) {
        const fileKey = extractKeyFromUrl(pdfToRemove.url);

        if (fileKey) {
          // حذف الملف من Cloudflare R2
          const command = new DeleteObjectCommand({
            Bucket: "tbibcours",
            Key: fileKey,
          });

          await r2Client.send(command);
          toast.success(`✅ تم حذف الملف ${fileKey} من R2 بنجاح`);
        }
      }

      // حذف الملف من القائمة
      const updatedPdfs = courseData.pdfs.filter((_, i) => i !== index);
      setCourseData({ ...courseData, pdfs: updatedPdfs });
    } catch (error) {
      console.error("❌ خطأ أثناء حذف الملف من R2:", error);
      toast.error("❌ حدث خطأ أثناء حذف الملف من Cloudflare R2!");

      // نحذف من القائمة على أي حال
      const updatedPdfs = courseData.pdfs.filter((_, i) => i !== index);
      setCourseData({ ...courseData, pdfs: updatedPdfs });
    }
  }

  // تحميل ملف PDF إلى Cloudflare R2
  async function uploadPdf(file, index) {
    setUploading(true);

    try {
      // ✅ التحقق من أن الملف PDF
      if (file.type !== "application/pdf") {
        toast.warning("❌ يرجى تحميل ملف PDF فقط!");
        setUploading(false);
        return;
      }

      // ✅ التحقق من أن `years` غير فارغ
      if (years.length === 0) {
        toast.warning("❌ يرجى الانتظار حتى يتم تحميل السنوات!");
        setUploading(false);
        return;
      }

      // ✅ تحويل `selectedYearId` إلى نفس نوع `id` في `years`
      const selectedYearIdNumber = Number(selectedYearId); // إذا كانت `id` في `years` أرقام
      const selectedYear = years.find(
        (year) => year.id === selectedYearIdNumber
      );

      if (!selectedYear) {
        toast.warning("❌ حدث خطأ: لم يتم العثور على السنة!");
        console.error(
          "Selected Year ID:",
          selectedYearId,
          typeof selectedYearId
        );
        console.error("Years Array:", years);
        setUploading(false);
        return;
      }

      // ✅ البحث عن الوحدة المختارة (إذا كانت موجودة)
      const selectedUnite = unites.find(
        (unite) => unite.id === selectedUniteId
      );

      // ✅ البحث عن الموديل المختار
      const selectedModule = modules.find(
        (module) => module.id === selectedModuleId
      );
      if (!selectedModule) {
        toast.warning("❌ حدث خطأ: لم يتم العثور على الموديل!");
        setUploading(false);
        return;
      }

      // ✅ تنظيف الأسماء (إزالة الرموز غير المسموح بها)
      const sanitizeName = (name) => {
        return name
          .normalize("NFD") // تحويل الأحرف المركبة إلى الأساسية
          .replace(/[\u0300-\u036f]/g, "") // إزالة التشكيل
          .replace(/\s+/g, "_") // استبدال المسافات بـ "_"
          .replace(/[^a-zA-Z0-9_-]/g, "") // إزالة الرموز غير المسموح بها
          .toLowerCase(); // تحويل إلى أحرف صغيرة
      };

      // ✅ إنشاء المسار بناءً على وجود الوحدة
      const yearFolder = sanitizeName(selectedYear.title);
      const uniteFolder = selectedUnite
        ? sanitizeName(selectedUnite.title)
        : null;
      const moduleFolder = sanitizeName(selectedModule.title);

      // ✅ إنشاء المسار الكامل
      const path = selectedUnite
        ? `${yearFolder}/${uniteFolder}/${moduleFolder}`
        : `${yearFolder}/${moduleFolder}`;

      // ✅ تنظيف اسم الملف
      const sanitizeFileName = (name) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "") // يسمح فقط بالأحرف، الأرقام، `_`، `.` و `-`
          .toLowerCase();
      };

      const cleanFileName = sanitizeFileName(file.name);
      const uniqueFileName = `${path}/${uuidv4()}-${cleanFileName}`;

      // ✅ تحويل ملف PDF إلى ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // ✅ رفع الملف إلى Cloudflare R2 باستخدام `PutObjectCommand`
      const command = new PutObjectCommand({
        Bucket: "tbibcours",
        Key: uniqueFileName, // 🚀 تخزين الملف داخل المسار المناسب
        Body: arrayBuffer,
        ContentType: "application/pdf",
      });

      await r2Client.send(command);

      // ✅ إنشاء الرابط النهائي للملف
      const fileUrl = `${
        import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL
      }/${uniqueFileName}`;

      // ✅ تحديث قائمة ملفات PDF بالرابط الصحيح
      setCourseData((prevState) => {
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

  // Update video field
  const updateVideoField = (index, field, value) => {
    const updatedVideos = [...courseData.videos];
    updatedVideos[index] = { ...updatedVideos[index], [field]: value };
    setCourseData({ ...courseData, videos: updatedVideos });
  };

  // Update PDF field
  const updatePdfField = (index, field, value) => {
    const updatedPdfs = [...courseData.pdfs];
    updatedPdfs[index] = { ...updatedPdfs[index], [field]: value };
    setCourseData({ ...courseData, pdfs: updatedPdfs });
  };

  // Handle drag end for videos
  const handleVideoDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCourseData((currentData) => {
        const oldIndex = currentData.videos.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = currentData.videos.findIndex(
          (item) => item.id === over.id
        );

        return {
          ...currentData,
          videos: arrayMove(currentData.videos, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  // Handle drag end for PDFs
  const handlePdfDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCourseData((currentData) => {
        const oldIndex = currentData.pdfs.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = currentData.pdfs.findIndex(
          (item) => item.id === over.id
        );

        return {
          ...currentData,
          pdfs: arrayMove(currentData.pdfs, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  // Dropzone لرفع ملفات PDF
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0 && courseData) {
        const file = acceptedFiles[0];
        const newPdf = {
          id: uuidv4(), // Always generate a string ID
          title: file.name,
          url: "",
        };

        setCourseData((prevState) => ({
          ...prevState,
          pdfs: [...prevState.pdfs, newPdf],
        }));

        // Use the new length after adding the PDF
        setTimeout(() => {
          uploadPdf(file, courseData.pdfs.length);
        }, 0);
      }
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">تعديل / حذف درس</h1>

      {/* اختيار السنة */}
      <select
        value={selectedYearId}
        onChange={(e) => fetchUnitesAndModules(e.target.value)}
        className="p-2 border w-full mb-4"
      >
        <option value="">اختر السنة</option>
        {years.map((year) => (
          <option key={String(year.id)} value={year.id}>
            {year.title}
          </option>
        ))}
      </select>

      {/* اختيار الوحدة إن وجدت */}
      {unites.length > 0 && (
        <select
          value={selectedUniteId}
          onChange={(e) => fetchModulesByUnite(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">🔍 اختر الوحدة</option>
          {unites.map((unite) => (
            <option key={String(unite.id)} value={unite.id}>
              {unite.title}
            </option>
          ))}
        </select>
      )}

      {/* اختيار الموديل */}
      {(selectedUniteId || modules.length > 0) && (
        <select
          value={selectedModuleId}
          onChange={(e) => fetchCourses(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">🔍 اختر الموديل</option>
          {modules.map((module) => (
            <option key={String(module.id)} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      )}

      {/* اختيار الدرس */}
      {selectedModuleId && (
        <select
          value={selectedCourseId}
          onChange={(e) => fetchCourseDetails(e.target.value)}
          className="p-2 border w-full mb-4"
        >
          <option value="">اختر الدرس</option>
          {courses.map((course) => (
            <option key={String(course.id)} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      )}
      {loading && <Loader />}

      {courseData && (
        <div>
          <input
            type="text"
            placeholder="عنوان الدرس"
            value={courseData.title}
            onChange={(e) =>
              setCourseData({ ...courseData, title: e.target.value })
            }
            className="p-2 border w-full mb-2"
          />

          <textarea
            placeholder="وصف الدرس"
            value={courseData.description || ""}
            onChange={(e) =>
              setCourseData({ ...courseData, description: e.target.value })
            }
            className="p-2 border w-full mb-2"
          />

          {/* Videos Section with dnd-kit */}
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
              onDragEnd={handleVideoDragEnd}
            >
              <SortableContext
                items={courseData.videos.map((video) => video.id)}
                strategy={verticalListSortingStrategy}
              >
                {courseData.videos.map((video, index) => (
                  <SortableVideoItem
                    key={video.id}
                    video={video}
                    index={index}
                    onRemove={removeVideo}
                    onUpdate={updateVideoField}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* PDFs Section with dnd-kit */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mt-4 mb-2">ملفات PDF</h3>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveId(event.active.id)}
              onDragEnd={handlePdfDragEnd}
            >
              <SortableContext
                items={courseData.pdfs.map((pdf) => pdf.id)}
                strategy={verticalListSortingStrategy}
              >
                {courseData.pdfs.map((pdf, index) => (
                  <SortablePdfItem
                    key={pdf.id}
                    pdf={pdf}
                    index={index}
                    onRemove={removePdf}
                    onUpdate={updatePdfField}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <div className="flex flex-col space-y-2 mb-4">
              <div
                {...getRootProps()}
                className="p-4 border-2 mt-5 border-dashed border-gray-300 rounded-lg text-center cursor-pointer"
              >
                <input {...getInputProps()} />
                <p>اسحب وأسقط ملف PDF هنا، أو انقر لتحديد ملف</p>
              </div>
            </div>
            <button
              onClick={addManualPdf}
              className="px-4 py-2 mt-5 w-full bg-green-500 text-white rounded-lg"
            >
              + أضف PDF يدويًا
            </button>
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={updateCourse}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              تحديث الدرس
            </button>

            <button
              onClick={deleteCourse}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              حذف الدرس
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
