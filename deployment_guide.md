# Deployment Guide

This guide will help you deploy the **Spliit Money Tracking** application.
Important: To keep Real-time features (QR Scan, Live Updates) working, we will deploy the **Client to Vercel** and the **Server to Render**.

## Prerequisites
1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Vercel Account**: For the Frontend.
3.  **Render/Railway Account**: For the Backend (Free tier).

---

## Step 1: Push Code to GitHub
1.  Create a new repository on GitHub.
2.  Push your project code to it.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <YOUR_REPO_URL>
    git push -u origin main
    ```

---

## Step 2: Deploy Server (Backend) to Render
*We use Render because it supports persistent socket connections, unlike Vercel Functions.*

1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configuration**:
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Add these in the "Environment" tab):
    *   `PORT`: `5000` (or `10000`, Render usually sets this automatically)
    *   `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`: Enter your database credentials.
    *   `JWT_SECRET`: Your secret key.
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary keys.
6.  Click **Create Web Service**.
7.  Wait for deployment. **Copy the Service URL** (e.g., `https://my-app-server.onrender.com`).

---

## Step 3: Deploy Client (Frontend) to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste the **Render Server URL** from Step 2 (e.g., `https://my-app-server.onrender.com`).
6.  Click **Deploy**.

---

## Step 4: Final Connection Check
1.  Open your deployed Vercel App URL.
2.  The Frontend should load.
3.  Try logging in. It should talk to the Render backend.
4.  Try scanning a QR code or creating an expense on mobile (using the Vercel URL).

**Troubleshooting:**
*   **CORS Error**: If you see CORS errors in the console, you might need to update your Server's `allowedOrigins` in `src/index.js` to include your Vercel domain (e.g., `https://my-app-client.vercel.app`).
    *   *Note*: The current code is configured to match generic `allowedOrigins`, but adding the specific Vercel domain is best practice.
