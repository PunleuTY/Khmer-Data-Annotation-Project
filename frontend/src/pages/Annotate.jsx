"use client";
// This file is part of the Open-Source project:
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {  
  ImagePlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ScanText,
  SquareDashedMousePointer,
  PenTool,
  FileJson,
  Download,
  Undo,
  VectorSquare,
  Redo,
} from "lucide-react";

import { JsonEditor } from "@/components/json-editor";
import { AnnotationList } from "@/components/annotation-list";
import { AnnotationCanvas } from "@/components/annotation-canvas";
import { levenshteinSimilarity } from "@/lib/levenshtein";
import { saveProject, clearProject } from "@/lib/storage";
import { ExportDialog } from "@/components/export-dialog";
// import { CurrentProjectContext, ProjectContext } from "./Myproject";
import { uploadImages, saveGroundTruth } from "@/server/sendImageAPI";
import { ImageUploader } from "@/components/image-uploader";
import { getImageByProjectAPI } from "@/server/saveResultAPI";

// --- CONSTANTS ---
const HISTORY_LIMIT = 50;

// --- HELPERS ---
const convertAnnotations = (data) => {
  if (!data || !data.id || !data.annotations) return {};

  // Convert ObjectId to string if needed
  const id = typeof data.id === "string" ? data.id : data.id.toString();

  return {
    [id]: data.annotations,
  };
};

const Annotate = () => {
  const [mode, setMode] = useState("box"); // 'box' | 'polygon' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [images, setImages] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const [activeTab, setActiveTab] = useState("annotation");
  const [lang, setLang] = useState("khm");
  const [exportOpen, setExportOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [fullOcr, setFullOcr] = useState({ text: "", conf: null });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [batchInfo, setBatchInfo] = useState({
    running: false,
    current: 0,
    total: 0,
    pct: 0,
  });
  const { id } = useParams();
  const CurrentProjectContext = id;

  const currentImage = images.find((i) => i.id === currentId);

  // --- Load Project if Exists ---
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImageByProjectAPI(id);
        if (data) {
          const processedImages = data.map((img) => ({
            ...img,
            url: img.base64, // add url attribute with base64 value
          }));

          console.log("Fetched images:", processedImages);

          const anns = processedImages.reduce((acc, img) => {
            console.log("Processing image for annotations:", img);
            return { ...acc, ...convertAnnotations(img) };
          }, {});

          console.log("Converted annotations:", anns);

          setAnnotations(anns);
          setImages(processedImages);
        }
      } catch (error) {
        console.error("Failed to fetch images in useEffect:", error);
      }
    };

    if (id) {
      // Prevents the API from being called on initial render if context is null
      fetchImages();
    }
  }, [id]);

  const fetchSaveGroundTruth = async () => {
    const ann = annotations[currentId] || [];
    const file_name = currentImage ? currentImage.name : "unknown.png";
    setSaveLoading(true);
    try {
      const data = await saveGroundTruth(file_name, id, currentId, ann);
      console.log("Fetched saveimages:", data);
      setSuccessMsg("Project save successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (error) {
      console.error("Failed to fetch images in useEffect:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  // --- Init History ---
  useEffect(() => {
    if (history.length === 0) {
      const initialState = {
        annotations: { ...annotations },
        textAnnotations: { ...fullOcr },
        timestamp: Date.now(),
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, []);

  const runOcr = async () => {
    if (!currentId) return;
    const anns = annotations[currentId] || [];
    if (!anns.length) return;

    const currentImage = images.find((i) => i.id === currentId);
    if (!currentImage) return;
    setOcrLoading(true);

    try {
      // Convert bounding boxes
      const boxes = anns.map((ann) => {
        if (ann.type === "polygon" && ann.points) {
          const xs = ann.points.map((p) => p.x);
          const ys = ann.points.map((p) => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);
          return [minX, minY, maxX, maxY];
        } else if (ann.type === "box" && ann.rect) {
          return [
            ann.rect.x,
            ann.rect.y,
            ann.rect.x + ann.rect.w,
            ann.rect.y + ann.rect.h,
          ];
        } else if (
          ann.rect.x === 0 &&
          ann.rect.y === 0 &&
          ann.rect.width === 0 &&
          ann.rect.height === 0
        ) {
          return [1, 1, 2, 2]; // Minimal box to avoid issues
        }
      });

      // Ensure we have a File object
      let fileToSend;
      if (currentImage.file) {
        fileToSend = currentImage.file;
      } else if (currentImage.url) {
        const resp = await fetch(currentImage.url);
        const blob = await resp.blob();
        fileToSend = new File([blob], currentImage.name);
      } else {
        console.error("No file or URL found for image", currentImage);
        return;
      }

      const data = await uploadImages(
        CurrentProjectContext,
        [fileToSend],
        boxes
      );

      console.log("OCR result:", data);

      // Update annotations for current image
      const updatedAnns = anns.map((ann, idx) => {
        const text =
          data.processing_result?.[idx]?.extracted_text?.trim() || "";
        const accuracy = ann.gt ? levenshteinSimilarity(text, ann.gt) : null;
        return { ...ann, text, accuracy };
      });

      setAnnotations((prev) => ({
        ...prev,
        [currentId]: updatedAnns,
      }));

      setSuccessMsg("OCR completed successfully!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.error("OCR failed:", err);
    } finally {
      setOcrLoading(false);
    }
  };

  // --- Autosave ---
  useEffect(() => {
    saveProject({ images, annotations, currentId, lang });
  }, [images, annotations, currentId, lang]);

  useEffect(() => {
    // Fetch annotations when the component mounts
    console.log("images", images);
    console.log("annotation", annotations);
  }, [annotations, currentId, images]);

  const handleFiles = async (items) => {
    const updated = [...images, ...items];
    setImages(updated);
    if (!currentId && updated.length > 0) {
      setCurrentId(updated[0].id);
    }
    // setSelectedFiles(items);
  };

  // --- Navigation ---
  const prevImage = () => {
    if (!images.length || !currentId) return;
    const idx = images.findIndex((i) => i.id === currentId);
    const prev = (idx - 1 + images.length) % images.length;
    setCurrentId(images[prev].id);
  };
  const nextImage = () => {
    if (!images.length || !currentId) return;
    const idx = images.findIndex((i) => i.id === currentId);
    const next = (idx + 1) % images.length;
    setCurrentId(images[next].id);
  };

  // --- Clear Project ---
  const onClearAll = () => {
    setImages([]);
    setAnnotations({});
    setCurrentId(null);
    setFullOcr({ text: "", conf: null });
    clearProject();
  };

  // --- Annotations ---
  const addAnnotation = (ann) => {
    setAnnotations((prev) => {
      const list = prev[currentId] ? [...prev[currentId]] : [];
      const newAnn = {
        ...ann,
        id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        text: "",
        gt: "",
        accuracy: null,
        label: "",
      };
      const updated = { ...prev, [currentId]: [...list, newAnn] };
      // Save to history after state update
      saveToHistoryWith(updated, fullOcr);
      return updated;
    });
  };

  const updateAnnotation = (id, patch) => {
    // saveToHistory();

    setAnnotations((prev) => {
      const list = prev[currentId] ? [...prev[currentId]] : [];
      const idx = list.findIndex((a) => a.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch };
      }
      const updated = { ...prev, [currentId]: list };
      saveToHistoryWith(updated, fullOcr);
      return updated;
    });
  };

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => {
      const list = prev[currentId]
        ? prev[currentId].filter((a) => a.id !== id)
        : [];
      const updated = { ...prev, [currentId]: list };
      saveToHistoryWith(updated, fullOcr);
      return updated;
    });
  };

  const handleSetGT = (id, value) => {
    updateAnnotation(id, { gt: value });
    const ann = (annotations[currentId] || []).find((a) => a.id === id);
    const extracted = ann?.text || "";
    const accuracy = levenshteinSimilarity(extracted, value);
    updateAnnotation(id, { accuracy });
  };

  // --- Undo/Redo ---
  const saveToHistoryWith = useCallback(
    (annotations, fullOcr) => {
      const currentState = {
        annotations: { ...annotations },
        textAnnotations: { ...fullOcr },
        timestamp: Date.now(),
      };
      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(currentState);
        if (newHistory.length > 50) {
          newHistory.shift();
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        }
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setAnnotations(previousState.annotations);
      setFullOcr(previousState.textAnnotations);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setAnnotations(nextState.annotations);
      setFullOcr(nextState.textAnnotations);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  function Loader({ text }) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#12284c]" />
        <span className="text-sm text-gray-700">{text}</span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="flex justify-center px-6 pt-6">
        <h1 className="text-5xl text-[#F88F2D] font-cadt pb-5">My Workspace</h1>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-6">
        {/* Upload + Dataset */}
        <div>
          <Card className="bg-white rounded-xl h-full shadow-md border-b-4 border-t-4 border-[#12284c]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {ocrLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <Loader text="Running OCR..." />
                </div>
              )}
              {saveLoading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <Loader text="Saving..." />
                </div>
              )}
              {successMsg && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
                  {successMsg}
                </div>
              )}
              {/* <input
                type="file"
                multiple
                // onChange={(e) => handleFiles(Array.from(e.target.files))}
                onChange={handleFiles}
              /> */}
              <ImageUploader onFiles={handleFiles} />
              <div className="mt-4">
                <Label className="text-xs text-gray-600">Dataset</Label>
                <div className="mt-2 max-h-56 overflow-auto border rounded-md divide-y">
                  {images.length === 0 && (
                    <p className="text-sm text-gray-500 p-3">
                      No images uploaded yet
                    </p>
                  )}
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      className={`w-full text-left p-2 text-sm hover:bg-blue-50 ${
                        img.id === currentId
                          ? "bg-blue-50 border-l-4 border-[#12284c]"
                          : ""
                      }`}
                      onClick={() => setCurrentId(img.id)}
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {img.name}
                      </div>
                      <div className="text-gray-500">
                        {img.width}×{img.height} · #{idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    disabled={
                      !images.length ||
                      images.findIndex((i) => i.id === currentId) === 0
                    }
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Button>
                  <span className="text-xs text-gray-600">
                    {images.length > 0
                      ? `${images.findIndex((i) => i.id === currentId) + 1} / ${
                          images.length
                        }`
                      : "0 / 0"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    disabled={
                      !images.length ||
                      images.findIndex((i) => i.id === currentId) ===
                        images.length - 1
                    }
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Annotation Canvas */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3">
          <Card className="overflow-hidden bg-white rounded-xl shadow-md border-b-4 border-t-4 border-[#12284c]">
            <CardHeader className="pb-3 flex items-center justify-between">
              <CardTitle className="text-base">Annotation Canvas</CardTitle>
              <div className="flex items-center gap-2 overflow-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" /> Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" /> Redo
                </Button>
                <Button
                  variant={mode === "box" ? "default" : "outline"}
                  onClick={() => setMode("box")}
                  className={mode === "box" ? "bg-[#12284c] text-white" : ""}
                >
                  <SquareDashedMousePointer className="w-4 h-4" />
                </Button>
                <Button
                  variant={mode === "polygon" ? "default" : "outline"}
                  onClick={() => setMode("polygon")}
                  className={
                    mode === "polygon" ? "bg-[#12284c] text-white" : ""
                  }
                >
                  <VectorSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant={mode === "edit" ? "default" : "outline"}
                  onClick={() => setMode("edit")}
                  className={mode === "edit" ? "bg-[#12284c] text-white" : ""}
                >
                  <PenTool className="w-4 h-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runOcr}
                  disabled={ocrLoading}
                >
                  {ocrLoading ? (
                    <>
                      <ScanText className="w-4 h-4 mr-2" /> Loading ..
                    </>
                  ) : (
                    <>
                      <ScanText className="w-4 h-4 mr-2" /> OCR Entire
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSaveGroundTruth}
                  disabled={saveLoading}
                  className={"bg-[#12284c] text-white"}
                >
                  {saveLoading ? (
                    <>
                      SAVING ..
                    </>
                  ) : (
                    <>
                      Save project
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setExportOpen(true)}
                  className="bg-[#12284c] text-white"
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                {/* <Button
                  variant="ghost"
                  onClick={onClearAll}
                  disabled={!images.length}
                  className="bg-[#12284c] text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> ClearAll
                </Button> */}
              </div>
            </CardHeader>
            <CardContent>
              {currentImage ? (
                <AnnotationCanvas
                  image={currentImage}
                  mode={mode}
                  annotations={annotations[currentId] || []}  
                  onAddAnnotation={addAnnotation}
                  onUpdateAnnotation={updateAnnotation}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-500">
                  canvasEmpty
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="annotation">
                <Settings className="w-4 h-4" /> Visual Editor
              </TabsTrigger>
              <TabsTrigger value="json">
                <FileJson className="w-4 h-4" /> Json Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="annotation">
              <AnnotationList
                image={currentImage}
                annotations={annotations[currentId] || []}
                onSetGT={handleSetGT}
                onDelete={deleteAnnotation}
                onUpdate={updateAnnotation}
                lang={lang}
                onBatchStart={(total) =>
                  setBatchInfo({ running: true, total, current: 0, pct: 0 })
                }
                onBatchStep={(current) =>
                  setBatchInfo((b) => ({
                    ...b,
                    current,
                    pct: b.total ? Math.round((current / b.total) * 100) : 0,
                  }))
                }
                onBatchEnd={() =>
                  setBatchInfo({ running: false, total: 0, current: 0, pct: 0 })
                }
                runOcr={runOcr}
              />
            </TabsContent>
            <TabsContent
              value="json"
              className="mt-4 bg-white rounded-xl shadow-md border-b-4 border-t-4 border-[#12284c]"
            >
              <JsonEditor
                images={images}
                annotations={annotations}
                currentId={currentId}
                onUpdate={setAnnotations}
                runOcr={runOcr}
                ocrLoading={ocrLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        images={images}
        annotations={annotations}
        projectMeta={{ name: "Khmer Data Annotation Tool", lang }}
      />
      <Footer />
    </div>
  );
};

export default Annotate;
// --- Upload Handler ---
// const handleFiles = async (event) => {
//   const files = Array.from(event.target.files || []); // convert FileList → Array<File>

//   // Wrap files with metadata for UI (id, preview URL, etc.)
//   const newItems = files.map((file) => ({
//     id: crypto.randomUUID(), // generate unique id
//     file, // keep reference to original File
//     preview: URL.createObjectURL(file), // for image preview
//   }));

//   // Update state
//   const updated = [...images, ...newItems];
//   setImages(updated);

//   // Set first file as current if not set
//   if (!currentId && updated.length > 0) {
//     setCurrentId(updated[0].id);
//   }

//   // Keep raw files for upload
//   setSelectedFiles(newItems.map((i) => i.file));
// };

// const handleFiles = async (items) => {
//   if (!items?.length) return;

//   try {
//     const filePromises = items.map(
//       (item) =>
//         new Promise((resolve, reject) => {
//           const f = item.file || item;
//           if (!(f instanceof Blob))
//             return reject(new Error("Invalid file object"));

//           const reader = new FileReader();
//           reader.onload = (e) =>
//             resolve({
//               localName: f.name,
//               name: f.name,
//               url: e.target.result,
//               width: 726,
//               height: 158,
//             });
//           reader.onerror = reject;
//           reader.readAsDataURL(f);
//         })
//     );

//     const localImages = await Promise.all(filePromises);

//     console.log(items);

//     const data = await uploadImages(
//       CurrentProjectContext,
//       items.map((i) => i.file || i)
//     );

//     const updatedImages = localImages.map((img, i) => ({
//       ...img,
//       serverId: data.images[i]?.id || null,
//       id: data.images[i]?.file_name || img.localName,
//       annotations: data.annotations[data.images[i]?.id] || [],
//     }));

//     setImages((prev) => [...prev, ...updatedImages]);
//     setAnnotations((prev) => ({ ...prev, ...transformData(updatedImages) }));
//   } catch (err) {
//     console.error("Upload error:", err);
//   }
// };
