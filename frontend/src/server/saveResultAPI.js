import { loadProject } from "@/lib/storage";

const BACKEND_PROJECT_URL = `${import.meta.env.VITE_BACKEND_BASE_ENDPOINT}/projects`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_ENDPOINT;

// Load all projects
export const loadProjectAPI = async () => {
  try {
    const res = await fetch(BACKEND_PROJECT_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.projects || data; // handle {projects: [...]} or direct array
  } catch (e) {
    console.error("Failed to load projects:", e.message);
    throw e;
  }
};

// Create new project
export const createProjectAPI = async (name, description) => {
  try {
    const res = await fetch(BACKEND_PROJECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (e) {
    console.error("createProjectAPI error:", e);
    throw e;
  }
};

// Get all images for a project
export const getImageByProjectAPI = async (id) => {
  try {
    const res = await fetch(`${BACKEND_PROJECT_URL}/${id}/images`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch project images:", e.message);
    return null; // fallback
  }
};

// Save result
export const saveResultAPI = async (resultData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error saving result:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
