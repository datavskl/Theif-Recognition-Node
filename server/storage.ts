import { 
  users, cameras, faces, detections, settings,
  type User, type InsertUser,
  type Camera, type InsertCamera,
  type Face, type InsertFace,
  type Detection, type InsertDetection,
  type Settings, type InsertSettings
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cameras: Map<number, Camera> = new Map();
  private faces: Map<number, Face> = new Map();
  private detections: Map<number, Detection> = new Map();
  private settings: Map<number, Settings> = new Map();
  private currentUserId = 1;
  private currentCameraId = 1;
  private currentFaceId = 1;
  private currentDetectionId = 1;
  private currentSettingsId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const admin: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@example.com",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(admin.id, admin);

    // Create default camera
    const defaultCamera: Camera = {
      id: this.currentCameraId++,
      name: "Main Entrance",
      location: "Front Door",
      streamUrl: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.cameras.set(defaultCamera.id, defaultCamera);

    // Create default settings for admin
    const defaultSettings: Settings = {
      id: this.currentSettingsId++,
      userId: admin.id,
      language: "en",
      theme: "dark",
      alertSound: true,
      emailNotifications: false,
      dataRetentionDays: 30,
    };
    this.settings.set(admin.id, defaultSettings);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      role: insertUser.role || "staff",
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Cameras
  async getCameras(): Promise<Camera[]> {
    return Array.from(this.cameras.values());
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const camera: Camera = {
      ...insertCamera,
      streamUrl: insertCamera.streamUrl || null,
      isActive: insertCamera.isActive ?? true,
      id: this.currentCameraId++,
      createdAt: new Date(),
    };
    this.cameras.set(camera.id, camera);
    return camera;
  }

  async updateCamera(id: number, updates: Partial<Camera>): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;
    const updatedCamera = { ...camera, ...updates };
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  // Faces
  async getFaces(): Promise<Face[]> {
    return Array.from(this.faces.values());
  }

  async getFace(id: number): Promise<Face | undefined> {
    return this.faces.get(id);
  }

  async createFace(insertFace: InsertFace): Promise<Face> {
    const face: Face = {
      ...insertFace,
      tag: insertFace.tag || "thief",
      notes: insertFace.notes || null,
      id: this.currentFaceId++,
      createdAt: new Date(),
    };
    this.faces.set(face.id, face);
    return face;
  }

  async updateFace(id: number, updates: Partial<Face>): Promise<Face | undefined> {
    const face = this.faces.get(id);
    if (!face) return undefined;
    const updatedFace = { ...face, ...updates };
    this.faces.set(id, updatedFace);
    return updatedFace;
  }

  async deleteFace(id: number): Promise<boolean> {
    return this.faces.delete(id);
  }

  async searchFaces(query: string): Promise<Face[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.faces.values()).filter(face => 
      face.name.toLowerCase().includes(lowerQuery) ||
      face.tag.toLowerCase().includes(lowerQuery) ||
      (face.notes && face.notes.toLowerCase().includes(lowerQuery))
    );
  }

  // Detections
  async getDetections(): Promise<Detection[]> {
    return Array.from(this.detections.values()).sort((a, b) => 
      b.detectedAt.getTime() - a.detectedAt.getTime()
    );
  }

  async getDetection(id: number): Promise<Detection | undefined> {
    return this.detections.get(id);
  }

  async createDetection(insertDetection: InsertDetection): Promise<Detection> {
    const detection: Detection = {
      ...insertDetection,
      status: insertDetection.status || "pending",
      notes: insertDetection.notes || null,
      faceId: insertDetection.faceId || null,
      id: this.currentDetectionId++,
      detectedAt: new Date(),
    };
    this.detections.set(detection.id, detection);
    return detection;
  }

  async updateDetection(id: number, updates: Partial<Detection>): Promise<Detection | undefined> {
    const detection = this.detections.get(id);
    if (!detection) return undefined;
    const updatedDetection = { ...detection, ...updates };
    this.detections.set(id, updatedDetection);
    return updatedDetection;
  }

  async getRecentDetections(limit = 10): Promise<Detection[]> {
    const allDetections = await this.getDetections();
    return allDetections.slice(0, limit);
  }

  async getDetectionsByStatus(status: string): Promise<Detection[]> {
    return Array.from(this.detections.values()).filter(d => d.status === status);
  }

  async getTodayDetectionCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.detections.values()).filter(d => 
      d.detectedAt >= today
    ).length;
  }

  // Settings
  async getUserSettings(userId: number): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const settings: Settings = {
      ...insertSettings,
      language: insertSettings.language || "en",
      theme: insertSettings.theme || "dark",
      alertSound: insertSettings.alertSound ?? true,
      emailNotifications: insertSettings.emailNotifications ?? false,
      dataRetentionDays: insertSettings.dataRetentionDays || 30,
      id: this.currentSettingsId++,
    };
    this.settings.set(settings.userId, settings);
    return settings;
  }

  async updateSettings(userId: number, updates: Partial<Settings>): Promise<Settings | undefined> {
    const settings = this.settings.get(userId);
    if (!settings) return undefined;
    const updatedSettings = { ...settings, ...updates };
    this.settings.set(userId, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
