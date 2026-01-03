# Deployment Guide

This guide will help you deploy the **Spliit Money Tracking** application.
Important: To keep Real-time features (QR Scan, Live Updates) working, we will deploy the **Client to Vercel** and the **Server to Railway** (Recommended) or Render.

## Prerequisites
1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Vercel Account**: For the Frontend.
3.  **Railway Account**: For the Backend (Free trial available, very stable).

---

## Step 1: Push Code to GitHub (If not done)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

---

## Step 2: Deploy Server (Backend) to Railway (Recommended)
*Railway offers faster builds and better stability than Render.*

1.  Go to [Railway Dashboard](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  **Configuration**:
    *   Click on the backend service card.
    *   **Settings** -> **Root Directory**: Set to `server`.
    *   **Variables**: Add the following:
        *   `PORT`: `5000`
        *   `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`: Database credentials.
        *   `DB_SSL`: `true` (if using a cloud DB).
        *   `JWT_SECRET`: Your secret key.
        *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary keys.
5.  Railway will automatically detect `package.json` in the `server` folder and deploy.
6.  **Copy the Service URL** from the "Settings" -> "Generic Domains" section (e.g., `https://web-production-xxxx.up.railway.app`).

---

## Step 3: Deploy Client (Frontend) to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    *   `VITE_API_URL`: Paste the **Railway Server URL** from Step 2.
6.  Click **Deploy**.

---

## Step 4: Final Connection Check
1.  Open your deployed Vercel App URL.
2.  Try logging in. It should talk to the Railway backend.
3.  **IMPORTANT**: If you previously deployed to Render, make sure you update the `VITE_API_URL` variable in Vercel to point to the new Railway URL.
    *   Go to Vercel Project -> Settings -> Environment Variables -> Edit `VITE_API_URL` -> Redeploy.

---

## Troubleshooting CORS
If you see CORS errors:
1.  Check `server/src/index.js` in your code.
2.  Ensure `vercel.app` is in the `allowedDomains` list (we added this previously).
3.  If using a custom domain on Vercel, add that domain too.
