import { file } from "jszip";
const BACKEND_UPLOAD_URL = "http://127.0.0.1:8000/images/";

export const uploadImages = async (projectId, files, annotations) => {
  if (!files || files.length === 0) return null;

  const formData = new FormData();
  formData.append("project_id", projectId);

  console.log("upload to project", files, projectId);

  formData.append("image", files[0]);

  // ✅ Add annotation points (convert array/object → JSON string)
  formData.append("annotations", JSON.stringify(annotations));
  console.log("data annotation go to", annotations);

  const res = await fetch("http://127.0.0.1:8000/images/", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload images");
  }

  return await res.json();
};

export const saveGroundTruth = async (
  filename,
  projectId,
  imageId,
  annotations
) => {
  if (!annotations) return null;
  const payload = {
    filename,
    project_id: projectId,
    image_id: imageId,
    annotations: annotations,
    meta: {
      tool: "Khmer Data Annotation Tool",
      lang: "khm",
      timestamp: new Date().toISOString(),
    },
  };

  console.log("save ground truth payload", payload);
  try {
    const res = await fetch("http://127.0.0.1:3000/images/save-groundtruth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    alert("Error saving ground truth");
  }
};
