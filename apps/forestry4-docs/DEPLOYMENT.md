# Forestry4 Docs - Vercel Deployment Guide

This guide covers deploying the Forestry4 documentation site to Vercel.

## ✅ Ready for Deployment

The Forestry4 docs are now fully prepared for Vercel deployment with:
- ✅ Build process optimized (TypeScript checking optional)
- ✅ Snippet system working with auto-sync
- ✅ All routes configured for SPA
- ✅ Static assets optimized with caching headers
- ✅ Code splitting configured for optimal loading

## 🚀 Quick Deploy

### Option 1: Deploy from Monorepo Root (Recommended)
1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `/` (monorepo root)
3. Vercel will automatically use the root `vercel.json` configuration
4. The build will automatically sync snippets and deploy the docs

### Option 2: Deploy Docs App Directly
1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `apps/forestry4-docs`
3. Vercel will use the app-specific `vercel.json` configuration

## ⚙️ Configuration Files

### Root `vercel.json`
- Handles monorepo deployment
- Automatically syncs snippets before build
- Routes all requests to the docs app

### App `vercel.json` (`apps/forestry4-docs/vercel.json`)
- Handles direct app deployment
- Includes caching headers for static assets
- SPA routing configuration

## 🔧 Build Process

The deployment process includes:

1. **Install Dependencies**: `yarn install` (monorepo) or `npm install` (app)
2. **Sync Snippets**: Runs `sync-snippets.sh` to update code examples
3. **Build App**: Runs `npm run build` with Vite
4. **Deploy**: Serves from `dist/` directory

## 📝 Environment Variables

No environment variables are required for basic deployment.

## 🛠️ Local Testing

Test the deployment locally:

```bash
# From monorepo root
npm run docs:sync

# Or from docs directory
cd apps/forestry4-docs
./deploy.sh --preview
```

## 🔍 Troubleshooting

### Build Failures
- Ensure all dependencies are properly installed
- Check that snippet sync script has execute permissions
- Verify TypeScript compilation passes

### Routing Issues
- Ensure `vercel.json` includes SPA routing configuration
- Check that all internal links use React Router patterns

### Performance
- Static assets are cached for 1 year
- Code splitting is configured for optimal loading
- Snippets are served with appropriate cache headers

## 📊 Build Optimization

The build includes:
- **Code Splitting**: Vendor, Chakra UI, and Forestry chunks
- **Asset Optimization**: Images and fonts are optimized
- **Caching**: Long-term caching for static assets
- **Compression**: Gzip compression enabled by default

## 🔗 Useful Commands

```bash
# Sync snippets and build
npm run build:with-sync

# Local development
npm run dev

# Preview production build
npm run preview

# Run tests
npm run test
```
