import React, { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, className }) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const divId = "adobe-pdf-viewer";

  useEffect(() => {
    if (!url) {
      console.error("❌ الرابط غير موجود، لا يمكن تحميل PDF.");
      return;
    }

    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.warn("⏳ AdobeDC غير متاح بعد، سيتم إعادة المحاولة...");
        setTimeout(initAdobeViewer, 500); // ✅ إعادة المحاولة بعد نصف ثانية
        return;
      }

      if (viewerRef.current) {
        viewerRef.current.id = divId;

        const adobeDCView = new window.AdobeDC.View({
          clientId: "a12ef57159d442318d90f46cd8f90189", // ✅ استخدم Client ID الصحيح
          divId: divId,
        });

        adobeDCView.previewFile(
          {
            content: { location: { url } },
            metaData: {
              fileName: url.split("/").pop() || "Document.pdf", // ✅ استخدم اسم الملف من الـ URL
              fileId: `file-${Date.now()}`, // ✅ إنشاء `fileId` فريد لكل ملف
            },
          },
          {
            embedMode: "SIZED_CONTAINER",
            showAnnotationTools: true,
            enableAnnotationAPIs: true,
            enableSearchAPIs: true,
          }
        );

        console.log("✅ Adobe PDF Viewer جاهز مع التعليقات والتظليل!");
      } else {
        console.error("❌ لم يتم العثور على العنصر!");
      }
    };

    // تحميل Adobe View SDK إذا لم يكن موجودًا
    if (!window.AdobeDC) {
      const scriptId = "adobe-sdk-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
        script.id = scriptId;
        script.onload = () => {
          console.log("✅ Adobe View SDK Loaded. جاري التحقق من AdobeDC...");
          setTimeout(initAdobeViewer, 1000); // ✅ انتظر ثانية لضمان تحميل AdobeDC
        };
        document.body.appendChild(script);
      } else {
        console.log("📌 Adobe View SDK موجود بالفعل، جاري التحقق...");
        setTimeout(initAdobeViewer, 1000);
      }
    } else {
      initAdobeViewer();
    }
  }, [url]);

  return <div ref={viewerRef} id={divId} className={`w-full ${className}`} />;
};

export default PDFViewer;
