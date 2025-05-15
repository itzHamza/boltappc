// SortablePdfItem.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PdfItemProps {
  pdf: {
    id: string;
    title: string;
    url: string;
  };
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
}

export function SortablePdfItem({
  pdf,
  index,
  onRemove,
  onChange,
}: PdfItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: pdf.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm mb-2"
    >
      <div className="flex items-center mb-2">
        <div
          className="mr-2 text-gray-500 cursor-move"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </div>
        <div className="font-medium">PDF {index + 1}</div>
        <button
          onClick={() => onRemove(index)}
          className="ml-auto px-3 py-1 bg-red-500 text-white rounded-lg"
        >
          حذف
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="عنوان الملف"
          value={pdf.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          className="p-2 border w-full"
        />
        <input
          type="text"
          placeholder="رابط الملف"
          value={pdf.url}
          onChange={(e) => onChange(index, "url", e.target.value)}
          className="p-2 border w-full"
        />
      </div>
    </div>
  );
}

export default SortablePdfItem;
