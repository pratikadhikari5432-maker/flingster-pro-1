import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { NodeSSH } from "node-ssh";

// Clear vite top level import
// import { createServer as createViteServer } from "vite";

// --- MIDDLEWARE ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized - No Uplink Detection" });
  
  try {
    if (token === "undefined" || token === "null" || token.length < 10) {
       throw new Error("Corrupted Token Detected");
    }
    
    if (token === "mock-jwt" || token === "admin-recovery-jwt") {
       return res.status(401).json({ error: "Session Sync Conflict - Please Re-Login" });
    }

    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid Protocol Token" });
  }
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  const SHOTSTACK_API = "3Ie0acSRfw217AaxfltDPMZBTFj0qCsa4ZskPK4G"; 
  const SECRET_KEY = "SECRET_KEY";

  console.log("Srijan Core: Database Cluster Migrated to Firebase.");

  // --- AUTH PROTOCOLS ---

  app.post("/api/register", async (req, res) => {
    try {
      // Return success, client handles Firestore provisioning
      res.json({ message: "Identity Matrix Registered. Proceeding to Link Node." });
    } catch (err) {
      res.status(400).json({ error: "Registration Failure" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Emergency Override for Admin Recovery
      if (email === "prodyutadhikari99@gmail.com" && password === "admin1234") {
         const token = jwt.sign({ email }, SECRET_KEY);
         return res.json({ 
           token, 
           user: { 
             email, 
             role: 'admin', 
             name: "Master Admin",
             credits: 999999,
             plan: 'Enterprise',
             language: 'en'
           }, 
           otp: "493961" 
         });
      }

      const token = jwt.sign({ email }, SECRET_KEY);
      res.json({ token, user: { email }, otp: "493961" });
    } catch (err) {
      res.status(500).json({ error: "Auth Handshake Failed" });
    }
  });

  // --- CORE STUDIO PROTOCOLS ---

  app.post("/api/render", authMiddleware, async (req: any, res) => {
    try {
      const { videoUrl, start, end, aspectRatio } = req.body;
      const response = await axios.post("https://api.shotstack.io/v1/render", {
        timeline: { tracks: [{ clips: [{ asset: { type: "video", src: videoUrl }, start: 0, trim: start || 0, length: (end - start) || 5 }] }] },
        output: { format: "mp4", resolution: "hd", aspectRatio: aspectRatio || "16:9" }
      }, { headers: { "x-api-key": SHOTSTACK_API, "Content-Type": "application/json" } });

      res.json({ ...response.data });
    } catch (err) {
      res.status(500).json({ error: "Render failed" });
    }
  });

  // --- VPS RENDERING PROTOCOLS ---

  app.post("/api/vps/setup-video", authMiddleware, async (req: any, res) => {
    const { ip, username, password } = req.body;
    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host: ip, username, password });
      await ssh.execCommand('apt-get update && apt-get install -y ffmpeg libsm6 libxext6', { cwd: '/root' });
      res.json({ message: "Industrial Video Node Synchronized", status: 'active' });
    } catch (err: any) {
      res.status(500).json({ error: "Node Connection Failed: " + err.message });
    } finally {
      ssh.dispose();
    }
  });

  app.post("/api/vps/render", authMiddleware, async (req: any, res) => {
    const { ip, username, password, videoUrl, filename } = req.body;
    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host: ip, username, password });
      const outputName = filename || `render_${Date.now()}.mp4`;
      const command = `wget -O source.mp4 "${videoUrl}" && ffmpeg -i source.mp4 -vf "scale=1920:1080" -c:v libx264 -preset fast ${outputName}`;
      await ssh.execCommand(command, { cwd: '/root' });
      res.json({ message: "Render Pulse Initialized on VPS", jobId: outputName, status: 'processing' });
    } catch (err: any) {
      res.status(500).json({ error: "Render Execution Failed: " + err.message });
    } finally {
      ssh.dispose();
    }
  });

  app.post("/api/vps/test-connection", authMiddleware, async (req: any, res) => {
    const { ip, username, password } = req.body;
    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host: ip, username, password });
      const { stdout } = await ssh.execCommand('uptime && uname -a', { cwd: '/root' });
      res.json({ message: "Connection Verified", details: stdout, status: 'online' });
    } catch (err: any) {
      res.status(500).json({ error: "Connection Failed: " + err.message });
    } finally {
      ssh.dispose();
    }
  });

  app.get("/api/health", (req, res) => res.json({ status: 'active', version: '10.5.0' }));

  // --- GITHUB REPOSITORY PROTOCOLS ---

  app.get("/api/github/repos", authMiddleware, async (req: any, res) => {
    const token = req.header("X-GitHub-Token");
    if (!token) return res.status(400).json({ error: "GitHub Token Required" });
    
    try {
      const response = await axios.get("https://api.github.com/user/repos?sort=updated", {
        headers: { 
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });
      res.json(response.data);
    } catch (err: any) {
      res.status(500).json({ error: "GitHub API Sync Failure: " + (err.response?.data?.message || err.message) });
    }
  });

  app.get("/api/github/contents", authMiddleware, async (req: any, res) => {
    const { owner, repo, path: filePath } = req.query;
    const token = req.header("X-GitHub-Token");
    if (!token) return res.status(400).json({ error: "GitHub Token Required" });

    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath || ""}`, {
        headers: { 
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });
      res.json(response.data);
    } catch (err: any) {
      res.status(500).json({ error: "File Extraction Failed: " + (err.response?.data?.message || err.message) });
    }
  });

  app.post("/api/github/deploy", authMiddleware, async (req: any, res) => {
    const { owner, repo, branch, platform } = req.body;
    // Simulation of deployment handshake
    setTimeout(() => {
      console.log(`Deployment pulse sent for ${owner}/${repo} using branch ${branch} to ${platform}`);
    }, 100);
    
    res.json({ 
      success: true, 
      deploymentId: `pm-deploy-${Date.now()}`,
      status: 'queued',
      message: `Industrial Deployment Protocol Initialized for ${repo}. Building matrix...`
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Srijan Industrial Suite active on Port ${PORT}`);
  });
}

startServer();
