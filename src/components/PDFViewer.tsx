import React, { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, className }) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.error("AdobeDC غير متاح، سيتم إعادة المحاولة...");
        setTimeout(initAdobeViewer, 500);
        return;
      }

      if (viewerRef.current) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: "a12ef57159d442318d90f46cd8f90189",
          divId: viewerRef.current.id,
        });

        adobeDCView.previewFile(
          {
            content: { location: { url } },
            metaData: { fileName: "Document.pdf" },
          },
          { embedMode: "SIZED_CONTAINER" } // ✅ لاستخدامه داخل `div` بدلاً من `FULL_WINDOW`
        );

        console.log("✅ Adobe PDF Viewer جاهز داخل المكون!");
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

  return <div ref={viewerRef} className={`w-full ${className}`} />;
};

export default PDFViewer;
