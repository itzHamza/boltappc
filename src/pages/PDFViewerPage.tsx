import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import { Helmet } from "react-helmet-async";

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
        clientId: import.meta.env.VITE_ADOBE_CLIENT_ID,
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
    <div className="fixed top-0 left-0 w-screen h-screen bg-black">
      <Helmet>
        <title>PDFviewer - TBiB Cours</title>
      </Helmet>

      
      <Chatbot />
      <div id="adobe-dc-view" className="w-full h-full" />
    </div>
  );
}
