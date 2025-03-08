import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import SyncCourseCounts from "./SyncCourseCounts";

export default function AdminAddModuleUnite() {
  // حالات البيانات
  const [years, setYears] = useState([]);
  const [unites, setUnites] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [activeTab, setActiveTab] = useState("unite"); // unite أو module

  // بيانات الوحدة الجديدة
  const [newUnite, setNewUnite] = useState({
    title: "",
    year_id: "",
  });

  // بيانات المقياس الجديد
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    year_id: "",
    unite_id: null,
    course_count: 0, // إضافة حقل course_count بقيمة افتراضية 0
  });

  useEffect(() => {
    fetchYears();
  }, []);

  // جلب السنوات الدراسية
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) {
      console.error("Error fetching years:", error);
    } else {
      setYears(data);
    }
  }

  // جلب الوحدات بناءً على السنة المختارة
  async function fetchUnites(yearId) {
    if (!yearId) return;

    const { data, error } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (error) {
      console.error("Error fetching unites:", error);
    } else {
      setUnites(data);
    }
  }

  // تغيير السنة المختارة
  function handleYearChange(yearId) {
    setSelectedYear(yearId);
    setNewUnite({ ...newUnite, year_id: yearId });
    setNewModule({ ...newModule, year_id: yearId, unite_id: null });
    fetchUnites(yearId);
  }

  // تغيير الوحدة المختارة للمقياس
  function handleUniteChange(uniteId) {
    if (uniteId === "") {
      // إذا اختار "بدون وحدة"
      setNewModule({ ...newModule, unite_id: null });
    } else {
      setNewModule({ ...newModule, unite_id: uniteId });
    }
  }

  // إضافة وحدة جديدة
  async function addUnite() {
    if (!newUnite.title || !newUnite.year_id) {
      return alert("يجب إدخال عنوان الوحدة واختيار السنة!");
    }

    const uniteData = {
      id: uuidv4(),
      title: newUnite.title,
      description: newUnite.description || null,
      year_id: newUnite.year_id,
      // حذف حقل created_at
    };

    const { error } = await supabase.from("unites").insert([uniteData]);

    if (error) {
      console.error("Error adding unite:", error.message);
      alert(`خطأ في إضافة الوحدة: ${error.message}`);
    } else {
      alert("تمت إضافة الوحدة بنجاح!");
      setNewUnite({ ...newUnite, title: "", description: "" });
      // تحديث قائمة الوحدات
      fetchUnites(newUnite.year_id);
    }
  }

  // إضافة مقياس جديد
  async function addModule() {
    if (!newModule.title || !newModule.year_id) {
      return alert("يجب إدخال عنوان المقياس واختيار السنة!");
    }

    const moduleData = {
      id: uuidv4(),
      title: newModule.title,
      description: newModule.description || null,
      year_id: newModule.year_id,
      unite_id: newModule.unite_id,
      course_count: 0, // تعيين قيمة افتراضية لعدد الدروس
      // حذف حقل created_at
    };

    const { error } = await supabase.from("modules").insert([moduleData]);

    if (error) {
      console.error("Error adding module:", error.message);
      alert(`خطأ في إضافة المقياس: ${error.message}`);
    } else {
      alert("تمت إضافة المقياس بنجاح!");
      setNewModule({ ...newModule, title: "", description: "" });
    }
  }

  return (
    <div className="p-6" dir="rtl">
      <SyncCourseCounts />
      <h1 className="text-3xl font-bold mb-6">إدارة الوحدات والمقاييس</h1>

      {/* أزرار التبديل بين الوحدات والمقاييس */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("unite")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "unite" ? "bg-blue-500 text-white" : "text-gray-700"
          }`}
        >
          إضافة وحدة
        </button>
        <button
          onClick={() => setActiveTab("module")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "module" ? "bg-blue-500 text-white" : "text-gray-700"
          }`}
        >
          إضافة مقياس
        </button>
      </div>

      {/* نموذج إضافة وحدة */}
      {activeTab === "unite" && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">إضافة وحدة جديدة</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              السنة الدراسية
            </label>
            <select
              value={newUnite.year_id}
              onChange={(e) =>
                setNewUnite({ ...newUnite, year_id: e.target.value })
              }
              className="p-2 border w-full rounded"
            >
              <option value="">اختر السنة</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              عنوان الوحدة
            </label>
            <input
              type="text"
              placeholder="أدخل عنوان الوحدة"
              value={newUnite.title}
              onChange={(e) =>
                setNewUnite({ ...newUnite, title: e.target.value })
              }
              className="p-2 border w-full rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">وصف الوحدة</label>
            <textarea
              placeholder="وصف الوحدة (اختياري)"
              value={newUnite.description}
              onChange={(e) =>
                setNewUnite({ ...newUnite, description: e.target.value })
              }
              className="p-2 border w-full rounded"
              rows="3"
            />
          </div>

          <button
            onClick={addUnite}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold"
          >
            إضافة الوحدة
          </button>
        </div>
      )}

      {/* نموذج إضافة مقياس */}
      {activeTab === "module" && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">إضافة مقياس جديد</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              السنة الدراسية
            </label>
            <select
              value={newModule.year_id}
              onChange={(e) => handleYearChange(e.target.value)}
              className="p-2 border w-full rounded"
            >
              <option value="">اختر السنة</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.title}
                </option>
              ))}
            </select>
          </div>

          {newModule.year_id && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                الوحدة (اختياري)
              </label>
              <select
                value={newModule.unite_id || ""}
                onChange={(e) => handleUniteChange(e.target.value)}
                className="p-2 border w-full rounded"
              >
                <option value="">بدون وحدة</option>
                {unites.map((unite) => (
                  <option key={unite.id} value={unite.id}>
                    {unite.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              عنوان المقياس
            </label>
            <input
              type="text"
              placeholder="أدخل عنوان المقياس"
              value={newModule.title}
              onChange={(e) =>
                setNewModule({ ...newModule, title: e.target.value })
              }
              className="p-2 border w-full rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              وصف المقياس
            </label>
            <textarea
              placeholder="وصف المقياس (اختياري)"
              value={newModule.description}
              onChange={(e) =>
                setNewModule({ ...newModule, description: e.target.value })
              }
              className="p-2 border w-full rounded"
              rows="3"
            />
          </div>

          <button
            onClick={addModule}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold"
          >
            إضافة المقياس
          </button>
        </div>
      )}
    </div>
  );
}
