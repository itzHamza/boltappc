import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, title }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-4 bg-white shadow-md rounded-lg flex items-center cursor-pointer"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <span className="text-lg font-semibold">{title}</span>
    </li>
  );
}
