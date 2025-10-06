"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function ImageUploader({ onFiles }) {
  const inputRef = React.useRef(null);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) {
      const processed = await Promise.all(files.map(processFile));
      onFiles(processed);
    }
    e.target.value = "";
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) {
      const processed = await Promise.all(files.map(processFile));
      onFiles(processed);
    }
  };

  const onDragOver = (e) => e.preventDefault();

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onChange}
      />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-2 border-dashed rounded-md p-4 text-center text-sm text-gray-600"
        aria-label="Drop images here"
      >
        <p>{"Drag & drop images here"}</p>
        <p className="text-xs text-gray-500 mt-1">
          {"PNG, JPG up to browser limits"}
        </p>
        <Button onClick={onPick} variant="outline" className="mt-3">
          <Upload className="w-4 h-4 mr-2" />
          {"Select Images"}
        </Button>
      </div>
    </div>
  );
}

ImageUploader.defaultProps = {
  onFiles: () => {},
};

async function processFile(file) {
  const dataUrl = await readAsDataURL(file);
  const { width, height } = await getImageMeta(dataUrl);
  return {
    id: `${file.name}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    url: dataUrl, // persistable
    width,
    height,
    file, // keep reference to original File
    preview: URL.createObjectURL(file), // for image preview
  };
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageMeta(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
