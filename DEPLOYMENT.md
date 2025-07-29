# Deploying Typey.site

## Quick Deployment to Netlify

### Option 1: Drag & Drop (Easiest)
1. Run `npm run build` to create the `dist` folder
2. Go to [Netlify](https://netlify.com) and create an account
3. Drag the entire `dist` folder to the Netlify deploy area
4. Your site will be live instantly with a random URL
5. In Site Settings > Domain Management, add your custom domain `typey.site`

### Option 2: Git Integration (Recommended)
1. Push this project to a GitHub repository
2. Connect Netlify to your GitHub account
3. Import the repository in Netlify
4. Netlify will automatically detect the build settings from `netlify.toml`
5. Every push to main branch will automatically redeploy

## DNS Configuration

Once your site is deployed on Netlify:

1. **In Netlify Dashboard:**
   - Go to Site Settings > Domain Management
   - Add domain: `typey.site`
   - Add domain: `www.typey.site` (optional)

2. **In your domain registrar (where you bought typey.site):**
   - Set A records to point to Netlify's load balancer:
     - `75.2.60.5`
   - Or use CNAME record pointing to your-site-name.netlify.app

3. **SSL Certificate:**
   - Netlify will automatically provision a free SSL certificate
   - Your site will be available at `https://typey.site`

## Alternative Hosting Options

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to deploy
4. Configure domain in Vercel dashboard

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts: `"deploy": "gh-pages -d dist"`
3. Run `npm run build && npm run deploy`
4. Configure custom domain in GitHub repository settings

## Build Details

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18 or higher
- **Framework:** Vue.js 3 with Vite

## Environment Variables

No environment variables are required for this application.