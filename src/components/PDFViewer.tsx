import { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const clientId = "b8572109d2534e31a259590e606b20e8"; // ضع Client ID الخاص بك

  useEffect(() => {
    const loadAdobeSDK = () => {
      if (!(window as any).AdobeDC) {
        const script = document.createElement("script");
        script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
        script.async = true;
        script.onload = () =>
          document.dispatchEvent(new Event("adobe_dc_view_sdk.ready"));
        document.body.appendChild(script);
      } else {
        document.dispatchEvent(new Event("adobe_dc_view_sdk.ready"));
      }
    };

    const initAdobeViewer = () => {
      if (!viewerRef.current || !(window as any).AdobeDC) return;

      const adobeDCView = new (window as any).AdobeDC.View({
        clientId,
        divId: viewerRef.current.id,
      });

      adobeDCView.previewFile(
        {
          content: { location: { url } },
          metaData: { fileName: "document.pdf" },
        },
        {
          embedMode: "SIZED_CONTAINER",
          showAnnotationTools: true, // ✅ السماح بإضافة التعليقات
          enableAnnotationAPIs: true, // ✅ تفعيل APIs الخاصة بالتعليقات
          showDownloadPDF: true, // ✅ تفعيل خيار التحميل
          showPrintPDF: true, // ✅ تفعيل خيار الطباعة
          defaultViewMode: "FIT_WIDTH", // ✅ عرض الملف بحجم متناسب
        }
      );
    };

    document.addEventListener("adobe_dc_view_sdk.ready", initAdobeViewer);
    loadAdobeSDK();

    return () => {
      document.removeEventListener("adobe_dc_view_sdk.ready", initAdobeViewer);
    };
  }, [url]);

  return (
    <div
      id="pdf-viewer"
      ref={viewerRef}
      style={{ width: "100%", height: "600px" }}
    />
  );
};

export default PDFViewer;
