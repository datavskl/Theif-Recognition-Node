# AI Thief Face Recognition & Alert System

## Overview

This is a fullstack web application designed for supermarkets and small vendors to detect known thieves using live camera feeds with real-time face recognition. The system provides instant alerts, comprehensive logging, and role-based user management.

## System Architecture

The application follows a modern fullstack architecture with clear separation between frontend and backend:

- **Frontend**: React 18 with TypeScript and Vite for development
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Face Recognition**: Browser-based using face-api.js (TensorFlow.js)
- **Authentication**: JWT-based with bcrypt password hashing
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build System**: Vite for client bundling, esbuild for server bundling

## Key Components

### Frontend Architecture
- **React SPA** with wouter for client-side routing
- **Component System**: shadcn/ui components for consistent UI
- **State Management**: TanStack Query for server state, React Context for auth
- **Real-time Processing**: Face detection and recognition in browser using webcam
- **Internationalization**: i18next for multi-language support (English/Hindi)
- **Theme System**: Dark/light mode with CSS custom properties

### Backend Architecture
- **Express.js API** with TypeScript for type safety
- **RESTful Routes**: Organized route handlers for different resources
- **Middleware**: JWT authentication, request logging, error handling
- **File Upload**: Multer for handling face image uploads
- **Storage Interface**: Abstracted storage layer supporting multiple implementations

### Database Schema
The application uses five main tables:
- **users**: Authentication and role management (admin/staff)
- **cameras**: Camera configuration and management
- **faces**: Known thief profiles with face embeddings
- **detections**: Face recognition events and alerts
- **settings**: User preferences and system configuration

### Face Recognition System
- **Browser-based Processing**: Uses face-api.js for real-time detection
- **Face Embeddings**: Stores mathematical representations for matching
- **Real-time Alerts**: Sound and visual notifications for matches
- **Confidence Scoring**: Configurable threshold for detection sensitivity

## Data Flow

1. **User Authentication**: JWT tokens stored in localStorage
2. **Camera Feed**: Browser webcam access via getUserMedia API
3. **Face Detection**: Continuous processing of video frames
4. **Face Matching**: Compare detected faces with stored embeddings
5. **Alert Generation**: Trigger notifications and log events
6. **Data Persistence**: Store detection events and snapshots

## External Dependencies

### Core Dependencies
- **pg**: PostgreSQL client used to connect to Supabase
- **drizzle-orm**: Type-safe database ORM
- **face-api.js**: Browser-based face recognition
- **@tanstack/react-query**: Server state management
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui**: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

## Deployment Strategy

The application is designed for Replit deployment with the following configuration:

- **Development**: `npm run dev` - Runs both client and server with hot reload
- **Build**: `npm run build` - Creates optimized production bundles
- **Production**: `npm start` - Serves built application
- **Database**: Uses environment variable `SUPABASE_DB_URL` (with optional `DATABASE_URL` fallback) for Supabase Postgres connection
- **File Storage**: Local filesystem for uploaded images (uploads/ directory)

The build process creates:
- Client bundle in `dist/public/` for static file serving
- Server bundle in `dist/` as ESM module for Node.js execution

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.