import { useEffect, useRef } from "react";

const PDFViewer = ({ url }: { url: string }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.AdobeDC) return;

    const adobeDCView = new window.AdobeDC.View({
      clientId: "b8572109d2534e31a259590e606b20e8",
      divId: "adobe-dc-view",
    });

    adobeDCView.previewFile(
      {
        content: { location: { url } },
        metaData: { fileName: "sample.pdf" },
      },
      {
        embedMode: "FULL_WINDOW", // Allows fullscreen mode
        defaultViewMode: "FIT_WIDTH", // Enables zooming
        showAnnotationTools: true, // Enables annotation toolbar
        enableAnnotationAPIs: true, // Allows users to add annotations
      }
    );
  }, [url]);

  return <div id="adobe-dc-view" ref={viewerRef} style={{ height: "80vh" }} />;
};

export default PDFViewer;
