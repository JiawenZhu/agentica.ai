# Agentica.ai Local Development Setup Guide

## Prerequisites
- Node.js 18+ 
- npm or yarn package manager

## Setup Steps

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Verify File Structure
Ensure these files exist in your project root:
- `tailwind.config.js`
- `postcss.config.js`  
- `vite.config.ts`
- `tsconfig.json`
- `package.json`
- `index.html`
- `main.tsx`
- `styles/globals.css`

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Common Issues & Solutions

### Issue 1: Styles Not Loading
**Symptoms:** UI looks unstyled, no colors or spacing
**Solutions:**
1. Check that `styles/globals.css` is imported in `main.tsx`
2. Verify Tailwind is processing CSS: Look for Tailwind classes in browser dev tools
3. Clear browser cache and restart dev server
4. Check PostCSS configuration is correct

### Issue 2: Custom Animations Not Working
**Symptoms:** `animate-float`, `animate-glow` etc. not animating
**Solutions:**
1. Ensure `tailwind.config.js` includes the animation definitions
2. Check browser dev tools for CSS custom properties
3. Verify keyframes are being generated

### Issue 3: TypeScript Errors
**Symptoms:** Import errors, type errors
**Solutions:**
1. Check `tsconfig.json` path mappings
2. Ensure all dependencies are installed
3. Restart TypeScript language server in your IDE

### Issue 4: Missing Dependencies
**Symptoms:** Import errors for specific packages
**Solutions:**
1. Install specific versions: `npm install sonner@2.0.3`
2. Check package.json matches the one provided
3. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Issue 5: Dark Mode Issues
**Symptoms:** Dark mode colors not working
**Solutions:**
1. Check CSS custom properties in browser dev tools
2. Verify `:root` and `.dark` selectors in globals.css
3. Toggle dark mode class on html/body element

## Vite-Specific Issues

### Hot Reload Not Working
```bash
# Clear Vite cache
rm -rf .vite
npm run dev
```

### Build Issues
```bash
# Type check
npx tsc --noEmit

# Build
npm run build
```

## Browser Compatibility
- Chrome 88+
- Firefox 78+  
- Safari 14+
- Edge 88+

## Performance Tips
1. Use browser dev tools to check CSS loading
2. Verify no console errors
3. Check network tab for failed asset loads
4. Use React Developer Tools to inspect component tree

## Additional Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Router Documentation](https://reactrouter.com/)

If you're still experiencing issues, please check:
1. Node.js version (`node --version`)
2. Package manager version (`npm --version`)
3. Browser console for errors
4. Network tab for failed requests