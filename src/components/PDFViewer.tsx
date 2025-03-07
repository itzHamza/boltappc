import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PDFViewerProps {
  url: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!url) {
      console.error("❌ الرابط غير موجود، لا يمكن تحميل PDF.");
      return;
    }

    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.warn("⏳ AdobeDC غير متاح بعد، سيتم إعادة المحاولة...");
        setTimeout(initAdobeViewer, 500);
        return;
      }

      const adobeDCView = new window.AdobeDC.View({
        clientId: "a12ef57159d442318d90f46cd8f90189",
        divId: "adobe-pdf-viewer",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url } },
          metaData: {
            fileName: url.split("/").pop() || "Document.pdf",
            fileId: `file-${Date.now()}`,
          },
        },
        {
          embedMode: "FULL_WINDOW",

        }
      );

      console.log("✅ Adobe PDF Viewer جاهز مع التعليقات والتظليل!");
    };

    if (!window.AdobeDC) {
      const scriptId = "adobe-sdk-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
        script.id = scriptId;
        script.onload = () => {
          console.log("✅ Adobe View SDK Loaded. جاري التحقق من AdobeDC...");
          setTimeout(initAdobeViewer, 1000);
        };
        document.body.appendChild(script);
      } else {
        console.log("📌 Adobe View SDK موجود بالفعل، جاري التحقق...");
        setTimeout(initAdobeViewer, 1000);
      }
    } else {
      initAdobeViewer();
    }

    // ✅ تكبير الشاشة افتراضيًا على الهواتف
    if (window.innerWidth < 768) {
      document.body.style.transform = "scale(0.8)";
      document.body.style.width = "120vw";
    }

    return () => {
      document.body.style.transform = "scale(1)";
      document.body.style.width = "100%";
    };
  }, [url]);

  return (
    <div>
      {/* ✅ زر الرجوع للخروج من وضع FULL_WINDOW */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 z-50"
      >
        ⬅️ رجوع
      </button>

      <div id="adobe-pdf-viewer" className="w-full h-screen" />
    </div>
  );
};

export default PDFViewer;
