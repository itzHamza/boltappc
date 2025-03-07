import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PDFViewerPage() {
  const { pdfUrl } = useParams(); // استرجاع رابط الـ PDF من الـ URL
  const decodedUrl = decodeURIComponent(pdfUrl); // فك تشفير الرابط

  useEffect(() => {
    if (window.adobeDCView) {
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
    }
  }, [decodedUrl]);

  return (
    <div id="adobe-dc-view" style={{ height: "100vh", width: "100vw" }}></div>
  );
}
