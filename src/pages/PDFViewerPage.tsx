import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PDFViewerPage() {
  const { pdfUrl } = useParams();
  const decodedUrl = decodeURIComponent(pdfUrl || "");

  useEffect(() => {
    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.error("AdobeDC غير متاح، سيتم إعادة المحاولة...");
        setTimeout(initAdobeViewer, 500);
        return;
      }

      const adobeDCView = new window.AdobeDC.View({
        clientId: "a12ef57159d442318d90f46cd8f90189",
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url: decodedUrl } },
          metaData: { fileName: "Document.pdf" },
        },
        { embedMode: "FULL_WINDOW" }
      );

      console.log("✅ AdobeDC جاهز وتم تحميل الـ PDF بنجاح!");
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
  }, [decodedUrl]);

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-black">
      <div id="adobe-dc-view" className="w-full h-full" />
    </div>
  );
}
