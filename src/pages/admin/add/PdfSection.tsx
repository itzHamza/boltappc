// PdfSection.tsx
import React from "react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortablePdfItem from "./SortablePdfItem";
import { v4 as uuidv4 } from "uuid";

interface PdfSectionProps {
  pdfs: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  onAddManualPdf: () => void;
  onRemovePdf: (index: number) => void;
  onPdfChange: (index: number, field: string, value: string) => void;
  onDragEnd: (event: any) => void;
  uploadPdf: (file: File, index: number) => Promise<void>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  setNewCourse: React.Dispatch<React.SetStateAction<any>>;
}

export function PdfSection({
  pdfs,
  onAddManualPdf,
  onRemovePdf,
  onPdfChange,
  onDragEnd,
  uploadPdf,
  activeId,
  setActiveId,
  setNewCourse,
}: PdfSectionProps) {
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Dropzone configuration for PDF upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const newPdf = {
          id: uuidv4(),
          title: file.name,
          url: "",
        };

        setNewCourse((prevState: any) => {
          const updatedPdfs = [...prevState.pdfs, newPdf];
          return { ...prevState, pdfs: updatedPdfs };
        });

        // Upload file to Cloudflare R2
        // We need to wait a tick for React to update state before accessing the new index
        setTimeout(() => {
          uploadPdf(file, pdfs.length);
        }, 0);
      }
    },
  });

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mt-4 mb-2">ملفات PDF</h3>
      <div className="flex flex-col space-y-2 mb-4">
        <div
          {...getRootProps()}
          className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <p>اسحب وأسقط ملف PDF هنا، أو انقر لتحديد ملف</p>
        </div>

        <button
          onClick={onAddManualPdf}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          + أضف PDF يدويًا
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={pdfs.map((pdf) => pdf.id)}
          strategy={verticalListSortingStrategy}
        >
          {pdfs.map((pdf, index) => (
            <SortablePdfItem
              key={pdf.id}
              pdf={pdf}
              index={index}
              onRemove={onRemovePdf}
              onChange={onPdfChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default PdfSection;
