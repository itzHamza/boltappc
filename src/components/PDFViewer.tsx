import { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const clientId = "bd78075227e0410c83400f75a891f5bc"; // استبدل بـ Client ID الخاص بك

  useEffect(() => {
    // تحميل SDK إن لم يكن محمّلاً مسبقًا
    const script = document.createElement("script");
    script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
    script.async = true;
    script.onload = () => {
      if (!(window as any).AdobeDC) return;

      const adobeDCView = new (window as any).AdobeDC.View({
        clientId,
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url } },
          metaData: { fileName: "document.pdf" },
        },
        { embedMode: "SIZED_CONTAINER" } // يمكنك تغييره إلى "FULL_WINDOW" أو "INLINE"
      );
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // تنظيف عند الخروج من الصفحة
    };
  }, [url]);

  return (
    <div
      id="adobe-dc-view"
      ref={viewerRef}
      style={{ width: "100%", height: "600px" }}
    />
  );
};

export default PDFViewer;
