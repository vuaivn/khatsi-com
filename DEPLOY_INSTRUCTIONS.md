# 🚀 Vô Ngã Blog Post — Deploy Instructions

## ✅ What's Done

- Blog post markdown: `src/content/blog/vo-nga-anatta.md` (2000 words, 7 FAQ)
- Frontmatter fixed: `category: "phat-hoc"` (matches Astro schema)
- Hero image: minimalist SVG placeholder
- Deploy scripts: `install-and-deploy.mjs` (no npm wrapper needed)

## 🔧 How to Deploy (Run on Your Machine)

**Prerequisites:** Node.js + npm installed

**Step 1: Install dependencies (1 time only)**
```bash
cd khatsi-com
npm install
```

**Step 2: Build + Deploy**
```bash
node install-and-deploy.mjs
```

This will:
1. ✓ Build Astro project (`astro build`)
2. ✓ Deploy to Cloudflare Pages
3. ✓ Verify HTTP 200 on both URLs
4. ✓ Print final status

## ✅ After Deployment

Blog post will be live at:
- https://khatsi.com/blog/vo-nga-anatta/
- https://khatsi-com.pages.dev/blog/vo-nga-anatta/

**Next steps:**
1. Submit to Google Search Console (Request Indexing)
2. Monitor AI citations (ChatGPT, Claude, Perplexity) in 1-7 days
3. Optional: Upgrade hero image to real Gemini-generated (script ready)

---

**Note:** This machine's npm.ps1 is corrupt. Use your own machine with working npm.
