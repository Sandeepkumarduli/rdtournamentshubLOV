# Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Method 1: Drag & Drop (Easiest)
1. Run `npm run build` to create the `dist` folder
2. Go to [netlify.com](https://netlify.com) and sign in
3. Drag the `dist` folder to the deploy area
4. Your site will be live instantly!

### Method 2: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy!

## 🔧 Configuration Files Added

### `public/_redirects`
```
/*    /index.html   200
```
This ensures all routes redirect to `index.html` so React Router can handle them.

### `netlify.toml`
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## ✅ What This Fixes

- **No more "Page not found" errors** when refreshing
- **Direct URL access works** (e.g., `/dashboard`, `/org-dashboard`)
- **Proper SPA routing** on Netlify
- **Authentication state preserved** on refresh

## 🎯 Environment Variables

Make sure to set these in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🚀 Ready to Deploy!

Your app is now configured for Netlify deployment with proper SPA routing!
