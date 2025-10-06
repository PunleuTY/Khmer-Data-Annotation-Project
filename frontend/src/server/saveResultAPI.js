import { loadProject } from "@/lib/storage";

const API_BASE_URL = "http://localhost:3001/api";
const BACKEND_PROJECT_URL = "http://127.0.0.1:3000/projects";

export const loadProjectAPI = async () => {
  try {
    const res = await fetch(BACKEND_PROJECT_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.projects || data; // Handle both {projects: [...]} and direct array responses
  } catch (e) {
    console.error("Failed to load projects:", e.message);
    throw e; // Re-throw to let calling component handle it
  }
};

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
    return data; // Return the created project
  } catch (e) {
    console.error("createProjectAPI error:", e);
    throw e; // Re-throw so the calling component can handle the error
  }
};

export const getImageByProjectAPI = async (id) => {
  try {
    const res = await fetch(`http://127.0.0.1:3000/projects/${id}/images`, {
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
    return null; // Return null or an empty array to indicate an error
  }
};

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
      data: data,
    };
  } catch (error) {
    console.error("Error saving result:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
