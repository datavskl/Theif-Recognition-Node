import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"), // "admin" or "staff"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  streamUrl: text("stream_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faces = pgTable("faces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tag: text("tag").notNull().default("thief"), // "thief", "watchlist"
  notes: text("notes"),
  imageUrl: text("image_url").notNull(),
  faceEmbedding: jsonb("face_embedding").notNull(), // Face descriptor array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  faceId: integer("face_id").references(() => faces.id, { onDelete: "cascade" }),
  cameraId: integer("camera_id").references(() => cameras.id).notNull(),
  snapshotUrl: text("snapshot_url").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  status: text("status").notNull().default("pending"), // "pending", "acknowledged", "resolved"
  notes: text("notes"),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  language: text("language").default("en").notNull(),
  theme: text("theme").default("dark").notNull(),
  alertSound: boolean("alert_sound").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(false).notNull(),
  dataRetentionDays: integer("data_retention_days").default(30).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertCameraSchema = createInsertSchema(cameras).pick({
  name: true,
  location: true,
  streamUrl: true,
  isActive: true,
});

export const insertFaceSchema = createInsertSchema(faces).pick({
  name: true,
  tag: true,
  notes: true,
  imageUrl: true,
  faceEmbedding: true,
});

export const insertDetectionSchema = createInsertSchema(detections).pick({
  faceId: true,
  cameraId: true,
  snapshotUrl: true,
  confidence: true,
  status: true,
  notes: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  language: true,
  theme: true,
  alertSound: true,
  emailNotifications: true,
  dataRetentionDays: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type Face = typeof faces.$inferSelect;
export type InsertFace = z.infer<typeof insertFaceSchema>;
export type Detection = typeof detections.$inferSelect;
export type InsertDetection = z.infer<typeof insertDetectionSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "staff"]).default("staff"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
