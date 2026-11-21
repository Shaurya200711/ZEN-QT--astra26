export async function analyzeCoordinates({ lat, lng, regionName = "Selected Sector" }) {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, regionName }),
  });
  if (!response.ok) {
    throw new Error(`Groq analysis request failed (${response.status})`);
  }
  return response.json();
}
