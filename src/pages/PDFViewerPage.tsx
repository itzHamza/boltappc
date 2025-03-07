import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PDFViewerPage() {
  const { pdfUrl } = useParams();
  const decodedUrl = decodeURIComponent(pdfUrl || "");

  useEffect(() => {
    const initAdobeViewer = () => {
      if (!window.AdobeDC) {
        console.error("AdobeDC غير متاح، تأكد من تحميل السكريبت.");
        return;
      }

      const adobeDCView = new window.AdobeDC.View({
        clientId: "YOUR_ADOBE_CLIENT_ID",
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url: decodedUrl } },
          metaData: { fileName: "Document.pdf" },
        },
        { embedMode: "FULL_WINDOW" }
      );
    };

    // التأكد من أن السكريبت لم يتم تحميله مسبقًا
    if (!window.AdobeDC) {
      const scriptId = "adobe-sdk-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.src = "https://documentservices.adobe.com/view-sdk/viewer.js";
        script.id = scriptId;
        script.onload = () => {
          console.log("Adobe View SDK Loaded.");
          initAdobeViewer();
        };
        document.body.appendChild(script);
      } else {
        console.log("Adobe View SDK already loaded.");
        initAdobeViewer();
      }
    } else {
      initAdobeViewer();
    }
  }, [decodedUrl]);

  return <div id="adobe-dc-view" style={{ height: "100vh", width: "100vw" }} />;
}
