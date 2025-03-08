import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Loader from "../../components/Loader";
import { useDropzone } from "react-dropzone"; // استيراد react-dropzone
import { v4 as uuidv4 } from "uuid"; // استيراد uuid

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
  const [uploading, setUploading] = useState(false); // حالة التحميل

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

    if (error) console.error("Error fetching course details:", error);
    else setCourseData(data);

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
      return alert("يرجى ملء جميع حقول الفيديوهات وملفات PDF!");
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
      alert(`Error updating course: ${error.message}`);
    } else {
      alert("تم تحديث الدرس بنجاح!");
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
      alert(`خطأ في حذف الدرس: ${error.message}`);
    } else {
      alert("تم حذف الدرس بنجاح!");
      setCourseData(null);
      setSelectedCourseId("");
      fetchCourses(selectedModuleId);
    }

    setLoading(false);
  }

  // إضافة فيديو جديد
  function addVideo() {
    setCourseData({
      ...courseData,
      videos: [
        ...courseData.videos,
        { id: courseData.videos.length + 1, url: "", title: "" },
      ],
    });
  }

  // إضافة PDF جديد
  function addPdf() {
    setCourseData({
      ...courseData,
      pdfs: [
        ...courseData.pdfs,
        { id: courseData.pdfs.length + 1, url: "", title: "" },
      ],
    });
  }

  // حذف فيديو
  function removeVideo(index) {
    const updatedVideos = courseData.videos.filter((_, i) => i !== index);
    setCourseData({ ...courseData, videos: updatedVideos });
  }

  // حذف PDF
  function removePdf(index) {
    const updatedPdfs = courseData.pdfs.filter((_, i) => i !== index);
    setCourseData({ ...courseData, pdfs: updatedPdfs });
  }

  // تحميل ملف PDF إلى Supabase Storage
  async function uploadPdf(file, index) {
    setUploading(true);

    // 🔹 جلب اسم المقياس (module name) من Supabase
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("title")
      .eq("id", courseData.module_id)
      .single();

    if (moduleError) {
      console.error("Error fetching module name:", moduleError);
      alert("حدث خطأ أثناء جلب اسم المقياس!");
      setUploading(false);
      return;
    }

    const moduleName =
      moduleData?.title?.replace(/\s+/g, "_") || "Unknown_Module";

    // 🔹 إنشاء المسار الجديد
    const filePath = `${moduleName}/${uuidv4()}-${file.name}`;

    // 🔹 رفع الملف إلى Supabase
    const { data, error } = await supabase.storage
      .from("tbibapp")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      alert("حدث خطأ أثناء تحميل الملف!");
      setUploading(false);
      return;
    }

    // 🔹 جلب الرابط العام للملف
    const { data: urlData } = await supabase.storage
      .from("tbibapp")
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      console.error("Error getting public URL for:", filePath);
      alert("حدث خطأ أثناء جلب رابط الملف!");
      setUploading(false);
      return;
    }

    const publicUrl = urlData.publicUrl; // ✅ استخراج الرابط الصحيح

    // 🔹 تحديث قائمة ملفات PDF بالرابط الصحيح
    setCourseData((prevState) => {
      const updatedPdfs = [...prevState.pdfs];

      if (index >= updatedPdfs.length) {
        console.error("Invalid index:", index);
        alert("حدث خطأ أثناء تحديث الملف!");
        setUploading(false);
        return prevState;
      }

      updatedPdfs[index] = { ...updatedPdfs[index], url: publicUrl };

      return { ...prevState, pdfs: updatedPdfs };
    });

    setUploading(false);
  }

  // Dropzone لرفع ملفات PDF
  const { getRootProps, getInputProps } = useDropzone({
    accept: "application/pdf", // قبول ملفات PDF فقط
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const newPdf = {
          id: courseData.pdfs.length + 1,
          title: file.name,
          url: "",
        };
        setCourseData((prevState) => ({
          ...prevState,
          pdfs: [...prevState.pdfs, newPdf],
        }));
        uploadPdf(file, courseData.pdfs.length); // تحميل الملف
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
          <option key={year.id} value={year.id}>
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
            <option key={unite.id} value={unite.id}>
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
            <option key={module.id} value={module.id}>
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
            <option key={course.id} value={course.id}>
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

          {/* تعديل الفيديوهات */}
          <h3 className="text-xl font-semibold mt-4 mb-2">الفيديوهات</h3>
          {courseData.videos.map((video, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="عنوان الفيديو"
                value={video.title}
                onChange={(e) => {
                  const videos = [...courseData.videos];
                  videos[index].title = e.target.value;
                  setCourseData({ ...courseData, videos });
                }}
                className="p-2 border flex-1"
              />
              <input
                type="text"
                placeholder="رابط الفيديو"
                value={video.url}
                onChange={(e) => {
                  const videos = [...courseData.videos];
                  videos[index].url = e.target.value;
                  setCourseData({ ...courseData, videos });
                }}
                className="p-2 border flex-1"
              />
              <button
                onClick={() => removeVideo(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            onClick={addVideo}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg m-2"
          >
            + أضف فيديو
          </button>

          {/* تعديل ملفات PDF */}
          <h3 className="text-xl font-semibold mt-4 mb-2">ملفات PDF</h3>
          {courseData.pdfs.map((pdf, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="عنوان الملف"
                value={pdf.title}
                onChange={(e) => {
                  const pdfs = [...courseData.pdfs];
                  pdfs[index].title = e.target.value;
                  setCourseData({ ...courseData, pdfs });
                }}
                className="p-2 border flex-1"
              />
              <input
                type="text"
                placeholder="رابط الملف"
                value={pdf.url}
                readOnly
                className="p-2 border flex-1 bg-gray-100"
              />
              <button
                onClick={() => removePdf(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            onClick={addPdf}
            className="px-4 py-2 bg-green-500 text-white rounded-lg m-2"
          >
            + أضف PDF
          </button>

          {/* Dropzone لرفع ملفات PDF */}
          <div
            {...getRootProps()}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <p>اسحب وأسقط ملف PDF هنا، أو انقر لتحديد ملف</p>
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
