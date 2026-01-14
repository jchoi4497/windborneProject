// submit.js
import fetch from "node-fetch"; // If Node <18, npm install node-fetch

async function submitApplication() {
  const response = await fetch(
    "https://windbornesystems.com/career_applications.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        career_application: {
          name: "Jonathan Choi",
          email: "jchoi4497@gmail.com",
          role: "Junior Web Developer",
          notes: "Specializing in Full Stack Web Development with a focus in React. I chose OpenWeatherMap to combine balloon flight history with real-time weather for dynamic insights.",
          submission_url: "https://windborneproject.netlify.app",
          portfolio_url: "https://jcsgymguide.netlify.app/",
          resume_url: "https://docs.google.com/document/d/1phEp_hC0pdzoUOZThznZiZmpuc84-FuC/edit",
        },
      }),
    }
  );

  if (response.ok) {
    console.log("Application submitted successfully!");
  } else {
    const text = await response.text();
    console.error("Failed:", response.status, text);
  }
}

submitApplication();
