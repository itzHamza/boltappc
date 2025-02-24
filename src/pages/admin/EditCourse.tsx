import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function EditCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ جلب جميع الدروس من Supabase
  async function fetchCourses() {
    const { data, error } = await supabase.from("courses").select("id, title");
    if (error) console.error("Error fetching courses:", error);
    else setCourses(data);
  }

  // ✅ جلب بيانات الدرس المحدد
  async function fetchCourseDetails(courseId) {
    setSelectedCourseId(courseId);
    setLoading(true);
    
    const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).single();
    if (error) console.error("Error fetching course details:", error);
    else setCourseData(data);
    
    setLoading(false);
  }

  // ✅ تعديل بيانات الدرس
  async function updateCourse() {
    if (!courseData) return;

    const { error } = await supabase.from("courses").update({
      title: courseData.title,
      description: courseData.description || null,
      videos: courseData.videos,
      pdfs: courseData.pdfs,
    }).eq("id", selectedCourseId);

    if (error) {
      console.error("Error updating course:", error.message);
      alert(`Error updating course: ${error.message}`);
    } else {
      alert("تم تحديث الدرس بنجاح!");
      fetchCourses(); // تحديث القائمة
    }
  }

  // ✅ حذف الدرس نهائيًا
  async function deleteCourse() {
    if (!selectedCourseId) return;
    const confirmDelete = window.confirm("هل أنت متأكد أنك تريد حذف هذا الدرس؟ لا يمكن التراجع!");
    if (!confirmDelete) return;

    const { error } = await supabase.from("courses").delete().eq("id", selectedCourseId);
    if (error) {
      console.error("Error deleting course:", error.message);
      alert(`Error deleting course: ${error.message}`);
    } else {
      alert("تم حذف الدرس بنجاح!");
      setCourseData(null);
      setSelectedCourseId("");
      fetchCourses();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">تعديل / حذف درس</h1>

      {/* اختيار الدرس */}
      <select
        value={selectedCourseId}
        onChange={(e) => fetchCourseDetails(e.target.value)}
        className="p-2 border w-full mb-4"
      >
        <option value="">اختر درسًا للتعديل أو الحذف</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>

      {loading && <p>جاري تحميل البيانات...</p>}

      {courseData && (
        <div>
          {/* تعديل العنوان */}
          <input
            type="text"
            placeholder="عنوان الدرس"
            value={courseData.title}
            onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
            className="p-2 border w-full mb-2"
          />

          {/* تعديل الوصف */}
          <textarea
            placeholder="وصف الدرس (اختياري)"
            value={courseData.description || ""}
            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
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
            </div>
          ))}

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
                onChange={(e) => {
                  const pdfs = [...courseData.pdfs];
                  pdfs[index].url = e.target.value;
                  setCourseData({ ...courseData, pdfs });
                }}
                className="p-2 border flex-1"
              />
            </div>
          ))}

          {/* زر التحديث */}
          <button onClick={updateCourse} className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-4">
            تحديث الدرس
          </button>

          {/* زر الحذف */}
          <button onClick={deleteCourse} className="px-4 py-2 bg-red-600 text-white rounded-lg mt-4 ml-4">
            حذف الدرس
          </button>
        </div>
      )}
    </div>
  );
}
