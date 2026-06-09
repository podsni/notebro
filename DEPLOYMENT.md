# Deploying NoteBro to Vercel

This guide will help you deploy NoteBro to Vercel for free hosting.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier available)
- [Vercel CLI](https://vercel.com/docs/cli) installed (optional)
- Git repository pushed to GitHub

## Method 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `podsni/notebro`
4. Vercel will automatically detect the configuration from `vercel.json`
5. Click **"Deploy"**
6. Wait for the build to complete (usually 1-2 minutes)
7. Your app will be live at `https://notebro-[random].vercel.app`

### Custom Domain (Optional)

1. In your project settings, go to **"Domains"**
2. Add your custom domain
3. Follow the DNS configuration instructions

## Method 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
bun run deploy
```
or
```bash
vercel --prod
```

4. Follow the prompts to link your project
5. Your app will be deployed automatically

## Build Configuration

The project is configured via `vercel.json`:

- **Build Command**: `bun run build`
- **Output Directory**: `dist`
- **Install Command**: `bun install`
- **SPA Routing**: Configured to redirect all routes to `index.html`

## Environment Variables

NoteBro doesn't require any environment variables for basic functionality since it's a client-side app with local storage.

If you add backend features in the future, you can set environment variables in:
- Vercel Dashboard → Project Settings → Environment Variables

## Continuous Deployment

Once connected to your GitHub repository, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run the build command and deploy if successful

## Troubleshooting

### Build Fails

If the build fails on Vercel:

1. Check that all dependencies are in `package.json`
2. Ensure `bun run build` works locally
3. Check the build logs in Vercel dashboard
4. Verify `vercel.json` configuration

### Routes Not Working

If client-side routes don't work:
- Verify `vercel.json` has the rewrite rule for SPA routing
- Check that all routes in your app use wouter (client-side routing)

### Large Bundle Size

If the bundle is too large:
- Run `bun run build` locally and check `dist/` size
- Consider code splitting if needed
- Remove unused dependencies

## Performance

NoteBro is optimized for Vercel deployment:
- ✅ Static site generation (SPA)
- ✅ Client-side only (no server required)
- ✅ IndexedDB for local storage
- ✅ Optimized build with minification
- ✅ Fast CDN delivery via Vercel Edge Network

## Cost

- **Free Tier**: Unlimited deployments, 100GB bandwidth/month
- Perfect for personal use and small teams
- No credit card required

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Issues](https://github.com/podsni/notebro/issues)

---

Happy deploying! 🚀
