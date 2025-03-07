import React, { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, className }) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const divId = "adobe-pdf-viewer";

  useEffect(() => {
    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.error("AdobeDC غير متاح، سيتم إعادة المحاولة...");
        setTimeout(initAdobeViewer, 500);
        return;
      }

      if (viewerRef.current) {
        viewerRef.current.id = divId;

        const adobeDCView = new window.AdobeDC.View({
          clientId: "a12ef57159d442318d90f46cd8f90189",
          divId: divId,
        });

        adobeDCView.previewFile(
          {
            content: { location: { url } },
            metaData: { fileName: "Document.pdf" },
          },
          {
            embedMode: "SIZED_CONTAINER", // ✅ تشغيل الـ Viewer داخل Div
            showAnnotationTools: true, // ✅ عرض أدوات التعليقات
            enableAnnotationAPIs: true, // ✅ تفعيل التعليقات عبر الـ API
            enableSearchAPIs: true, // ✅ تفعيل البحث في المستند
          }
        );

        console.log("✅ Adobe PDF Viewer جاهز مع التعليقات والتظليل!");
      } else {
        console.error("❌ لم يتم العثور على العنصر!");
      }
    };

    if (!window.AdobeDC) {
      const scriptId = "adobe-sdk-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
        script.id = scriptId;
        script.onload = () => {
          console.log("✅ Adobe View SDK Loaded. جاري التحقق من AdobeDC...");
          requestAnimationFrame(initAdobeViewer);
        };
        document.body.appendChild(script);
      } else {
        console.log("📌 Adobe View SDK موجود بالفعل، جاري التحقق...");
        requestAnimationFrame(initAdobeViewer);
      }
    } else {
      requestAnimationFrame(initAdobeViewer);
    }
  }, [url]);

  return <div ref={viewerRef} id={divId} className={`w-full ${className}`} />;
};

export default PDFViewer;
