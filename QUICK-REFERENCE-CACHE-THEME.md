# Quick Reference: Caching & Theme

## Local Storage Caching

### Auto-Cached Events
```
? Load data from file
? Save data to file
? Add/edit/delete entry
? Add/edit/delete type
? Apply/clear filters
```

### Cache Location
```
Browser localStorage:
- timeTrackerCachedData (main data)
- timeTrackerCachedFileName (file name)
- timeTrackerCachedFilters (filter state)
```

### Manual Control (Console)
```javascript
// Check cache
CacheManager.hasCache()

// Clear cache
CacheManager.clearCache()

// Force save
CacheManager.saveCache()
```

---

## Dark Theme Colors

### Neutral Grays
```css
Backgrounds: #0d0d0d ? #333333
Borders: #2d2d2d ? #595959
Text: #808080 ? #e8e8e8
```

### Soft Accents
```css
Primary: #5b9bd5 (soft blue)
Success: #6baa75 (soft green)
Warning: #d9a85c (soft amber)
Danger: #c75c5c (soft red)
```

### Typography
```css
Font: Inter (Google Fonts)
Weights: 400, 500, 600, 700
Fallback: System fonts
Monospace: JetBrains Mono
```

---

## Quick Tests

### Caching Works?
1. Add an entry
2. Refresh page (F5)
3. Entry still there ?

### Theme Applied?
1. Check background = pure black (not blue)
2. Check text = high contrast white
3. Check buttons = soft blue accent

---

## Customization

### Change Accent Color
Edit `style.css`:
```css
:root {
  --accent-primary: #YOUR_COLOR;
}
```

### Change Background Darkness
```css
:root {
  --bg-primary: #0d0d0d; /* Lighter or darker */
}
```

### Disable Caching
Comment out in `script.js`:
```javascript
// CacheManager.saveCache(); // Disabled
```

---

## Storage Limits

Chrome/Firefox/Edge: ~10MB
Safari: ~5MB

If exceeded:
1. Save to file manually
2. Clear cache
3. Continue working

---

## Browser Support

Caching: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
Theme: All modern browsers
Fonts: Online only (offline = fallback)
