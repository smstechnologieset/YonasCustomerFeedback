# Bugfix Requirements Document

## Introduction

The feedback submission app fails when deployed on Vercel because it uses an Express server architecture that is incompatible with Vercel's serverless platform. When users submit feedback, they receive a "Host connection error" alert because the fetch calls to `/api/feedback` and other API routes fail - there is no long-running Express server to handle these requests on Vercel's static hosting infrastructure.

The root cause is that the app bundles an Express server (server.ts) with routes like POST /api/feedback, GET /api/feedback, DELETE /api/feedback/:id, POST /api/admin/login, and POST /api/feedback/seed. Vercel cannot run this bundled server; it requires serverless functions in the `/api` directory instead.

This bugfix will refactor the architecture to use Vercel's serverless function model, where each API route is handled by an individual serverless function rather than a single Express server.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the app is deployed on Vercel and a user submits feedback THEN the fetch call to POST /api/feedback fails with a network error and displays "Host connection error. Please verify the network is active."

1.2 WHEN the app is deployed on Vercel and an admin attempts to log in THEN the fetch call to POST /api/admin/login fails with a network error

1.3 WHEN the app is deployed on Vercel and an admin attempts to view feedback records THEN the fetch call to GET /api/feedback fails with a network error

1.4 WHEN the app is deployed on Vercel and an admin attempts to delete a feedback record THEN the fetch call to DELETE /api/feedback/:id fails with a network error

1.5 WHEN the app is deployed on Vercel and an admin attempts to seed mock data THEN the fetch call to POST /api/feedback/seed fails with a network error

1.6 WHEN the build script runs THEN it bundles server.ts into dist/server.cjs but Vercel cannot execute this long-running Node.js server

### Expected Behavior (Correct)

2.1 WHEN the app is deployed on Vercel and a user submits feedback THEN the system SHALL successfully process the POST /api/feedback request via a serverless function, save the feedback to Firebase, and display the success popup

2.2 WHEN the app is deployed on Vercel and an admin attempts to log in THEN the system SHALL successfully process the POST /api/admin/login request via a serverless function and return an authentication token

2.3 WHEN the app is deployed on Vercel and an admin attempts to view feedback records THEN the system SHALL successfully process the GET /api/feedback request via a serverless function and return all feedback records from Firebase

2.4 WHEN the app is deployed on Vercel and an admin attempts to delete a feedback record THEN the system SHALL successfully process the DELETE /api/feedback/:id request via a serverless function and remove the record from Firebase

2.5 WHEN the app is deployed on Vercel and an admin attempts to seed mock data THEN the system SHALL successfully process the POST /api/feedback/seed request via a serverless function and populate Firebase with sample data

2.6 WHEN the build script runs THEN the system SHALL produce a static frontend build without bundling server.ts, as API routes will be handled by individual serverless functions

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the app runs in local development mode THEN the system SHALL CONTINUE TO function correctly with all API routes working

3.2 WHEN a user submits feedback with valid data (rating, emoji, category, textFeedback) THEN the system SHALL CONTINUE TO create a FeedbackRecord with the same structure (id, rating, emoji, category, textFeedback, createdAt, timestamp)

3.3 WHEN Firebase operations are performed (read, write, delete, seed) THEN the system SHALL CONTINUE TO use the same Firebase Realtime Database service with identical data structures

3.4 WHEN admin authentication is required THEN the system SHALL CONTINUE TO validate credentials using the same token-based authentication mechanism

3.5 WHEN API responses are returned THEN the system SHALL CONTINUE TO use the same JSON response formats (success/error structures)

3.6 WHEN the frontend makes API calls THEN the system SHALL CONTINUE TO use the same endpoint paths (/api/feedback, /api/admin/login, etc.)

3.7 WHEN environment variables are accessed THEN the system SHALL CONTINUE TO read FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_DATABASE_URL, and ADMIN_PASSWORD from the environment
