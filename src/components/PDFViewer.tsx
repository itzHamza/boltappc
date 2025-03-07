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
        script.onload = () => initAdobeViewer();
        document.body.appendChild(script);
      } else {
        initAdobeViewer();
      }
    };

    const initAdobeViewer = () => {
      if (!viewerRef.current || !(window as any).AdobeDC) return;

      const adobeDCView = new (window as any).AdobeDC.View({
        clientId,
        divId: "adobe-dc-view",
      });

      adobeDCView.previewFile(
        {
          content: { location: { url } },
          metaData: { fileName: "document.pdf" },
        },
        {
          embedMode: "SIZED_CONTAINER",
          defaultViewMode: "FIT_WIDTH",
          showAnnotationTools: true,
          enableAnnotationAPIs: true,
        }
      );
    };

    loadAdobeSDK();
  }, [url]);

  return <div id="adobe-dc-view" ref={viewerRef} style={{ width: "100%", height: "600px" }} />;
};

export default PDFViewer;
