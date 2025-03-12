import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useDropzone } from "react-dropzone";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

  // تكوين عميل Cloudflare R2
  const r2Client = new S3Client({
    region: "auto", // Cloudflare R2 يتطلب region = 'auto'
    endpoint:
      "https://06893eb6afdfa9c91367be3c95e2c07b.r2.cloudflarestorage.com", // استبدل بـ endpoint الخاص بك
    credentials: {
      accessKeyId: "4b81a819904dda6a2cf386c580557b9b", // استبدل بـ access key الخاص بك
      secretAccessKey:
        "2a2bafce1722b2bdb01f0ee763b528d88ffd4c50ae3eeae37cbd25194d484fa1", // استبدل بـ secret key الخاص بك
    },
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
    console.log("السنوات التي تم جلبها:", data); // تحقق من البيانات
    setYears(data);
  }
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

  // إضافة PDF يدويًا
  function addManualPdf() {
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

  // تحميل ملف PDF إلى Cloudflare R2
async function uploadPdf(file, index) {
  setUploading(true);

  try {
    // ✅ التحقق من أن الملف PDF
    if (file.type !== "application/pdf") {
      alert("❌ يرجى تحميل ملف PDF فقط!");
      setUploading(false);
      return;
    }

    // ✅ التحقق من أن `selectedYear` معينة بشكل صحيح
    if (!selectedYear) {
      alert("❌ يرجى اختيار سنة أولاً!");
      setUploading(false);
      return;
    }

    // ✅ تحويل `selectedYear` إلى نفس نوع `id` في `years`
    const selectedYearId =
      typeof years[0].id === "number" ? Number(selectedYear) : selectedYear;

    // ✅ البحث عن السنة المختارة
    const selectedYearData = years.find((year) => year.id === selectedYearId);
    if (!selectedYearData) {
      alert("❌ حدث خطأ: لم يتم العثور على السنة!");
      console.error("السنة المختارة (selectedYear):", selectedYear);
      console.error("قائمة السنوات (years):", years);
      setUploading(false);
      return;
    }

    // ✅ البحث عن الوحدة المختارة (إذا كانت موجودة)
    const selectedUniteData = unites.find(
      (unite) => unite.id === selectedUniteId
    );

    // ✅ البحث عن الموديل المختار
    const selectedModuleData = modules.find(
      (module) => module.id === newCourse.module_id
    );
    if (!selectedModuleData) {
      alert("❌ حدث خطأ: لم يتم العثور على الموديل!");
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
    const yearFolder = sanitizeName(selectedYearData.title);
    const uniteFolder = selectedUniteData
      ? sanitizeName(selectedUniteData.title)
      : null;
    const moduleFolder = sanitizeName(selectedModuleData.title);

    // ✅ إنشاء المسار الكامل
    const path = selectedUniteData
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
    const fileUrl = `https://pub-26d82a51e954464d8c48f5d1307898a3.r2.dev/${uniqueFileName}`;

    // ✅ تحديث قائمة ملفات PDF بالرابط الصحيح
    setNewCourse((prevState) => {
      const updatedPdfs = [...prevState.pdfs];
      updatedPdfs[index] = { ...updatedPdfs[index], url: fileUrl };
      return { ...prevState, pdfs: updatedPdfs };
    });

    alert("✅ تم تحميل الملف بنجاح!");
  } catch (error) {
    console.error("❌ خطأ أثناء رفع الملف إلى R2:", error);
    alert("❌ حدث خطأ أثناء رفع الملف إلى Cloudflare R2!");
  } finally {
    setUploading(false);
  }
}

  // Dropzone لرفع الملفات
  const { getRootProps, getInputProps } = useDropzone({
    accept: "application/pdf", // قبول ملفات PDF فقط
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const newPdf = {
          id: newCourse.pdfs.length + 1,
          title: file.name,
          url: "",
        };
        setNewCourse((prevState) => ({
          ...prevState,
          pdfs: [...prevState.pdfs, newPdf],
        }));
        uploadPdf(file, newCourse.pdfs.length); // تحميل الملف إلى Cloudflare R2
      }
    },
  });

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

      {/* زر إضافة PDF يدويًا */}
      <button
        onClick={addManualPdf}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg m-2"
      >
        + أضف PDF يدويًا
      </button>

      {/* Dropzone لرفع ملفات PDF */}
      <div
        {...getRootProps()}
        className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>اسحب وأسقط ملف PDF هنا، أو انقر لتحديد ملف</p>
      </div>

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
