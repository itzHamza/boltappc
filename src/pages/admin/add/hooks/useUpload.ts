// hooks/useUpload.ts
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

interface Year {
  id: string | number;
  title: string;
}

interface Unite {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
}

export function useUpload(
  selectedYear: string | number,
  selectedUniteId: string,
  years: Year[],
  unites: Unite[],
  modules: Module[],
  newCourse: any,
  setNewCourse: React.Dispatch<React.SetStateAction<any>>
) {
  const [uploading, setUploading] = useState(false);

  // Cloudflare R2 client configuration
  const r2Client = new S3Client({
    region: "auto",
    endpoint:
      "https://06893eb6afdfa9c91367be3c95e2c07b.r2.cloudflarestorage.com",
    credentials: {
      accessKeyId: "4b81a819904dda6a2cf386c580557b9b",
      secretAccessKey:
        "2a2bafce1722b2bdb01f0ee763b528d88ffd4c50ae3eeae37cbd25194d484fa1",
    },
  });

  // Extract filename from R2 URL
  const extractKeyFromUrl = (url: string) => {
    if (!url || !url.includes("r2.dev/")) return null;
    return url.split("r2.dev/")[1];
  };

  // Remove PDF and delete file from R2
  const removePdf = async (index: number) => {
    try {
      const pdfToRemove = newCourse.pdfs[index];

      // Check if file URL exists
      if (pdfToRemove.url && pdfToRemove.url.includes("r2.dev")) {
        const fileKey = extractKeyFromUrl(pdfToRemove.url);

        if (fileKey) {
          // Delete file from Cloudflare R2
          const command = new DeleteObjectCommand({
            Bucket: "tbibcours",
            Key: fileKey,
          });

          await r2Client.send(command);
          toast.success(`✅ تم حذف الملف ${fileKey} من R2 بنجاح`);
        }
      }

      // Remove file from the list
      const updatedPdfs = newCourse.pdfs.filter(
        (_: any, i: number) => i !== index
      );
      setNewCourse({ ...newCourse, pdfs: updatedPdfs });
    } catch (error) {
      console.error("❌ خطأ أثناء حذف الملف من R2:", error);
      toast.error("❌ حدث خطأ أثناء حذف الملف من Cloudflare R2!");

      // Remove from list anyway
      const updatedPdfs = newCourse.pdfs.filter(
        (_: any, i: number) => i !== index
      );
      setNewCourse({ ...newCourse, pdfs: updatedPdfs });
    }
  };

  // Upload PDF to Cloudflare R2
  const uploadPdf = async (file: File, index: number) => {
    setUploading(true);

    try {
      // ✅ Verify file is PDF
      if (file.type !== "application/pdf") {
        toast.warning("❌ يرجى تحميل ملف PDF فقط!");
        setUploading(false);
        return;
      }

      // ✅ Verify selectedYear is set correctly
      if (!selectedYear) {
        toast.warning("❌ يرجى اختيار سنة أولاً!");
        setUploading(false);
        return;
      }

      // ✅ Convert selectedYear to match the year id type
      const selectedYearId =
        typeof years[0].id === "number" ? Number(selectedYear) : selectedYear;

      // ✅ Find selected year
      const selectedYearData = years.find((year) => year.id === selectedYearId);
      if (!selectedYearData) {
        toast.error("❌ حدث خطأ: لم يتم العثور على السنة!");
        console.error("السنة المختارة (selectedYear):", selectedYear);
        console.error("قائمة السنوات (years):", years);
        setUploading(false);
        return;
      }

      // ✅ Find selected unit (if exists)
      const selectedUniteData = unites.find(
        (unite) => unite.id === selectedUniteId
      );

      // ✅ Find selected module
      const selectedModuleData = modules.find(
        (module) => module.id === newCourse.module_id
      );
      if (!selectedModuleData) {
        toast.error("❌ حدث خطأ: لم يتم العثور على الموديل!");
        setUploading(false);
        return;
      }

      // ✅ Sanitize names (remove forbidden characters)
      const sanitizeName = (name: string) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .toLowerCase();
      };

      // ✅ Create path based on unit existence
      const yearFolder = sanitizeName(selectedYearData.title);
      const uniteFolder = selectedUniteData
        ? sanitizeName(selectedUniteData.title)
        : null;
      const moduleFolder = sanitizeName(selectedModuleData.title);

      // ✅ Create full path
      const path = selectedUniteData
        ? `${yearFolder}/${uniteFolder}/${moduleFolder}`
        : `${yearFolder}/${moduleFolder}`;

      // ✅ Sanitize filename
      const sanitizeFileName = (name: string) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "")
          .toLowerCase();
      };

      const cleanFileName = sanitizeFileName(file.name);
      const uniqueFileName = `${path}/${uuidv4()}-${cleanFileName}`;

      // ✅ Convert PDF file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // ✅ Upload file to Cloudflare R2 using PutObjectCommand
      const command = new PutObjectCommand({
        Bucket: "tbibcours",
        Key: uniqueFileName,
        Body: arrayBuffer,
        ContentType: "application/pdf",
      });

      await r2Client.send(command);

      // ✅ Create final file URL
      const fileUrl = `https://pub-26d82a51e954464d8c48f5d1307898a3.r2.dev/${uniqueFileName}`;

      // ✅ Update PDF list with correct URL
      setNewCourse((prevState: any) => {
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
  };

  return {
    uploading,
    setUploading,
    removePdf,
    uploadPdf,
  };
}

export default useUpload;
