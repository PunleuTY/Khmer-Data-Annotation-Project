const API_BASE_URL = import.meta.env.VITE_API_BASE_ENDPOINT;

export const getResultById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching result by ID:", error);
    throw error;
  }
};
