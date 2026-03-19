# 🚀 PromptForge — Deployment Guide for Angelo

This guide will walk you through getting PromptForge live on the internet. You don't need any coding skills — just follow each step exactly.

**Total time: ~20 minutes**
**Total cost: $0** (everything uses free tiers)

---

## Step 1: Get Your Anthropic API Key (5 min)

This is what powers the AI conversion engine.

1. Go to **https://console.anthropic.com/**
2. Click **"Sign Up"** and create an account (free)
3. Once logged in, click **"API Keys"** in the left sidebar
4. Click **"Create Key"**
5. Name it "PromptForge" and click **Create**
6. **Copy the key** — it starts with `sk-ant-...`
7. Save it somewhere safe (you'll need it in Step 4)

> 💡 New accounts get $5 in free credits — enough for ~500 conversions.

---

## Step 2: Push Your Code to GitHub (5 min)

You already have a GitHub account. Now let's upload the PromptForge code.

### Option A: Using GitHub.com (Easiest — No Terminal Needed)

1. Go to **https://github.com/new**
2. Repository name: `promptforge`
3. Make it **Private** (recommended)
4. Click **"Create repository"**
5. You'll see a page with instructions — **ignore them for now**

Now you need to upload the files. The easiest way:

1. On the new repo page, click **"uploading an existing file"** link
2. Open the `promptforge-app` folder on your computer
3. **Drag ALL files and folders** from the `promptforge-app` folder into the GitHub upload area
4. Click **"Commit changes"**

### Option B: Using Terminal (If You're Comfortable)

Open your terminal/command prompt, navigate to the promptforge-app folder, and run:

```bash
cd path/to/promptforge-app
git init
git add .
git commit -m "Initial commit - PromptForge MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/promptforge.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel (5 min)

Vercel will host your app for free and give you a real URL.

1. Go to **https://vercel.com/**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub
4. Once logged in, click **"Add New..."** → **"Project"**
5. Find your `promptforge` repository and click **"Import"**
6. Vercel will auto-detect it's a Next.js project ✓
7. **IMPORTANT — Before clicking Deploy**, expand **"Environment Variables"**

---

## Step 4: Add Your API Key (2 min)

In the Vercel project setup screen (from Step 3):

1. Under **"Environment Variables"**, add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Paste the API key from Step 1 (starts with `sk-ant-...`)
2. Click **"Add"**
3. Now click **"Deploy"**

Wait 1-2 minutes while Vercel builds and deploys your app.

---

## Step 5: You're Live! 🎉

Vercel will give you a URL like: `https://promptforge-xxxx.vercel.app`

1. Click the URL to open your live app
2. Try pasting an AI tip and clicking "Forge It"
3. Share this URL with anyone!

### Custom Domain (Optional)

Want `promptforge.app` or similar?

1. Buy a domain from **https://namecheap.com** (~$12/year)
2. In Vercel, go to your project → **Settings** → **Domains**
3. Add your domain and follow Vercel's instructions to update DNS

---

## Troubleshooting

**"API key not configured" error:**
- Go to Vercel → your project → Settings → Environment Variables
- Make sure `ANTHROPIC_API_KEY` is set correctly
- After updating, go to Deployments → redeploy the latest

**Build fails:**
- Check the build logs in Vercel for error messages
- Make sure all files were uploaded correctly to GitHub

**Conversion returns errors:**
- Check your Anthropic dashboard for remaining credits
- The content might be too short (needs 10+ characters)

---

## What's Next?

Your MVP is live! Here are your next moves:

1. **Share with 10 people** and ask them to try it
2. **Post about it** on Reddit (r/ClaudeAI, r/ChatGPT), X, and LinkedIn
3. **Collect feedback** — what do people love? What's confusing?
4. **Come back to Cowork** and we'll add features based on feedback

You built this. 🔨
