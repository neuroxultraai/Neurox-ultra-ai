
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PORT = process.env.PORT || 5050;

const redFlags = ["chest pain","difficulty breathing","severe bleeding","unconscious","loss of vision","sudden weakness","severe allergic","shortness of breath"];

app.post("/api/doctor", async (req, res) => {
  try {
    const { symptoms = "", age = null, gender = "" } = req.body || {};
    if (!symptoms || symptoms.trim().length < 3) {
      return res.status(400).json({ error: "Please provide symptoms (3+ characters)." });
    }
    const text = symptoms.toLowerCase();
    for (const rf of redFlags) {
      if (text.includes(rf)) {
        return res.json({
          triage: "high",
          advice: "Possible emergency — seek immediate medical attention or call local emergency number.",
          suggestions: ["Call emergency services", "Do not delay; seek urgent care"],
          source: "red-flag-rule"
        });
      }
    }

    // Use OpenAI if API key provided
    if (OPENAI_API_KEY) {
      const prompt = `You are a cautious medical assistant. User symptoms: "${symptoms}". Age: ${age||"unknown"}. Gender: ${gender||"unknown"}.
Provide (in JSON):
{ "diagnoses": ["..."], "triage":"low|medium|high", "advice":"...", "suggestions":["..."], "disclaimer":"..." }.
Keep responses conservative and non-prescriptive.`;

      const body = {
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "You are a conservative medical assistant." }, { role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.1
      };

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      const reply = j.choices?.[0]?.message?.content || "";
      // Try to parse JSON block from reply
      let parsed = null;
      try {
        const start = reply.indexOf("{");
        const end = reply.lastIndexOf("}");
        if (start !== -1 && end !== -1) parsed = JSON.parse(reply.slice(start, end+1));
      } catch (e) { parsed = null; }
      return res.json({ source: "openai", raw: reply, parsed: parsed });
    }

    // Fallback heuristic response
    return res.json({
      triage: "medium",
      advice: "Symptoms appear non-emergency. Rest, hydrate, monitor. See a doctor if worsen.",
      suggestions: ["Rest & fluids", "OTC paracetamol for fever if appropriate", "See a doctor if symptoms persist or worsen"],
      source: "mock"
    });
  } catch (err) {
    console.error("Error /api/doctor:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => res.send("Doctor AI server running"));
app.listen(PORT, () => console.log(`Doctor AI server listening on ${PORT}`));
