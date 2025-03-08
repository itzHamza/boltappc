import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "../../components/SortableItem";

export default function EditCourseOrder() {
  const [years, setYears] = useState([]);
  const [unites, setUnites] = useState([]);
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedUniteId, setSelectedUniteId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  useEffect(() => {
    fetchYears();
  }, []);

  // ✅ جلب قائمة السنوات
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) console.error("Error fetching years:", error);
    else setYears(data);
  }

  // ✅ جلب الوحدات والموديلات حسب السنة المختارة
  async function fetchUnitesAndModules(yearId) {
    setSelectedYearId(yearId);
    setSelectedUniteId("");
    setSelectedModuleId("");
    setCourses([]);

    // جلب الوحدات الخاصة بالسنة
    const { data: unites, error: uniteError } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (uniteError) console.error("Error fetching unites:", uniteError);
    else setUnites(unites);

    // جلب الموديلات المرتبطة مباشرة بالسنة (بدون وحدة)
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) console.error("Error fetching modules:", moduleError);
    else setModules(modules);
  }

  // ✅ جلب الموديلات حسب الوحدة المختارة
  async function fetchModulesByUnite(uniteId) {
    setSelectedUniteId(uniteId);
    setSelectedModuleId("");
    setCourses([]);

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
  }

  // ✅ جلب الدروس حسب المقياس المختار
  async function fetchCourses(moduleId) {
    setSelectedModuleId(moduleId);
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, order")
      .eq("module_id", moduleId)
      .order("order", { ascending: true });

    if (error) console.error("Error fetching courses:", error);
    else setCourses(data);
  }

  // ✅ تحديث ترتيب الدروس في قاعدة البيانات
  async function updateCourseOrder(updatedCourses) {
    setCourses(updatedCourses);

    for (let i = 0; i < updatedCourses.length; i++) {
      await supabase
        .from("courses")
        .update({ order: i + 1 })
        .eq("id", updatedCourses[i].id);
    }
  }

  // ✅ التعامل مع السحب والإفلات
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = courses.findIndex((course) => course.id === active.id);
    const newIndex = courses.findIndex((course) => course.id === over.id);
    const updatedCourses = arrayMove(courses, oldIndex, newIndex);

    updateCourseOrder(updatedCourses);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📚 تعديل ترتيب الدروس</h1>

      {/* اختيار السنة */}
      <select
        value={selectedYearId}
        onChange={(e) => fetchUnitesAndModules(e.target.value)}
        className="p-2 border w-full mb-4"
      >
        <option value="">🔍 اختر السنة</option>
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

      {/* ترتيب الدروس بالسحب والإفلات */}
      {selectedModuleId && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={courses}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2 bg-gray-100 p-4 rounded-lg">
              {courses.map((course) => (
                <SortableItem
                  key={course.id}
                  id={course.id}
                  title={course.title}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
