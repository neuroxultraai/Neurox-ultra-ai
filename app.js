
const API_BASE = window.__API_BASE__ || "http://localhost:5050";

const el = id => document.getElementById(id);
el("askBtn").addEventListener("click", async () => {
  const symptoms = el("symptoms").value.trim();
  const age = Number(el("age").value) || null;
  const gender = el("gender").value || "";
  if (!symptoms) return alert("Please describe your symptoms.");
  el("out").textContent = "Thinking..."; el("result").style.display = "block"; el("triage").className = "triage";
  try {
    const res = await fetch(API_BASE + "/api/doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms, age, gender })
    });
    const j = await res.json();
    let triage = j.triage || (j.parsed && j.parsed.triage) || (j.parsed && j.parsed.triage) || "unknown";
    el("triage").textContent = "Triage: " + triage;
    el("triage").classList.add(triage==="high"?"high":triage==="medium"?"medium":"low");
    let outText = "";
    if (j.source === "openai" && j.parsed) {
      outText += "Diagnoses:\n" + (Array.isArray(j.parsed.diagnoses)? j.parsed.diagnoses.join("\n") : j.parsed.diagnoses) + "\n\n";
      outText += "Advice:\n" + (j.parsed.advice || "") + "\n\n";
      outText += "Suggestions:\n" + ((j.parsed.suggestions||[]).join("\n")) + "\n\n";
      outText += "Disclaimer:\n" + (j.parsed.disclaimer || "");
    } else {
      outText += "Advice:\n" + (j.advice || JSON.stringify(j)) + "\n\n";
      outText += "Suggestions:\n" + ((j.suggestions||[]).join("\n")) + "\n\n";
      outText += "Source: " + (j.source||"unknown");
    }
    el("out").textContent = outText;
  } catch (e) {
    el("out").textContent = "Error: " + e.message;
  }
});

el("speakBtn").addEventListener("click", () => {
  const txt = el("out").textContent || "No response";
  try { const u = new SpeechSynthesisUtterance(txt); speechSynthesis.speak(u); } catch(e){ alert("Speech not supported"); }
});

el("saveBtn").addEventListener("click", () => {
  const title = "DoctorAI_Report.txt";
  const blob = new Blob([el("out").textContent], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = title; a.click(); URL.revokeObjectURL(url);
});
