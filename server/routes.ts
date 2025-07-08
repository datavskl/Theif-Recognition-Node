import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, registerSchema, 
  insertCameraSchema, insertFaceSchema, insertDetectionSchema, insertSettingsSchema 
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// Type for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Create default settings for user
      await storage.createSettings({
        userId: user.id,
        language: "en",
        theme: "dark",
        alertSound: true,
        emailNotifications: false,
        dataRetentionDays: 30,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ user: { ...user, password: undefined }, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Camera routes
  app.get("/api/cameras", async (req, res) => {
    try {
      const cameras = await storage.getCameras();
      res.json(cameras);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cameras", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const data = insertCameraSchema.parse(req.body);
      const camera = await storage.createCamera(data);
      res.json(camera);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cameras/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const camera = await storage.updateCamera(id, updates);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      res.json(camera);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cameras/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCamera(id);
      if (!deleted) {
        return res.status(404).json({ message: "Camera not found" });
      }
      res.json({ message: "Camera deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Face routes
  app.get("/api/faces", async (req, res) => {
    try {
      const { search } = req.query;
      let faces;
      
      if (search && typeof search === 'string') {
        faces = await storage.searchFaces(search);
      } else {
        faces = await storage.getFaces();
      }
      
      res.json(faces);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/faces", upload.single('image'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file required" });
      }

      const { name, tag, notes, faceEmbedding } = req.body;
      
      if (!faceEmbedding) {
        return res.status(400).json({ message: "Face embedding required" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      
      const face = await storage.createFace({
        name,
        tag: tag || "thief",
        notes: notes || null,
        imageUrl,
        faceEmbedding: JSON.parse(faceEmbedding),
      });

      res.json(face);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/faces/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const face = await storage.updateFace(id, updates);
      if (!face) {
        return res.status(404).json({ message: "Face not found" });
      }
      res.json(face);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/faces/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const face = await storage.getFace(id);
      if (!face) {
        return res.status(404).json({ message: "Face not found" });
      }

      // Delete image file
      const imagePath = path.join(process.cwd(), face.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      const deleted = await storage.deleteFace(id);
      res.json({ message: "Face deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Detection routes
  app.get("/api/detections", async (req, res) => {
    try {
      const { status, limit } = req.query;
      let detections;
      
      if (status && typeof status === 'string') {
        detections = await storage.getDetectionsByStatus(status);
      } else if (limit && typeof limit === 'string') {
        detections = await storage.getRecentDetections(parseInt(limit));
      } else {
        detections = await storage.getDetections();
      }
      
      res.json(detections);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/detections", upload.single('snapshot'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Snapshot file required" });
      }

      const { faceId, cameraId, confidence } = req.body;
      const snapshotUrl = `/uploads/${req.file.filename}`;
      
      const detection = await storage.createDetection({
        faceId: faceId ? parseInt(faceId) : null,
        cameraId: parseInt(cameraId),
        snapshotUrl,
        confidence: parseInt(confidence),
        status: "pending",
        notes: null,
      });

      res.json(detection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/detections/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const detection = await storage.updateDetection(id, updates);
      if (!detection) {
        return res.status(404).json({ message: "Detection not found" });
      }
      res.json(detection);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const [
        alertsToday,
        cameras,
        faces,
        recentDetections
      ] = await Promise.all([
        storage.getTodayDetectionCount(),
        storage.getCameras(),
        storage.getFaces(),
        storage.getRecentDetections(1)
      ]);

      const camerasOnline = cameras.filter(c => c.isActive).length;
      const totalCameras = cameras.length;
      const facesInGallery = faces.length;
      const lastAlert = recentDetections[0]?.detectedAt || null;

      res.json({
        alertsToday,
        camerasOnline: `${camerasOnline}/${totalCameras}`,
        facesInGallery,
        lastAlert: lastAlert ? new Date(lastAlert).toLocaleString() : "No alerts yet"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Settings routes
  app.get("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.createSettings({
          userId: req.user.id,
          language: "en",
          theme: "dark",
          alertSound: true,
          emailNotifications: false,
          dataRetentionDays: 30,
        });
        return res.json(defaultSettings);
      }
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/settings", authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateSettings(req.user.id, updates);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
