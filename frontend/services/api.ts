const API_BASE_URL = "http://192.168.29.119:5000";
// ⚠️ This will be updated to LAN IP later for real phone

export async function analyzeSymptoms(symptoms: string) {
  const response = await fetch(`${API_BASE_URL}/analyze/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symptoms: [symptoms],
      mood: "anxious",
      medications: [],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to reach Viora backend");
  }

  return response.json();
}
