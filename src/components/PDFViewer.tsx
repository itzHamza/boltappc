import React, { useEffect } from "react";

declare global {
  interface Window {
    AdobeDC: any;
  }
}

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className = "" }: PDFViewerProps) {
  useEffect(() => {
    const loadAdobePDFViewer = async () => {
      if (document.getElementById("adobe-dc-sdk")) {
        initPDFViewer();
        return;
      }

      const script = document.createElement("script");
      script.id = "adobe-dc-sdk";
      script.src = "https://documentcloud.adobe.com/view-sdk/main.js";
      script.onload = initPDFViewer;
      document.head.appendChild(script);
    };

    const initPDFViewer = () => {
      if (window.AdobeDC) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: import.meta.env.VITE_ADOBE_CLIENT_ID,
          divId: "pdf-viewer",
        });

        adobeDCView.previewFile({
          content: { location: { url } },
          metaData: { fileName: url.split("/").pop() },
        });
      }
    };

    loadAdobePDFViewer();
  }, [url]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div id="pdf-viewer" className="h-[800px]" />
    </div>
  );
}
