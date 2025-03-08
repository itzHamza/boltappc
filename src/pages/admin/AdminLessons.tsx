import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

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
    setSelectedYear(yearId);
    setSelectedUniteId("");
    setUnites([]);
    setModules([]);
    setNewCourse({ ...newCourse, module_id: "" });

    if (!yearId) return;

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
    setModules([]);
    setNewCourse({ ...newCourse, module_id: "" });

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
  }

  // حساب الترتيب للدرس الجديد
  async function getNextOrder(moduleId) {
    const { data, error } = await supabase
      .from("courses")
      .select("order")
      .eq("module_id", moduleId)
      .order("order", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error getting course count:", error);
      return 0;
    }

    if (data && data.length > 0 && data[0].order !== null) {
      return data[0].order + 1;
    }

    return 0;
  }

  // إضافة درس جديد
  async function addCourse() {
    if (!newCourse.title || !newCourse.module_id) {
      return alert("يجب إدخال العنوان واختيار المقياس!");
    }

    // التحقق من الفيديوهات وملفات PDF
    const hasEmptyVideos = newCourse.videos.some(
      (video) => !video.title || !video.url
    );
    const hasEmptyPdfs = newCourse.pdfs.some((pdf) => !pdf.title || !pdf.url);

    if (hasEmptyVideos || hasEmptyPdfs) {
      return alert("يرجى ملء جميع حقول الفيديوهات وملفات PDF!");
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
      console.error("Error adding course:", error.message);
      alert(`Error adding course: ${error.message}`);
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
        console.error("Error updating module course count:", updateError);
      }

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

  // إضافة فيديو جديد
  function addVideo() {
    setNewCourse({
      ...newCourse,
      videos: [
        ...newCourse.videos,
        { id: newCourse.videos.length + 1, url: "", title: "" },
      ],
    });
  }

  // إضافة PDF جديد
  function addPdf() {
    setNewCourse({
      ...newCourse,
      pdfs: [
        ...newCourse.pdfs,
        { id: newCourse.pdfs.length + 1, url: "", title: "" },
      ],
    });
  }

  // حذف فيديو
  function removeVideo(index) {
    const updatedVideos = newCourse.videos.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, videos: updatedVideos });
  }

  // حذف PDF
  function removePdf(index) {
    const updatedPdfs = newCourse.pdfs.filter((_, i) => i !== index);
    setNewCourse({ ...newCourse, pdfs: updatedPdfs });
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إضافة درس جديد</h1>

      {/* اختيار السنة */}
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

      {/* اختيار الوحدة إن وجدت */}
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

      {/* اختيار المقياس */}
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
            onChange={(e) => {
              const pdfs = [...newCourse.pdfs];
              pdfs[index].url = e.target.value;
              setNewCourse({ ...newCourse, pdfs });
            }}
            className="p-2 border flex-1"
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
