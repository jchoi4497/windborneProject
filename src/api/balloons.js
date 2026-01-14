export async function getBalloonData() {
  try {
    const response = await fetch("/.netlify/functions/balloons");
    if (!response.ok) throw new Error("Network response error");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not load:", error);
    return null;
  }
}
