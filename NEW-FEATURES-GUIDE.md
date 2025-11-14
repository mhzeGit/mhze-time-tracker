# Quick Start - New Features

## What's New

Your time tracker now has:
- **Types saved in JSON** - No more lost types!
- **Pie Chart** - See type distribution at a glance
- **Time Graph** - Switch between Day/Week/Month views

---

## Getting Started

### 1. Open the App
```
Double-click index.html
```

### 2. Load Your Data (Optional)
```
Click "Load Data" -> Select sample-data.json
```
- Types and entries load together
- Colors automatically restored
- All charts populate

### 3. Explore New Charts

#### Pie Chart
```
Location: "Type Distribution" section
Shows: Total time per type as colored slices
Hover: See exact hours and percentage
```

**What you'll see:**
- Development (45%) - Blue slice
- Meeting (30%) - Green slice  
- Research (25%) - Orange slice

#### Time Graph
```
Location: "Time Graph" section
Shows: Switchable views of your time
Buttons: Day | Week | Month
```

**Try each view:**
1. **Day** - Today's 24-hour breakdown
2. **Week** - Last 7 days
3. **Month** - Current month overview

---

## Types Are Now Saved!

### Before (Old Behavior)
```json
{
  "entries": [...]
}
// Types were reset on each load
```

### Now (New Behavior)
```json
{
  "types": [...],
  "entries": [...]
}
// Types preserved across sessions
```

### What This Means
- Create custom types once
- Choose your colors
- Save the file
- Load it anytime
- Types + colors restored automatically!

---

## Chart Guide

### Pie Chart - Type Distribution

**What it shows:**
- Which type takes the most time
- Percentage breakdown
- Color-coded slices

**How to read:**
```
Larger slice = More time spent
Hover slice = Exact hours
Click legend = Hide/show type
```

**Best for:**
- Quick overview
- Identifying dominant activities
- Time allocation analysis

---

### Time Graph - Period Analysis

**Three Modes:**

#### Day Mode (24 Hours)
```
X-axis: 0:00, 1:00, 2:00 ... 23:00
Y-axis: Hours worked
Shows: Today's hourly breakdown
```

**Use when:**
- Tracking today's productivity
- Finding peak hours
- Analyzing daily patterns

**Example:**
```
9:00  -> 2h (1.5h Dev, 0.5h Meeting)
14:00 -> 1h (1h Research)
```

#### Week Mode (7 Days)
```
X-axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun
Y-axis: Hours worked
Shows: Last 7 days
```

**Use when:**
- Weekly review
- Comparing workdays
- Finding productivity trends

**Example:**
```
Mon Jan 15 -> 8h (5h Dev, 2h Meeting, 1h Research)
Tue Jan 16 -> 6h (4h Dev, 2h Research)
```

#### Month Mode (31 Days)
```
X-axis: 1, 2, 3 ... 31
Y-axis: Hours worked
Shows: Current month's all days
```

**Use when:**
- Monthly overview
- Long-term patterns
- Monthly reports

**Example:**
```
Day 1  -> 7h
Day 15 -> 8h
Day 31 -> 6h
```

---

## Common Workflows

### Workflow 1: First Time Setup

1. **Open app** (index.html)
2. **Add custom types**:
   - Click "Add Type"
   - Name: "Client Work"
   - Color: Pick your favorite
   - Save
3. **Add entries**:
   - Select your new type
   - Fill in details
   - Save
4. **Save file**:
   - Click "Save Data"
   - Name: my-tracker.json
   - **Your types are now saved!**

### Workflow 2: Daily Use

1. **Load your data**:
   - Click "Load Data"
   - Select my-tracker.json
   - Types restored automatically
2. **Add today's tasks**:
   - Type dropdown shows your types
   - Add entries throughout day
3. **Check Day view**:
   - Click "Day" button
   - See hourly breakdown
4. **Save before closing**:
   - Click "Save Data"
   - Types + entries preserved

### Workflow 3: Weekly Review

1. **Load data**
2. **Switch to Week view**:
   - Click "Week" button
   - See last 7 days
3. **Check pie chart**:
   - Scroll to Type Distribution
   - See time allocation
4. **Analyze patterns**:
   - Which days were productive?
   - Which type dominated?
   - Balance good?

### Workflow 4: Monthly Reporting

1. **Load data**
2. **Switch to Month view**:
   - Click "Month" button
   - See entire month
3. **Review totals**:
   - Summary cards show averages
   - Pie chart shows distribution
4. **Export screenshot**:
   - Take screenshot of charts
   - Use in reports/presentations

---

## Pro Tips

### Type Management

**Tip 1: Use Distinct Colors**
```
GOOD: Development: Blue (#3b82f6)
GOOD: Meetings: Green (#10b981)
GOOD: Research: Orange (#f59e0b)

BAD: Dev: Blue (#3b82f6)
BAD: Code: Blue (#3b85f6)  <- Too similar!
```

**Tip 2: Keep Types Focused**
```
GOOD:
- Development
- Client Calls
- Admin

TOO GRANULAR:
- React Development
- Vue Development
- API Development
```

**Tip 3: Save After Type Changes**
```
1. Add/edit/delete types
2. Click "Save Data" immediately
3. Types preserved for next session
```

### Chart Usage

**Pie Chart Tips:**
- Hover slices for exact time
- Look for dominant types (>40%)
- Aim for balanced distribution

**Time Graph Tips:**
- Use Day view for daily tracking
- Use Week view for patterns
- Use Month view for trends
- Switch views frequently!

### Data Management

**Best Practice:**
```
1. One main JSON file per project/period
2. Save after each session
3. Backup weekly
4. Name clearly: 2024-Q1-work.json
```

**File Organization:**
```
TimeTracker/
+-- 2024-work.json        (current)
+-- 2024-personal.json    (current)
+-- archive/
    +-- 2023-work.json
    +-- 2023-personal.json
```

---

## Troubleshooting

### Types Not Loading

**Problem:** Loaded file but types are empty
**Solution:** 
- Check JSON structure has `types` array
- Old files may need manual update
- Add types manually and re-save

### Pie Chart Shows Nothing

**Problem:** Empty pie chart
**Cause:** No entries with time
**Solution:** 
- Add some entries first
- Make sure entries have valid types
- Chart updates automatically

### Time Graph Empty

**Problem:** Bars not showing
**Cause:** No data for selected period
**Solution:**
- **Day mode:** Add entries for today
- **Week mode:** Add entries in last 7 days
- **Month mode:** Add entries this month

### View Switcher Not Working

**Problem:** Clicking buttons does nothing
**Solution:**
- Refresh browser
- Check browser console (F12)
- Make sure JavaScript is enabled

---

## Keyboard Tips

**Quick Actions:**
- `Ctrl/Cmd + S` - Save (may download)
- `Tab` - Navigate form fields
- `Enter` - Submit form
- `Esc` - Close modal
- `F12` - Open browser console (for debugging)

---

## Mobile Usage

### View Switcher on Mobile
- Buttons stack horizontally
- Tap to switch views
- Active button highlights

### Charts on Mobile
- Rotate to landscape for better view
- Pie chart centers nicely
- Time graph scrolls if needed
- Tooltips work with tap

---

## Quick Checklist

Before you start:
- [ ] Open index.html
- [ ] Load sample data (or start fresh)
- [ ] Check pie chart appears
- [ ] Try view switcher (Day/Week/Month)
- [ ] Add a test entry
- [ ] Watch charts update
- [ ] Save your data
- [ ] Reload to verify types persist

All working? You're ready!

---

## Next Steps

1. **Create your types** with custom colors
2. **Add entries** from this week
3. **Explore pie chart** - See distribution
4. **Try all three views** - Day/Week/Month
5. **Save your file** - Types preserved!
6. **Reload tomorrow** - Types still there

---

## More Info

- **FEATURE-UPDATE.md** - Detailed technical guide
- **README.md** - Complete documentation
- **USER-GUIDE.md** - Full user manual
- **sample-data.json** - Example with types

---

**Enjoy your enhanced time tracker!**

Types are now permanent, charts are interactive, and insights are instant!
