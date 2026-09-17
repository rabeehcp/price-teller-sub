# Deploying PriceTeller to Vercel

This guide walks you through deploying the **PriceTeller** frontend application to [Vercel](https://vercel.com/).

---

## Architecture Overview

PriceTeller is structured as:
- **Frontend (`client`)**: Vite + React single-page web app.
- **Backend (`server`)**: Express API with PostgreSQL database, hosted on Azure Container Apps (`https://priceteller-api.delightfulwater-3f47513c.koreacentral.azurecontainerapps.io/api`).

### How Vercel Deployment Works

When you deploy to Vercel:
1. **Frontend Hosting**: Vercel serves the static React application from its global edge CDN.
2. **SPA Routing**: Single Page Application routes (`/admin`, `/merchant`, direct page links) automatically rewrite to `/index.html` so direct navigation and refreshes never produce 404 errors.
3. **Zero-CORS API Proxy**: Requests to `/api/*` are reverse-proxied by Vercel edge rewrites to your live backend on Azure Container Apps. This completely avoids browser CORS restrictions.

---

## Method 1: Deploy via Vercel Dashboard (Recommended)

The easiest and most common way to deploy is through the Vercel Web Dashboard:

### Step 1: Push Changes to GitHub
Make sure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Vercel deployment with SPA and API proxy rewrites"
git push origin main
```

### Step 2: Import Project in Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New…** > **Project**.
3. Under **Import Git Repository**, choose your GitHub account and find `price-teller-sub`.
4. Click **Import**.

### Step 3: Configure Project Settings

You can deploy using either of the two directory options below:

#### Option A: Root Directory (Default — No changes needed!)
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm --prefix client run build` (or leave default, loaded from `vercel.json`)
- **Output Directory**: `client/dist` (loaded automatically from `vercel.json`)

#### Option B: Set Root Directory to `client`
- Click **Edit** next to **Root Directory** and select `client`.
- **Framework Preset**: `Vite` (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
*(Note: `client/vercel.json` is already present to handle rewrites for this mode!)*

### Step 4: Environment Variables (Optional)
The application automatically routes to the Azure backend via the Vercel API proxy. If you wish to explicitly set or override the backend URL:
- Go to the **Environment Variables** section.
- Add:
  - **Key**: `VITE_API_BASE_URL`
  - **Value**: `/api` (to use Vercel proxy) or `https://priceteller-api.delightfulwater-3f47513c.koreacentral.azurecontainerapps.io/api` (direct connection)

### Step 5: Click Deploy!
1. Click **Deploy**.
2. Vercel will build and deploy the application in ~30 seconds.
3. Your app will be live at `https://<your-project-name>.vercel.app`!

---

## Method 2: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

1. In your project root (`c:\price-teller-sub`), run:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Choose your Vercel account or team
   - **Link to existing project?**: `N` (or `y` if already created)
   - **What’s your project’s name?**: `priceteller` (or your preferred name)
   - **In which directory is your code located?**: `./` (or `./client`)
3. To deploy to **Production**:
   ```bash
   npx vercel --prod
   ```

---

## Configurations Added to the Project

The following files have been prepared and tested in the codebase:

| File | Purpose |
|------|---------|
| [`vercel.json`](./vercel.json) | Root Vercel config with Vite framework settings, `client/dist` output, SPA rewrites, and `/api/*` reverse proxy. |
| [`client/vercel.json`](./client/vercel.json) | Subfolder Vercel config used when Root Directory is set to `client`. |
| [`client/.env.example`](./client/.env.example) | Template for frontend environment variables. |
| [`client/src/services/api.ts`](./client/src/services/api.ts) | Added `isVercel` detection to route requests via the `/api` rewrite proxy out of the box with zero CORS issues. |

---

## Troubleshooting & Verification

### Testing the Deployment
Once deployed, verify the following:
1. **Home Page**: Open the Vercel URL and check that products, categories, and shops load properly.
2. **Sub-Route Refresh**: Navigate to `/admin` or `/merchant` and refresh the page (press `F5`). The page should reload without a 404 error.
3. **API Proxy Check**: Open your browser DevTools (`F12`) > **Network** tab. API requests should show status `200 OK` routed to `/api/...`.
