export async function analyzeCoordinates({ lat, lng, regionName = "Selected Sector" }) {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Analyze Earth-Space vulnerability for ${regionName} (${lat.toFixed(4)}, ${lng.toFixed(4)}). 
      Return valid JSON only with keys: 
      "riskScore" (1-100), 
      "primaryThreat" (string), 
      "spaceWeatherExposure" (Low/Moderate/High), 
      "summary" (2 concise sentences on terrestrial + orbital/geomagnetic risks).`
    }),
  });

  if (!response.ok) {
    throw new Error("Groq crisis uplink failed");
  }

  return response.json();
}