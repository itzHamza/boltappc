import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url"; // Correct worker import

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PdfReact = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdfRef, setPdfRef] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load the PDF
  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      setPdfRef(pdf);
      renderPage(pdf, currentPage);
    };

    loadPDF();
  }, [pdfUrl]);

  // Render a specific page
  const renderPage = async (pdf, pageNumber) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  };

  // Handle page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      renderPage(pdfRef, currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pdfRef.numPages) {
      setCurrentPage(currentPage + 1);
      renderPage(pdfRef, currentPage + 1);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div>
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {pdfRef ? pdfRef.numPages : "..."}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === (pdfRef ? pdfRef.numPages : 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfReact;
