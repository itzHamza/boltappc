// VideoSection.tsx
import React from "react";
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
import SortableVideoItem from "./SortableVideoItem";

interface VideoSectionProps {
  videos: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  onAddVideo: () => void;
  onRemoveVideo: (index: number) => void;
  onVideoChange: (index: number, field: string, value: string) => void;
  onDragEnd: (event: any) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export function VideoSection({
  videos,
  onAddVideo,
  onRemoveVideo,
  onVideoChange,
  onDragEnd,
  activeId,
  setActiveId,
}: VideoSectionProps) {
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mt-4 mb-2">الفيديوهات</h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveId(event.active.id)}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={videos.map((video) => video.id)}
          strategy={verticalListSortingStrategy}
        >
          {videos.map((video, index) => (
            <SortableVideoItem
              key={video.id}
              video={video}
              index={index}
              onRemove={onRemoveVideo}
              onChange={onVideoChange}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={onAddVideo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
      >
        + أضف فيديو
      </button>
    </div>
  );
}

export default VideoSection;
