# 📦 Publishing mcp-server-starter to npm

This guide walks you through publishing your package to npm and testing it.

## 🎯 Pre-Publication Checklist

✅ **Completed:**
- [x] Package.json metadata updated (author, repository, bugs, homepage)
- [x] README.md created with usage examples
- [x] LICENSE file created (MIT)
- [x] .npmignore created (excludes test files and source)
- [x] Build successful (`npm run build`)
- [x] Package preview shows correct files (`npm pack --dry-run`)

## 📝 Step-by-Step Publication Process

### Step 1: Create npm Account (if you don't have one)

1. Go to https://www.npmjs.com/signup
2. Create an account
3. Verify your email address

### Step 2: Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### Step 3: Check Package Name Availability

```bash
npm view mcp-server-starter
```

**If it shows "404"** → Name is available! ✅
**If it shows package info** → Name is taken, need to change it ❌

### Step 4: Final Pre-Publish Checks

```bash
# Clean and rebuild
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Preview package contents
npm pack --dry-run
```

### Step 5: Publish to npm!

For your first publication:

```bash
npm publish
```

**That's it!** Your package is now live on npm! 🎉

### Step 6: Verify Publication

```bash
# Check your package on npm
npm view mcp-server-starter

# Or visit in browser
# https://www.npmjs.com/package/mcp-server-starter
```

---

## 🧪 Testing the Published Package

### Test 1: Install Globally and Use

```bash
# Install your package globally
npm install -g mcp-server-starter

# Test the CLI
mcp-server-starter --help

# Create a test server
cd ~/Desktop
mcp-server-starter init --name test-server
cd test-server
npm install
npm run build
npm start
```

**Expected Result:** Server starts successfully ✅

### Test 2: Use with npx (No Installation)

```bash
# Create a new test directory
mkdir ~/test-mcp-package
cd ~/test-mcp-package

# Run directly with npx
npx mcp-server-starter init --name my-test-server

# Follow the workflow
cd my-test-server
npm install
npm run build
npm start
```

**Expected Result:** Works without installing ✅

### Test 3: Add a Tool

```bash
# Inside your test server
npx mcp-server-starter add-tool --name calculator

# Verify file created
cat src/mcp/tools/calculator.ts

# Verify registry updated
cat src/mcp/tools/index.ts

# Rebuild and test
npm run build
npm start
```

**Expected Result:** Tool added and server starts ✅

### Test 4: Test from Different Machine (Optional)

```bash
# On another computer or in a fresh VM
npx mcp-server-starter@latest init --name fresh-test
cd fresh-test
npm install && npm run build && npm start
```

---

## 🔄 Publishing Updates (Future Versions)

When you add Phase 5 or make improvements:

### Update Version

```bash
# For bug fixes (0.1.0 → 0.1.1)
npm version patch

# For new features (0.1.0 → 0.2.0)
npm version minor

# For breaking changes (0.1.0 → 1.0.0)
npm version major
```

This will:
1. Update version in package.json
2. Create a git commit
3. Create a git tag

### Publish Update

```bash
npm publish
```

### Using Changesets (Recommended for Team Work)

```bash
# Create a changeset
npm run changeset

# Version packages (bumps version based on changesets)
npm run version

# Publish
npm run release
```

---

## 🐛 Troubleshooting

### Issue: "You do not have permission to publish"

**Solution:**
```bash
# Make sure you're logged in
npm whoami

# Check package name isn't taken
npm view mcp-server-starter

# If taken, change name in package.json and try again
```

### Issue: "Package name too similar to existing package"

**Solution:** Change the name in `package.json`:
```json
{
  "name": "@yourusername/mcp-server-starter",
  // or
  "name": "mcp-server-starter-cli"
}
```

### Issue: "Version already published"

**Solution:**
```bash
# Bump version
npm version patch

# Try again
npm publish
```

### Issue: "Missing README"

**Solution:** README.md already created, but verify:
```bash
ls -la README.md
```

---

## 📊 Package Statistics

After publishing, you can track:

- **Downloads:** https://www.npmjs.com/package/mcp-server-starter
- **Bundle Size:** https://bundlephobia.com/package/mcp-server-starter
- **Package Info:** `npm view mcp-server-starter`

---

## ✅ Success Criteria

Your package is successfully published when:

1. ✅ `npm view mcp-server-starter` shows your package
2. ✅ `npx mcp-server-starter --help` works without installation
3. ✅ `npx mcp-server-starter init --name test` creates a project
4. ✅ Generated project builds and runs successfully
5. ✅ `add-tool` command works in generated projects
6. ✅ Package appears on npmjs.com

---

## 🎉 Post-Publication

### Share Your Package!

- ✅ Add npm badge to README
- ✅ Tweet about it
- ✅ Share on Reddit (r/typescript, r/node, r/programming)
- ✅ Share on Discord (MCP community)
- ✅ Write a blog post
- ✅ Add to awesome-mcp lists

### Monitor Usage

```bash
# Check download stats
npm view mcp-server-starter

# Check in npm dashboard
# https://www.npmjs.com/settings/yourusername/packages
```

---

## 🚀 Next Steps After Publication

1. **Test thoroughly** - Try installing and using on different machines
2. **Gather feedback** - Share with community, get issues/suggestions
3. **Fix bugs** - Release patch versions as needed
4. **Add Phase 5** - Implement examples preset and HTTP adapter
5. **Write documentation** - Create detailed guides and tutorials
6. **Create examples** - Show real-world MCP servers built with your tool

---

## 📋 Quick Command Reference

```bash
# Login
npm login

# Check name availability
npm view mcp-server-starter

# Publish
npm publish

# Test globally
npm install -g mcp-server-starter
mcp-server-starter --help

# Test with npx
npx mcp-server-starter init --name test

# Unpublish (within 72 hours only)
npm unpublish mcp-server-starter@0.1.0 --force

# Update version
npm version patch
npm publish
```

---

**Good luck with your publication! 🎊**

Your package is ready to help developers build MCP servers faster!
