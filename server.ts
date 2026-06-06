import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as admin from "firebase-admin";

// Initialize Firebase Admin if Service Account is provided
let firebaseAdminApp: admin.app.App | null = null;
try {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Attempt ADC
    credential = admin.credential.applicationDefault();
  }
  
  const projectId = "gen-lang-client-0961167103";
  firebaseAdminApp = admin.initializeApp({ credential, projectId });
  console.log("Firebase Admin initialized");
} catch (e) {
  console.log("Firebase Admin initialization skipped or failed:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use memory storage for multer
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  app.post("/api/notify", async (req, res) => {
    try {
      if (!firebaseAdminApp) {
         return res.status(500).json({ error: "Firebase Admin is not configured. Provide FIREBASE_SERVICE_ACCOUNT_KEY." });
      }
      
      const { title, body, topic, tokens } = req.body;
      
      if (topic) {
         const response = await firebaseAdminApp.messaging().send({
            topic,
            notification: { title, body },
            webpush: {
               fcmOptions: { link: '/' }
            }
         });
         return res.json({ success: true, messageId: response });
      } else if (tokens && tokens.length > 0) {
         const response = await firebaseAdminApp.messaging().sendEachForMulticast({
            tokens,
            notification: { title, body },
            webpush: {
               fcmOptions: { link: '/' }
            }
         });
         return res.json({ success: true, response });
      } else {
         return res.status(400).json({ error: "Provide topic or tokens array" });
      }
    } catch (err: any) {
      console.error("FCM Notify error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const sysInstruct = `You are an AI scheduler. Parse the user's prompt into an array of events. Return ONLY JSON conforming to this schema, without markdown formatting: [{"title": "String", "date": "YYYY-MM-DD" | null, "day": "String (e.g., Sunday)" | null, "time": "String (e.g. 15:00 hrs)", "location": "String", "type": "String"}]`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: prompt }] },
        config: { systemInstruction: { role: "system", parts: [{ text: sysInstruct }] } }
      });

      let transcription = response.text || "[]";
      // trim markdown
      if (transcription.startsWith("\`\`\`json")) transcription = transcription.slice(7);
      if (transcription.startsWith("\`\`\`")) transcription = transcription.slice(3);
      if (transcription.endsWith("\`\`\`")) transcription = transcription.slice(0, -3);

      res.json({ events: JSON.parse(transcription.trim()) });
    } catch (err: any) {
      console.error("AI Schedule error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      console.log("Received file for transcription:", req.file.mimetype, req.file.size, "bytes");

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let mimeType = req.file.mimetype || "audio/webm";
      if (mimeType.includes(";")) {
        mimeType = mimeType.split(";")[0];
      }
      if (mimeType === "application/octet-stream") {
        mimeType = "audio/webm";
      }

      const audioPart = {
        inlineData: {
          mimeType: mimeType,
          data: req.file.buffer.toString("base64"),
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [
            audioPart,
            { text: "Transcribe the speech in this audio exactly. Do not add any extra commentary. Just the transcription text." },
          ]
        }
      });

      const transcription = response.text || "";
      res.json({ transcription });
    } catch (err: any) {
      console.error("Transcription error:", err);
      res.status(500).json({ error: err.message || "Failed to transcribe audio" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
