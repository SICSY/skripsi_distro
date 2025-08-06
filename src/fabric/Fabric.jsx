"use client";

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { FabricImage } from "fabric";
import { useEffect, useRef, useState } from "react";

const Fabric = () => {
  const [isUvLoaded, setIsUvLoaded] = useState(false);
  const { onReady, editor, selectedObjects } = useFabricJSEditor();

  const addUvTexture = async () => {
    if (!editor?.canvas) return;

    try {
      const image = await FabricImage.fromURL("./Strip_texture.png");

      // Scale image to fit canvas exactly
      const canvasWidth = editor.canvas.width;
      const canvasHeight = editor.canvas.height;

      image.scaleToWidth(canvasWidth);
      image.scaleToHeight(canvasHeight);

      // Position at center
      image.set({
        left: 0,
        top: 0,
        selectable: false, // Cannot be selected
        evented: false, // Cannot receive events
        moveCursor: "default",
        hoverCursor: "default"
      });

      // Add to canvas and send to back
      editor.canvas.sendObjectToBack(image);
      editor.canvas.add(image);

      editor.canvas.renderAll();

      setIsUvLoaded(true);
    } catch (error) {
      console.error("Error loading UV texture:", error);
    }
  };

  // Function to add decal on top of UV texture
  const onAddDecal = async () => {
    if (!editor?.canvas) return;

    try {
      const image = await FabricImage.fromURL("./react.png");

      // Scale decal to reasonable size
      image.scale(0.1);

      // Position at center of canvas
      image.set({
        left: editor.canvas.width / 2,
        top: editor.canvas.height / 2,
        originX: "center",
        originY: "center",
        selectable: true,
        evented: true
      });

      editor.canvas.add(image);
      editor.canvas.setActiveObject(image);
      editor.canvas.renderAll();
    } catch (error) {
      console.error("Error adding decal:", error);
    }
  };

  useEffect(() => {
    if (editor?.canvas && !isUvLoaded) {
      // Set canvas size
      editor.canvas.setWidth(400);
      editor.canvas.setHeight(400);

      // Auto-load UV texture
      addUvTexture();

      // Store canvas globally for debugging
      window.fabricCanvas = editor.canvas;
    }
  }, [editor, isUvLoaded]);
  const exportAsImage = () => {
    if (!editor?.canvas) return;

    const dataURL = editor.canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2 // Lebih tajam, bisa disesuaikan
    });

    // Trigger download
    const link = document.createElement("a");
    link.download = "custom-shirt.png";
    link.href = dataURL;
    link.click();
  };
  const exportAsJSON = () => {
    if (!editor?.canvas) return;

    const json = editor.canvas.toJSON();

    const jsonStr = JSON.stringify(json, null, 2); // pretty-print

    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "canvas-data.json";
    link.href = URL.createObjectURL(blob);
    link.click();
  };
  return (
    <div className='flex flex-col gap-4 p-4 place-self-start pl-20 pointer-events-auto '>
      <div className='flex gap-2'>
        <button onClick={onAddDecal} className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors' disabled={!isUvLoaded}>
          Tambah Decal
        </button>

        <button onClick={addUvTexture} className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'>
          Reload UV Texture
        </button>
      </div>

      <div className='flex flex-col gap-2 '>
        <div className='text-sm text-gray-600'>Status: {isUvLoaded ? "UV Texture Loaded ✓" : "Loading UV Texture..."}</div>
        <FabricJSCanvas onReady={onReady} className='  w-fit' />
      </div>

      <div className='text-xs text-gray-500 max-w-md'>
        <p>
          <strong>Cara Penggunaan:</strong>
        </p>
        <ul className='list-disc list-inside space-y-1'>
          <li>UV texture akan otomatis dimuat saat canvas siap</li>
          <li>UV texture tidak bisa dipindah atau diubah ukurannya</li>
          <li>Klik "Tambah Decal" untuk menambah gambar di atas UV texture</li>
          <li>Decal bisa dipindah, diubah ukuran, dan dirotasi</li>
          <li>Ubah ukuran canvas dengan input Width/Height</li>
        </ul>
      </div>
      <div className='flex gap-2'>
        <button onClick={exportAsImage} className='px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors'>
          Export Gambar
        </button>
        <button onClick={exportAsJSON} className='px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors'>
          Export JSON
        </button>
      </div>
    </div>
  );
};

export default Fabric;
