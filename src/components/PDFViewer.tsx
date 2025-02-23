import React, { useState } from 'react';

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className = '' }: PDFViewerProps) {
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className={`pdf-container ${className}`}>
      <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
            title="Zoom Out"
          >
            Zoom Out
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
            title="Zoom In"
          >
            Zoom In
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-auto bg-white rounded-lg shadow-sm">
        <iframe
          src={`${url}`}
          className="w-full min-h-[600px] border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}