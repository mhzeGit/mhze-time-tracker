# Quick Reference - New Features

## ?? Dark Mode

### Enabled by Default
The app now uses a **complete dark theme** - no light mode option.

### Customizing Colors
Edit `style.css` at the top:

```css
:root {
    /* Change any of these: */
    --bg-primary: #0f172a;        /* Main background */
    --accent-primary: #3b82f6;    /* Buttons, highlights */
    --text-primary: #f1f5f9;      /* Main text color */
}
```

### Color Palette
- **Backgrounds**: Deep slate (#0f172a, #1e293b, #334155)
- **Accent**: Blue (#3b82f6)
- **Text**: Light gray to white (#f1f5f9, #cbd5e1, #94a3b8)
- **Success**: Green (#10b981)
- **Danger**: Red (#ef4444)

---

## ?? Task Types

### What Are Types?
Categories for your tasks (Development, Meeting, Research, etc.) with custom colors.

### Creating a Type

1. Scroll to **"Task Types"** section
2. Click **"+ Add Type"**
3. Enter **name** (e.g., "Client Work")
4. Choose **color** from picker
5. Click **"Save"**

### Editing a Type

1. Find the type in the list
2. Click **"Edit"** button
3. Modify name or color
4. Click **"Save"**
5. All entries and charts update automatically

### Deleting a Type

1. Click **"Delete"** button on any type
2. If type is used: Warning confirmation
3. Confirm deletion
4. Type removed from system

### Default Types

New installations include 4 default types:
- **Development** (Blue #3b82f6)
- **Meeting** (Green #10b981)
- **Research** (Orange #f59e0b)
- **Planning** (Purple #8b5cf6)

---

## ?? Stacked Charts

### What Changed?
Charts now show **per-type breakdowns** using stacked bars.

### Daily Chart (Last 7 Days)

- Each bar = one day
- Bar segments = different task types
- Total height = total time that day
- Colors match task type colors

### Weekly Chart (Last 4 Weeks)

- Each bar = one week
- Bar segments = different task types
- Total height = total time that week
- Week format: YYYY-WXX (e.g., 2024-W03)

### How to Read Charts

**Bar Height**: Total time spent
**Segments**: Time per type
**Colors**: Match type colors
**Hover**: See exact breakdown

### Example

```
Daily Chart - Jan 15
?? Development (Blue): 3h 30m
?? Meeting (Green): 1h 0m
?? Research (Orange): 2h 15m
Total: 6h 45m
```

---

## ?? Using Types in Tasks

### Adding a Task with Type

1. Click **"+ Add Task"**
2. Fill in title
3. **Select type from dropdown** ? (Required)
4. Enter date and times
5. Save

### Type Dropdown

- Shows all your defined types
- Alphabetically sorted
- Shows type name only (color visible after saving)

### Entry Cards

Each entry now shows:
- **Colored badge** with type name
- Badge uses type's assigned color
- Small color dot indicator

---

## ?? Workflow Examples

### Example 1: Freelancer Tracking

**Types to Create:**
- Client A (Red)
- Client B (Blue)
- Client C (Green)
- Admin (Gray)

**Benefits:**
- See time per client in charts
- Color-coded entries
- Quick visual identification

### Example 2: Developer Productivity

**Types to Create:**
- Coding (Blue)
- Code Review (Purple)
- Meetings (Green)
- Learning (Orange)
- Debugging (Red)

**Benefits:**
- Track productive vs. meeting time
- Identify patterns
- Optimize workflow

### Example 3: Student Study Tracking

**Types to Create:**
- Math (Blue)
- Science (Green)
- History (Orange)
- English (Purple)
- Breaks (Gray)

**Benefits:**
- Balance study time across subjects
- Visualize study patterns
- Track break frequency

---

## ?? Pro Tips

### Color Selection

**Good Practices:**
- Use distinct colors for easy differentiation
- Avoid similar shades (e.g., two blues)
- Consider color-blind friendly palettes
- Use warm colors for creative work, cool for analytical

**Suggested Palette:**
- Development: Blue (#3b82f6)
- Meetings: Green (#10b981)
- Research: Orange (#f59e0b)
- Planning: Purple (#8b5cf6)
- Admin: Gray (#64748b)
- Creative: Pink (#ec4899)
- Learning: Teal (#14b8a6)

### Type Naming

**Best Practices:**
- Keep names short (1-2 words)
- Be specific but not too granular
- Use consistent terminology
- Consider your reporting needs

**Examples:**
- ? "Development" (clear)
- ? "Writing code for features" (too long)
- ? "Client Call" (specific)
- ? "Call" (too vague)

### Chart Analysis

**What to Look For:**
- **Imbalanced days**: Too much of one type
- **Missing types**: Types you planned but didn't do
- **Trends over weeks**: Increasing/decreasing patterns
- **Type dominance**: Which type takes most time

---

## ?? Troubleshooting

### Type Dropdown is Empty

**Problem**: Can't select a type when adding task
**Solution**: Create at least one type in "Task Types" section first

### Charts Show "No data available"

**Problem**: Empty chart area
**Causes**: 
- No entries in last 7 days/4 weeks
- Chart.js didn't load (check internet)
**Solution**: Add recent entries or check browser console

### Type Color Not Showing

**Problem**: Entry shows gray instead of type color
**Cause**: Type was deleted
**Solution**: Edit entry and select a different type

### Icons Show as Squares

**Problem**: SVG icons not rendering
**Cause**: Browser doesn't support SVG
**Solution**: Update browser to latest version

---

## ?? Mobile Use

### Type Management on Mobile

- Tap "Add Type" to create
- Color picker opens native mobile picker
- Swipe to see edit/delete buttons

### Charts on Mobile

- Rotate to landscape for better view
- Tap bars for tooltips
- Pinch to zoom (browser feature)
- Scroll horizontally if needed

### Best Practices

- Use shorter type names on mobile
- Limit types to 5-6 for readability
- Landscape mode for chart analysis

---

## ?? Advanced Customization

### Changing Chart Colors

Edit `script.js` in `ChartRenderer`:

```javascript
// Chart grid color
grid: { color: '#your-color' }

// Chart text color
ticks: { color: '#your-color' }
```

### Changing Type Badge Style

Edit `style.css`:

```css
.entry-type-badge {
    padding: 4px 10px;        /* Adjust size */
    border-radius: 6px;       /* Adjust roundness */
    font-size: 13px;          /* Adjust text size */
}
```

### Chart Aspect Ratio

Edit `script.js` in chart options:

```javascript
aspectRatio: 2,  // Change to 1.5, 2.5, etc.
```

---

## ?? Keyboard Shortcuts

While no built-in shortcuts exist, browser shortcuts work:

- **Ctrl/Cmd + S**: Save page (may prompt download)
- **Tab**: Navigate form fields
- **Enter**: Submit form
- **Esc**: Close modal
- **Ctrl/Cmd + F**: Find in page

---

## ?? Data Migration

### From Old Format

**Old:**
```json
{
  "entries": [{ "type": "Development" }]
}
```

**New:**
```json
{
  "types": [{ "id": "...", "name": "Development", "color": "#3b82f6" }],
  "entries": [{ "typeId": "..." }]
}
```

**Migration Steps:**
1. Load old data file
2. App creates default types
3. Manually create types matching old type strings
4. Edit each entry to select correct type
5. Save new format

---

## ? Quick Checklist

Before starting:
- ? Open `index.html` in modern browser
- ? Load sample data to explore features
- ? Create your own types
- ? Add a few test entries
- ? Check charts display correctly
- ? Save your data file

Ready to track:
- ? Types defined with colors
- ? Understand how to add entries
- ? Know how to read charts
- ? Data file saved safely

---

## ?? Next Steps

1. **Create your types** - Start with 3-5 categories
2. **Add entries** - Track last week retroactively
3. **Analyze charts** - Look for patterns
4. **Adjust types** - Refine categories as needed
5. **Save regularly** - Don't lose your data!

**Happy tracking! ????**
