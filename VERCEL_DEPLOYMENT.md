# Deploying MedNutri to Vercel

This guide will walk you through deploying the MedNutri Elderly Care Platform to Vercel.

## Prerequisites

1. **GitHub Account** - Your code is already on GitHub
2. **Vercel Account** - Sign up at https://vercel.com (free tier available)
3. **API Keys** - Have your API keys ready:
   - OpenAI API Key
   - Google Gemini API Key
   - Polygon RPC URL
   - Contract Address

---

## Step 1: Prepare Your Project

### Important: Project Structure

This project contains both:
- **Frontend**: Next.js app in `/frontend` directory (deploys to Vercel)
- **Backend**: Python Streamlit app in `/backend` directory (runs separately)

The root `vercel.json` and `.vercelignore` files are already configured to deploy only the frontend.

### 1.1 Verify vercel.json configuration

The project already has a root `vercel.json` file configured correctly:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "installCommand": "cd frontend && npm install"
}
```

This tells Vercel to:
- Navigate to the `frontend` directory
- Install dependencies
- Build the Next.js app
- Use the `.next` folder as output

### 1.2 Update package.json scripts

Ensure your `frontend/package.json` has the correct build script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

2. **Import Your Repository**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Find and select `kalamkaar9404/elderlycare`
   - Click "Import"

3. **Configure Project Settings**
   
   **Framework Preset**: Next.js (should auto-detect)
   
   **Root Directory**: Leave as `.` (root)
   - The `vercel.json` file handles the frontend directory automatically
   - Do NOT change the root directory in Vercel settings

   **Build Settings**:
   - Build Command: `cd frontend && npm install && npm run build` (from vercel.json)
   - Output Directory: `frontend/.next` (from vercel.json)
   - Install Command: `cd frontend && npm install` (from vercel.json)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
   ```

   **Important**: 
   - Variables starting with `NEXT_PUBLIC_` are exposed to the browser
   - Other variables are server-side only
   - Add each variable one by one

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `mednutri-elderly-care`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Add Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add GEMINI_API_KEY
   vercel env add NEXT_PUBLIC_POLYGON_RPC_URL
   vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Step 3: Configure Environment Variables

### Required Environment Variables

Create these in Vercel Dashboard → Your Project → Settings → Environment Variables:

#### Server-Side Variables (Secret)
```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

#### Client-Side Variables (Public)
```env
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### How to Get API Keys

**OpenAI API Key**:
1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and save it (you won't see it again)

**Google Gemini API Key**:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Polygon RPC URL**:
- Use public RPC: `https://rpc-amoy.polygon.technology`
- Or get your own from https://www.alchemy.com or https://infura.io

---

## Step 4: Verify Deployment

### Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the "Building" tab for any errors
4. Common issues:
   - Missing environment variables
   - Build errors in code
   - Incorrect root directory

### Test Your Deployment

Visit your deployed URL and test:

1. **Homepage** - Should load without errors
2. **Patient Portal** - Navigate to `/patient-portal`
3. **AI Chatbot** - Try asking a question
4. **Document Upload** - Test file upload
5. **Vitals Display** - Check if charts render

---

## Step 5: Custom Domain (Optional)

### Add Your Own Domain

1. **In Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain (e.g., `mednutri.care`)

2. **Configure DNS**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add these DNS records:
   
   **For root domain (mednutri.care)**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For www subdomain**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS Propagation** (5-48 hours)

4. **SSL Certificate** - Vercel automatically provisions SSL

---

## Step 6: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Manual Deployment

```bash
cd frontend
vercel --prod
```

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Solution: Ensure all dependencies are in package.json
cd frontend
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

**Error**: "Environment variable not found"
```bash
# Solution: Add missing environment variables in Vercel Dashboard
# Settings → Environment Variables → Add
```

### Runtime Errors

**Error**: "API route not found"
- Check that API routes are in `frontend/app/api/` directory
- Verify route naming matches imports

**Error**: "CORS issues"
- Add CORS headers in `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
}
```

### Performance Issues

**Slow Loading**:
1. Enable Image Optimization in `next.config.mjs`
2. Use Vercel Analytics to identify bottlenecks
3. Implement caching strategies

---

## Step 7: Monitoring & Analytics

### Enable Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable "Web Analytics"
3. View real-time metrics:
   - Page views
   - Unique visitors
   - Performance scores
   - Core Web Vitals

### Enable Speed Insights

1. Install package:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Add to `frontend/app/layout.tsx`:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

---

## Step 8: Environment-Specific Configurations

### Development vs Production

Create different environment variable sets:

**Development**:
- Use test API keys
- Use Polygon Amoy testnet
- Enable debug logging

**Production**:
- Use production API keys
- Consider Polygon mainnet (if ready)
- Disable debug logging

### Set Environment for Each Branch

In Vercel Dashboard:
- Production: `main` branch
- Preview: All other branches
- Development: Local only

---

## Cost Considerations

### Vercel Free Tier Includes:
- Unlimited deployments
- 100 GB bandwidth per month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

### Paid Plans (if needed):
- **Pro**: $20/month - 1TB bandwidth, advanced analytics
- **Enterprise**: Custom pricing - dedicated support, SLA

### API Costs:
- **OpenAI**: Pay per token (~$0.002 per 1K tokens)
- **Gemini**: Free tier available, then pay per request
- **Polygon Amoy**: Free (testnet)

---

## Security Best Practices

### 1. Protect API Keys
- Never commit API keys to Git
- Use Vercel environment variables
- Rotate keys regularly

### 2. Enable Security Headers

Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

### 3. Rate Limiting
- Implement rate limiting for API routes
- Use Vercel Edge Config for rate limit storage

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables added to Vercel
- [ ] API keys are valid and have sufficient credits
- [ ] Smart contracts deployed to Polygon Amoy
- [ ] Contract address updated in environment variables
- [ ] All dependencies listed in package.json
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in browser
- [ ] All features tested (upload, chat, vitals)
- [ ] Mobile responsiveness checked
- [ ] Accessibility tested
- [ ] Performance optimized (Lighthouse score >90)
- [ ] Security headers configured
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error monitoring set up

---

## Post-Deployment

### 1. Test Everything
- Visit all pages
- Test all features
- Check mobile view
- Test on different browsers

### 2. Monitor Performance
- Check Vercel Analytics
- Monitor API usage
- Watch for errors in logs

### 3. Set Up Alerts
- Configure Vercel notifications
- Set up error tracking (Sentry)
- Monitor uptime (UptimeRobot)

---

## Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy to preview
cd frontend
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm deployment-url
```

---

## Support

**Vercel Documentation**: https://vercel.com/docs
**Vercel Support**: https://vercel.com/support
**Community**: https://github.com/vercel/vercel/discussions

---

## Summary

Your MedNutri Elderly Care Platform is now deployed on Vercel! 

**Your deployment URL**: `https://your-project-name.vercel.app`

Every push to GitHub will automatically trigger a new deployment. Preview deployments are created for pull requests, making it easy to test changes before merging.

**Next Steps**:
1. Share your deployment URL
2. Monitor analytics and performance
3. Gather user feedback
4. Iterate and improve

Good luck with your deployment!
