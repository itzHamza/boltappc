import { useEffect, useRef } from "react";

interface PDFViewerProps {
  fileUrl: string; // رابط ملف PDF
  clientId: string; // Adobe Client ID
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, clientId }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    // إنشاء iframe لعرض المستند
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";

    // إنشاء رابط التضمين مع تفعيل التعليقات التوضيحية
    const embedUrl = `https://acrobatservices.adobe.com/embed-url?client_id=${clientId}&file=${encodeURIComponent(
      fileUrl
    )}&enable_annotations=true`;

    iframe.src = embedUrl;
    viewerRef.current.appendChild(iframe);

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      if (viewerRef.current && viewerRef.current.contains(iframe)) {
        viewerRef.current.removeChild(iframe);
      }
    };
  }, [fileUrl, clientId]);

  return <div ref={viewerRef} style={{ width: "100%", height: "600px" }} />;
};

export default PDFViewer;
