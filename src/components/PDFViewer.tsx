import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import * as pdfjs from "pdfjs-dist"; // ✅ استيراد pdfjs-dist
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// ✅ ضبط مسار الـ Worker تلقائيًا بناءً على الإصدار المثبت
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className = "" }: PDFViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
}
