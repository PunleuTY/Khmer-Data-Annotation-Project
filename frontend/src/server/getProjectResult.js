const BACKEND_PROJECT_URL = `${import.meta.env.VITE_BACKEND_BASE_ENDPOINT}/projects`;

export const editProjectAPI = async (projectId, updatedData) => {
  try {
    console.log("editProjectAPI called with:", { projectId, updatedData });
    console.log("Sending request to:", `${BACKEND_PROJECT_URL}/${projectId}`);

    const response = await fetch(`${BACKEND_PROJECT_URL}/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Edit API response data:", data);
    return data;
  } catch (error) {
    console.error("Error in editProjectAPI:", error);
    throw error;
  }
};
