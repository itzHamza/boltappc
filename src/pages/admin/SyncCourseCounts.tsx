import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SyncCourseCounts() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // مزامنة عدد الدروس لكل المقاييس
  async function syncAllModuleCounts() {
    setSyncing(true);
    setSyncResult(null);

    try {
      // 1. جلب كل المقاييس
      const { data: modules, error: modulesError } = await supabase
        .from("modules")
        .select("id");

      if (modulesError) throw modulesError;

      // 2. لكل مقياس، احسب عدد الدروس وقم بتحديث حقل course_count
      let updatedCount = 0;

      for (const module of modules) {
        // حساب عدد الدروس للمقياس
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id", { count: "exact" })
          .eq("module_id", module.id);

        if (coursesError) continue;

        // تحديث حقل course_count
        const { error: updateError } = await supabase
          .from("modules")
          .update({ course_count: courses.length })
          .eq("id", module.id);

        if (!updateError) {
          updatedCount++;
        }
      }

      setSyncResult({
        success: true,
        message: `تم تحديث ${updatedCount} من أصل ${modules.length} مقياس`,
      });
    } catch (error) {
      console.error("Error syncing course counts:", error);
      setSyncResult({
        success: false,
        message: `حدث خطأ أثناء المزامنة: ${error.message}`,
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">مزامنة عدد الدروس</h2>
      <p className="text-gray-600 mb-4">
        هذه الأداة ستقوم بحساب عدد الدروس لكل مقياس وتحديث قاعدة البيانات.
      </p>

      <button
        onClick={syncAllModuleCounts}
        disabled={syncing}
        className={`px-4 py-2 rounded-lg text-white ${
          syncing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {syncing ? "جاري المزامنة..." : "مزامنة عدد الدروس"}
      </button>

      {syncResult && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            syncResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {syncResult.message}
        </div>
      )}
    </div>
  );
}
