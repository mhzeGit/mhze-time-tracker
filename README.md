# Time Tracker - Static Web Application (Dark Mode)

A clean, minimalist time-tracking web application built with pure HTML, CSS, and JavaScript. Features a modern **dark theme**, **task type management with colors**, and **stacked charts** for detailed analytics. No frameworks (except Chart.js for visualization), no backend, no server required.

## ? Features

**Core Functionality:**
- ? Add, edit, and delete time entries
- ? Automatic duration calculation
- ? Persistent data storage via JSON files
- ? Load and save data from/to local files

**Task Type Management:**
- ? Create custom task types (Development, Meeting, Research, etc.)
- ? Assign unique colors to each type
- ? Edit and delete task types
- ? Visual color indicators throughout the UI

**Analytics & Insights:**
- ? Daily average time spent
- ? Weekly average time spent
- ? Total time tracking
- ? Per-type breakdowns in charts

**Charts (Chart.js):**
- ? Daily totals - stacked by type (last 7 days)
- ? Weekly totals - stacked by type (last 4 weeks)
- ? Interactive tooltips with precise time breakdowns
- ? Legend showing all task types

**UI/UX:**
- ? **Dark mode only** - easy on the eyes
- ? Clean, minimalist design
- ? Fully responsive (mobile-friendly)
- ? Inline SVG icons (no external CDN dependencies)
- ? Modal-based forms
- ? Real-time duration updates
- ? Smooth animations

## ?? Quick Start

### 1. Local Testing

Simply open `index.html` in any modern web browser:

```bash
# Option 1: Double-click index.html

# Option 2: Using a local server (recommended)
npx serve .
# or
python -m http.server 8000
```

### 2. Load Sample Data

1. Click the "Load Data" button
2. Select `sample-data.json` from the file picker
3. The app will populate with example entries and types

### 3. Add Your First Entry

1. Click the "+ Add Task" button
2. Fill in the form:
   - **Title**: What you worked on
   - **Type**: Select from dropdown (or create new types first)
   - **Date**: When you worked
   - **Start/End Time**: Your working hours
3. Duration is calculated automatically
4. Click "Save"

### 4. Manage Task Types

1. Scroll to "Task Types" section
2. Click "+ Add Type" to create new categories
3. Choose a name and color for each type
4. Edit or delete types as needed

## ?? Data Model

```json
{
  "types": [
    {
      "id": "uuid",
      "name": "string",
      "color": "hex"
    }
  ],
  "entries": [
    {
      "id": "uuid",
      "title": "string",
      "typeId": "uuid",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "durationMinutes": number
    }
  ]
}
```

## ?? Color Customization

Edit CSS variables in `style.css` to customize the dark theme:

```css
:root {
    /* Background Colors */
    --bg-primary: #0f172a;        /* Main background */
    --bg-secondary: #1e293b;      /* Card backgrounds */
    --bg-tertiary: #334155;       /* Elevated surfaces */
    
    /* Accent Colors */
    --accent-primary: #3b82f6;    /* Primary buttons, highlights */
    --accent-success: #10b981;    /* Success states */
    --accent-danger: #ef4444;     /* Delete actions */
    
    /* Text Colors */
    --text-primary: #f1f5f9;      /* Main text */
    --text-secondary: #cbd5e1;    /* Secondary text */
    --text-muted: #94a3b8;        /* Muted text */
}
```

## ?? File Structure

```
time-tracker/
??? index.html          # Main HTML with inline SVG icons
??? style.css          # Dark mode styling
??? script.js          # Application logic with type management
??? sample-data.json   # Example data with types
??? README.md          # This file
??? .gitignore         # Protects your data files
```

## ?? Technical Details

### Architecture

```javascript
App                     // Main application state
??? DataManager         // Load/save/validate data
??? TypeManager         // CRUD for task types
??? EntryManager        // CRUD for entries
??? Analytics           // Statistics with type breakdowns
??? ChartRenderer       // Chart.js integration
??? UIRenderer          // DOM updates
??? ModalManager        // Task modal handling
??? TypeModalManager    // Type modal handling
```

### Dependencies

- **Chart.js 4.4.1** - Loaded from CDN for chart visualization
- All other functionality is vanilla JavaScript

### Icons

- **Inline SVG icons** - No external icon libraries
- Reliable across all static deployments
- Customizable via CSS `stroke` and `fill`

## ?? Charts

### Stacked Bar Charts

Both daily and weekly charts show:
- **Total time** per period (bar height)
- **Per-type breakdown** (stacked colors)
- **Interactive tooltips** with precise hours/minutes
- **Legend** showing all task types with colors

Charts automatically update when:
- New entries are added
- Entries are edited/deleted
- Types are modified

## ?? Data Management

### Loading Data

1. Click "Load Data" button
2. Select your JSON file
3. Data validates and loads automatically
4. UI updates with all entries and types

### Saving Data

**Modern Browsers (Chrome, Edge):**
- Click "Save Data"
- Choose location and filename
- File saves directly

**Other Browsers:**
- Click "Save Data"
- File downloads automatically
- Move to your preferred location

### Backward Compatibility

The app handles old data formats:
- If `types` array is missing, it's created with defaults
- Entries with `type` string field need manual migration to `typeId`

## ?? Deployment

Deploy to any static hosting platform:

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/time-tracker.git
git push -u origin main
# Enable Pages in repository settings
```

### Netlify

1. Drag project folder to [netlify.com](https://netlify.com)
2. Instant deployment
3. Custom domain available

### Cloudflare Pages

1. Connect Git repository
2. Build command: (leave empty)
3. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## ?? Task Type Workflow

### Creating Types

1. Click "Add Type" in Task Types section
2. Enter name (e.g., "Development", "Meeting")
3. Choose a color (color picker)
4. Save

### Using Types

- Types appear in dropdown when adding/editing tasks
- Each type has a unique color used in:
  - Entry badges
  - Chart segments
  - Type management list

### Editing Types

- Click "Edit" on any type
- Change name or color
- All entries update automatically

### Deleting Types

- Types in use: Warning confirmation
- Types not in use: Simple confirmation
- Deleted types affect existing entries

## ?? Important Notes

### Data Privacy

- **Never commit your actual data file** to public repositories
- Use `.gitignore` to exclude `*-data.json` files
- Keep your JSON file locally or in private cloud storage

### Browser Compatibility

- ? Chrome/Edge 86+ (full File System Access API)
- ? Firefox 90+
- ? Safari 14+
- ? Mobile browsers (responsive design)

### Chart.js CDN

The app loads Chart.js from CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

**For offline use:** Download Chart.js and update the script tag to local path.

## ?? Troubleshooting

### Icons Show as Squares

- **Cause**: SVG rendering issue
- **Solution**: Refresh browser, check browser console

### Charts Not Showing

- **Cause**: Chart.js not loaded
- **Solution**: Check internet connection (CDN), check console for errors

### Type Dropdown Empty

- **Cause**: No types defined
- **Solution**: Add types in "Task Types" section first

### Data Won't Load

- **Cause**: Invalid JSON or old format
- **Solution**: Validate JSON at [jsonlint.com](https://jsonlint.com), check data structure

## ?? Documentation

- **README.md** (this file) - Overview and quick start
- **DEPLOYMENT.md** - Detailed deployment guides
- **USER-GUIDE.md** - Complete usage instructions
- **sample-data.json** - Example data structure

## ?? Dark Mode

The entire UI uses a consistent dark theme:
- Reduces eye strain
- Better for extended use
- Professional appearance
- All colors customizable via CSS variables

## ?? Future Enhancements

Potential additions:
- Export to CSV/PDF
- Import from other formats
- Tags in addition to types
- Filtering by type/date
- Search functionality
- Timer for active tracking
- LocalStorage auto-save
- Offline PWA support

## ?? License

Free to use, modify, and distribute. No attribution required.

## ?? Credits

- Built with vanilla JavaScript, HTML5, and CSS3
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Icons: Inline SVG (Feather Icons style)
- No other external dependencies

---

**Enjoy tracking your time in dark mode! ????**
