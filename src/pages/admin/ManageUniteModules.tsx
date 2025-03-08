import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Loader from "../../components/Loader";

export default function ManageUniteModules() {
  const [years, setYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [unites, setUnites] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedUniteId, setSelectedUniteId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [uniteData, setUniteData] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unites"); // "unites" or "modules"

  useEffect(() => {
    fetchYears();
  }, []);

  // جلب قائمة السنوات
  async function fetchYears() {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) console.error("Error fetching years:", error);
    else setYears(data);
  }

  // جلب قائمة الوحدات والموديلات حسب السنة المختارة
  async function fetchUnitesAndModules(yearId) {
    setSelectedYearId(yearId);
    setSelectedUniteId("");
    setSelectedModuleId("");
    setUniteData(null);
    setModuleData(null);
    setLoading(true);

    // جلب الوحدات الخاصة بالسنة
    const { data: unitesData, error: uniteError } = await supabase
      .from("unites")
      .select("id, title, description")
      .eq("year_id", yearId);

    if (uniteError) console.error("Error fetching unites:", uniteError);
    else setUnites(unitesData || []);

    // جلب الموديلات المرتبطة مباشرة بالسنة (بدون وحدة)
    const { data: modulesData, error: moduleError } = await supabase
      .from("modules")
      .select("id, title, description")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) console.error("Error fetching modules:", moduleError);
    else setModules(modulesData || []);

    setLoading(false);
  }

  // جلب الموديلات حسب الوحدة المختارة
  async function fetchModulesByUnite(uniteId) {
    setSelectedUniteId(uniteId);
    setSelectedModuleId("");
    setModuleData(null);
    setLoading(true);

    // جلب تفاصيل الوحدة المختارة
    const { data: uniteDetails, error: uniteError } = await supabase
      .from("unites")
      .select("*")
      .eq("id", uniteId)
      .single();

    if (uniteError) console.error("Error fetching unite details:", uniteError);
    else setUniteData(uniteDetails);

    // جلب الموديلات الخاصة بالوحدة
    const { data, error } = await supabase
      .from("modules")
      .select("id, title, description")
      .eq("unite_id", uniteId);

    if (error) console.error("Error fetching modules:", error);
    else setModules(data || []);

    setLoading(false);
  }

  // جلب تفاصيل الموديل المختار
  async function fetchModuleDetails(moduleId) {
    setSelectedModuleId(moduleId);
    setLoading(true);

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .single();

    if (error) console.error("Error fetching module details:", error);
    else setModuleData(data);

    setLoading(false);
  }

  // تحديث بيانات الوحدة
  async function updateUnite() {
    if (!uniteData) return;
    setLoading(true);

    const { error } = await supabase
      .from("unites")
      .update({
        title: uniteData.title,
        description: uniteData.description || null,
      })
      .eq("id", selectedUniteId);

    if (error) {
      console.error("Error updating unite:", error.message);
      alert(`خطأ في تحديث الوحدة: ${error.message}`);
    } else {
      alert("تم تحديث الوحدة بنجاح!");
      fetchUnitesAndModules(selectedYearId);
    }

    setLoading(false);
  }

  // تحديث بيانات الموديل
  async function updateModule() {
    if (!moduleData) return;
    setLoading(true);

    const { error } = await supabase
      .from("modules")
      .update({
        title: moduleData.title,
        description: moduleData.description || null,
      })
      .eq("id", selectedModuleId);

    if (error) {
      console.error("Error updating module:", error.message);
      alert(`خطأ في تحديث الموديل: ${error.message}`);
    } else {
      alert("تم تحديث الموديل بنجاح!");
      if (selectedUniteId) {
        fetchModulesByUnite(selectedUniteId);
      } else {
        fetchUnitesAndModules(selectedYearId);
      }
    }

    setLoading(false);
  }

  // حذف الوحدة
  async function deleteUnite() {
    if (!selectedUniteId) return;

    // تأكيد الحذف مع تحذير
    if (
      !confirm(
        "تحذير: حذف الوحدة سيؤدي إلى حذف جميع الموديلات والدروس المرتبطة بها. هل أنت متأكد؟"
      )
    ) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("unites")
      .delete()
      .eq("id", selectedUniteId);

    if (error) {
      console.error("Error deleting unite:", error.message);
      alert(`خطأ في حذف الوحدة: ${error.message}`);
    } else {
      alert("تم حذف الوحدة بنجاح!");
      setUniteData(null);
      setSelectedUniteId("");
      setModules([]);
      fetchUnitesAndModules(selectedYearId);
    }

    setLoading(false);
  }

  // حذف الموديل
  async function deleteModule() {
    if (!selectedModuleId) return;

    // تأكيد الحذف مع تحذير
    if (
      !confirm(
        "تحذير: حذف الموديل سيؤدي إلى حذف جميع الدروس المرتبطة به. هل أنت متأكد؟"
      )
    ) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("modules")
      .delete()
      .eq("id", selectedModuleId);

    if (error) {
      console.error("Error deleting module:", error.message);
      alert(`خطأ في حذف الموديل: ${error.message}`);
    } else {
      alert("تم حذف الموديل بنجاح!");
      setModuleData(null);
      setSelectedModuleId("");
      if (selectedUniteId) {
        fetchModulesByUnite(selectedUniteId);
      } else {
        fetchUnitesAndModules(selectedYearId);
      }
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الوحدات والموديلات</h1>

      {/* أزرار التبديل بين الوحدات والموديلات */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("unites")}
          className={`px-4 py-2 ${
            activeTab === "unites"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded-l-lg`}
        >
          الوحدات
        </button>
        <button
          onClick={() => setActiveTab("modules")}
          className={`px-4 py-2 ${
            activeTab === "modules"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded-r-lg`}
        >
          الموديلات
        </button>
      </div>

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

      {loading && <Loader />}

      {selectedYearId && (
        <div>
          {/* قسم إدارة الوحدات */}
          {activeTab === "unites" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">إدارة الوحدات</h2>
              {unites.length > 0 ? (
                <div>
                  <select
                    value={selectedUniteId}
                    onChange={(e) => fetchModulesByUnite(e.target.value)}
                    className="p-2 border w-full mb-4"
                  >
                    <option value="">اختر الوحدة</option>
                    {unites.map((unite) => (
                      <option key={unite.id} value={unite.id}>
                        {unite.title}
                      </option>
                    ))}
                  </select>

                  {uniteData && (
                    <div className="border p-4 rounded-lg shadow-sm">
                      <input
                        type="text"
                        placeholder="عنوان الوحدة"
                        value={uniteData.title}
                        onChange={(e) =>
                          setUniteData({
                            ...uniteData,
                            title: e.target.value,
                          })
                        }
                        className="p-2 border w-full mb-2"
                      />

                      <textarea
                        placeholder="وصف الوحدة"
                        value={uniteData.description || ""}
                        onChange={(e) =>
                          setUniteData({
                            ...uniteData,
                            description: e.target.value,
                          })
                        }
                        className="p-2 border w-full mb-4"
                        rows={4}
                      />

                      <div className="flex space-x-4">
                        <button
                          onClick={updateUnite}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          تحديث الوحدة
                        </button>
                        <button
                          onClick={deleteUnite}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                          حذف الوحدة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">لا توجد وحدات لهذه السنة</p>
              )}
            </div>
          )}

          {/* قسم إدارة الموديلات */}
          {activeTab === "modules" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">إدارة الموديلات</h2>

              {/* اختيار الوحدة (اختياري) */}
              {unites.length > 0 && (
                <select
                  value={selectedUniteId}
                  onChange={(e) => fetchModulesByUnite(e.target.value)}
                  className="p-2 border w-full mb-4"
                >
                  <option value="">الموديلات خارج الوحدات</option>
                  {unites.map((unite) => (
                    <option key={unite.id} value={unite.id}>
                      {unite.title}
                    </option>
                  ))}
                </select>
              )}

              {modules.length > 0 ? (
                <div>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => fetchModuleDetails(e.target.value)}
                    className="p-2 border w-full mb-4"
                  >
                    <option value="">اختر الموديل</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>

                  {moduleData && (
                    <div className="border p-4 rounded-lg shadow-sm">
                      <input
                        type="text"
                        placeholder="عنوان الموديل"
                        value={moduleData.title}
                        onChange={(e) =>
                          setModuleData({
                            ...moduleData,
                            title: e.target.value,
                          })
                        }
                        className="p-2 border w-full mb-2"
                      />

                      <textarea
                        placeholder="وصف الموديل"
                        value={moduleData.description || ""}
                        onChange={(e) =>
                          setModuleData({
                            ...moduleData,
                            description: e.target.value,
                          })
                        }
                        className="p-2 border w-full mb-4"
                        rows={4}
                      />

                      <div className="flex space-x-4">
                        <button
                          onClick={updateModule}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          تحديث الموديل
                        </button>
                        <button
                          onClick={deleteModule}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                          حذف الموديل
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">
                  {selectedUniteId
                    ? "لا توجد موديلات لهذه الوحدة"
                    : "لا توجد موديلات خارج الوحدات لهذه السنة"}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
