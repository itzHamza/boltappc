import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddCourse() {
  const [years, setYears] = useState([]); // قائمة السنوات
  const [modules, setModules] = useState([]); // قائمة الوحدات
  const [selectedYear, setSelectedYear] = useState(""); // السنة المختارة
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    module_id: "",
    videos: [],
    pdfs: [],
  });
  const [uploading, setUploading] = useState(false); // حالة الرفع

  useEffect(() => {
    fetchYears();
  }, []);

  // ✅ جلب السنوات الدراسية من Supabase
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) console.error("Error fetching years:", error);
    else setYears(data);
  }

  // ✅ جلب الوحدات عند تغيير السنة المختارة
  async function fetchModules(yearId) {
    setSelectedYear(yearId);
    setModules([]);
    setNewCourse({ ...newCourse, module_id: "" });

    if (!yearId) return;

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId);
    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
  }

  // ✅ رفع ملف PDF إلى Supabase Storage
  async function uploadPdf(file) {
    if (!file) return null;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("tbibapp") // اسم الـ Bucket
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading PDF:", error.message);
      alert(`Error uploading PDF: ${error.message}`);
      setUploading(false);
      return null;
    }

    setUploading(false);
    return data.path; // إرجاع مسار الملف
  }

  // ✅ إضافة PDF جديد
  async function addPdf() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/pdf";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const filePath = await uploadPdf(file);
      if (!filePath) return;

      setNewCourse({
        ...newCourse,
        pdfs: [
          ...newCourse.pdfs,
          {
            id: newCourse.pdfs.length + 1,
            url: `${supabase.storage.url}/object/public/pdfs/${filePath}`,
            title: file.name,
          },
        ],
      });
    };
    fileInput.click();
  }

  // ✅ إضافة درس جديد إلى Supabase
  async function addCourse() {
    if (!newCourse.title || !newCourse.module_id) {
      return alert("يجب إدخال العنوان واختيار الوحدة!");
    }

    const courseData = {
      id: newCourse.title.replace(/\s+/g, "-").toLowerCase(), // ✅ توليد ID من العنوان
      title: newCourse.title,
      description: newCourse.description || null,
      module_id: newCourse.module_id,
      videos: newCourse.videos,
      pdfs: newCourse.pdfs,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("courses").insert([courseData]);

    if (error) {
      console.error("Error adding course:", error.message);
      alert(`Error adding course: ${error.message}`);
    } else {
      alert("تمت إضافة الدرس بنجاح!");
      setNewCourse({
        title: "",
        description: "",
        module_id: "",
        videos: [],
        pdfs: [],
      });
    }
  }

  // ✅ إضافة فيديو جديد
  function addVideo() {
    setNewCourse({
      ...newCourse,
      videos: [
        ...newCourse.videos,
        { id: newCourse.videos.length + 1, url: "", title: "" },
      ],
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إضافة درس جديد</h1>

      {/* اختيار السنة */}
      <select
        value={selectedYear}
        onChange={(e) => fetchModules(e.target.value)}
        className="p-2 border w-full mb-2"
      >
        <option value="">اختر السنة</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.title}
          </option>
        ))}
      </select>

      {/* اختيار الوحدة */}
      <select
        value={newCourse.module_id}
        onChange={(e) =>
          setNewCourse({ ...newCourse, module_id: e.target.value })
        }
        className="p-2 border w-full mb-2"
        disabled={!selectedYear}
      >
        <option value="">اختر الوحدة</option>
        {modules.map((module) => (
          <option key={module.id} value={module.id}>
            {module.title}
          </option>
        ))}
      </select>

      {/* إدخال عنوان الدرس */}
      <input
        type="text"
        placeholder="عنوان الدرس"
        value={newCourse.title}
        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
        className="p-2 border w-full mb-2"
      />

      {/* إدخال الوصف */}
      <textarea
        placeholder="وصف الدرس (اختياري)"
        value={newCourse.description}
        onChange={(e) =>
          setNewCourse({ ...newCourse, description: e.target.value })
        }
        className="p-2 border w-full mb-2"
      />

      {/* إضافة فيديوهات */}
      <h3 className="text-xl font-semibold mt-4 mb-2">الفيديوهات</h3>
      {newCourse.videos.map((video, index) => (
        <div key={index} className="flex space-x-2 mb-2">
          <input
            type="text"
            placeholder="عنوان الفيديو"
            value={video.title}
            onChange={(e) => {
              const videos = [...newCourse.videos];
              videos[index].title = e.target.value;
              setNewCourse({ ...newCourse, videos });
            }}
            className="p-2 border flex-1"
          />
          <input
            type="text"
            placeholder="رابط الفيديو"
            value={video.url}
            onChange={(e) => {
              const videos = [...newCourse.videos];
              videos[index].url = e.target.value;
              setNewCourse({ ...newCourse, videos });
            }}
            className="p-2 border flex-1"
          />
        </div>
      ))}
      <button
        onClick={addVideo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg m-2"
      >
        + أضف فيديو
      </button>

      {/* إضافة ملفات PDF */}
      <h3 className="text-xl font-semibold mt-4 mb-2">ملفات PDF</h3>
      {newCourse.pdfs.map((pdf, index) => (
        <div key={index} className="flex space-x-2 mb-2">
          <input
            type="text"
            placeholder="عنوان الملف"
            value={pdf.title}
            onChange={(e) => {
              const pdfs = [...newCourse.pdfs];
              pdfs[index].title = e.target.value;
              setNewCourse({ ...newCourse, pdfs });
            }}
            className="p-2 border flex-1"
          />
          <input
            type="text"
            placeholder="رابط الملف"
            value={pdf.url}
            disabled
            className="p-2 border flex-1 bg-gray-100"
          />
        </div>
      ))}
      <button
        onClick={addPdf}
        disabled={uploading}
        className="px-4 py-2 bg-green-500 text-white rounded-lg m-2"
      >
        {uploading ? "جاري الرفع..." : "+ أضف PDF"}
      </button>

      {/* زر الإضافة */}
      <button
        onClick={addCourse}
        className="px-4 py-2 bg-green-600 text-white rounded-lg mt-4"
      >
        إضافة الدرس
      </button>
    </div>
  );
}
