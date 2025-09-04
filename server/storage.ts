import { 
  users, cameras, faces, detections, settings,
  type User, type InsertUser,
  type Camera, type InsertCamera,
  type Face, type InsertFace,
  type Detection, type InsertDetection,
  type Settings, type InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, sql, ilike, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Cameras
  getCameras(): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, updates: Partial<Camera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  
  // Faces
  getFaces(): Promise<Face[]>;
  getFace(id: number): Promise<Face | undefined>;
  createFace(face: InsertFace): Promise<Face>;
  updateFace(id: number, updates: Partial<Face>): Promise<Face | undefined>;
  deleteFace(id: number): Promise<boolean>;
  searchFaces(query: string): Promise<Face[]>;
  
  // Detections
  getDetections(): Promise<Detection[]>;
  getDetection(id: number): Promise<Detection | undefined>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  updateDetection(id: number, updates: Partial<Detection>): Promise<Detection | undefined>;
  getRecentDetections(limit?: number): Promise<Detection[]>;
  getDetectionsByStatus(status: string): Promise<Detection[]>;
  getTodayDetectionCount(): Promise<number>;
  
  // Settings
  getUserSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, updates: Partial<Settings>): Promise<Settings | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const existingAdmin = await this.getUserByEmail("admin@example.com");
      if (!existingAdmin) {
        // Create default admin user
        const hashedPassword = await bcrypt.hash("password", 10);
        const admin = await this.createUser({
          username: "admin",
          email: "admin@example.com",
          password: hashedPassword,
          role: "admin",
        });

        // Create default camera
        await db.insert(cameras).values({
          name: "Main Entrance",
          location: "Front Door",
          isActive: true,
        });

        // Create default settings for admin
        await this.createSettings({
          userId: admin.id,
          language: "en",
          theme: "dark",
          alertSound: true,
          emailNotifications: false,
          dataRetentionDays: 30,
        });
      }
    } catch (error) {
      // Ignore initialization errors - database might not be ready yet
      console.warn('Database initialization warning:', error);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Cameras
  async getCameras(): Promise<Camera[]> {
    return await db.select().from(cameras);
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    const [camera] = await db.select().from(cameras).where(eq(cameras.id, id));
    return camera || undefined;
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const [camera] = await db
      .insert(cameras)
      .values(insertCamera)
      .returning();
    return camera;
  }

  async updateCamera(id: number, updates: Partial<Camera>): Promise<Camera | undefined> {
    const [camera] = await db
      .update(cameras)
      .set(updates)
      .where(eq(cameras.id, id))
      .returning();
    return camera || undefined;
  }

  async deleteCamera(id: number): Promise<boolean> {
    const result = await db
      .delete(cameras)
      .where(eq(cameras.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Faces
  async getFaces(): Promise<Face[]> {
    return await db.select().from(faces);
  }

  async getFace(id: number): Promise<Face | undefined> {
    const [face] = await db.select().from(faces).where(eq(faces.id, id));
    return face || undefined;
  }

  async createFace(insertFace: InsertFace): Promise<Face> {
    const [face] = await db
      .insert(faces)
      .values(insertFace)
      .returning();
    return face;
  }

  async updateFace(id: number, updates: Partial<Face>): Promise<Face | undefined> {
    const [face] = await db
      .update(faces)
      .set(updates)
      .where(eq(faces.id, id))
      .returning();
    return face || undefined;
  }

  async deleteFace(id: number): Promise<boolean> {
    const result = await db
      .delete(faces)
      .where(eq(faces.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchFaces(query: string): Promise<Face[]> {
    return await db
      .select()
      .from(faces)
      .where(
        or(
          ilike(faces.name, `%${query}%`),
          ilike(faces.tag, `%${query}%`),
          ilike(faces.notes, `%${query}%`)
        )
      );
  }

  // Detections
  async getDetections(): Promise<Detection[]> {
    return await db
      .select()
      .from(detections)
      .orderBy(desc(detections.detectedAt));
  }

  async getDetection(id: number): Promise<Detection | undefined> {
    const [detection] = await db.select().from(detections).where(eq(detections.id, id));
    return detection || undefined;
  }

  async createDetection(insertDetection: InsertDetection): Promise<Detection> {
    const [detection] = await db
      .insert(detections)
      .values(insertDetection)
      .returning();
    return detection;
  }

  async updateDetection(id: number, updates: Partial<Detection>): Promise<Detection | undefined> {
    const [detection] = await db
      .update(detections)
      .set(updates)
      .where(eq(detections.id, id))
      .returning();
    return detection || undefined;
  }

  async getRecentDetections(limit = 10): Promise<Detection[]> {
    return await db
      .select()
      .from(detections)
      .orderBy(desc(detections.detectedAt))
      .limit(limit);
  }

  async getDetectionsByStatus(status: string): Promise<Detection[]> {
    return await db
      .select()
      .from(detections)
      .where(eq(detections.status, status));
  }

  async getTodayDetectionCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(detections)
      .where(gte(detections.detectedAt, today));
    return result.count;
  }

  // Settings
  async getUserSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings || undefined;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [userSettings] = await db
      .insert(settings)
      .values(insertSettings)
      .returning();
    return userSettings;
  }

  async updateSettings(userId: number, updates: Partial<Settings>): Promise<Settings | undefined> {
    const [userSettings] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.userId, userId))
      .returning();
    return userSettings || undefined;
  }
}

export const storage = new DatabaseStorage();
