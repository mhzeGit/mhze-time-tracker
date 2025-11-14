# User Guide - Time Tracker

Complete instructions for using your Time Tracker application.

---

## ?? Getting Started

### First Time Setup

1. **Open the App**
   - If hosted online: Visit your URL
   - If local: Open `index.html` in your browser

2. **Load Sample Data** (Optional)
   - Click "Load Data" button
   - Select `sample-data.json`
   - Explore the interface with example data

3. **Create Your Own Data File**
   - Start with an empty app, OR
   - Copy `sample-data.json` and rename it (e.g., `my-data.json`)
   - Clear the entries array: `{"entries": []}`

---

## ?? Managing Time Entries

### Adding a New Entry

1. Click the **"+ Add Task"** button (top right)
2. Fill in the form:
   - **Title**: What you worked on (e.g., "Frontend Development")
   - **Type**: Category/project (e.g., "Development", "Meeting", "Research")
   - **Date**: When you worked (defaults to today)
   - **Start Time**: When you started
   - **End Time**: When you finished
3. **Duration** automatically calculates as you enter times
4. Click **"Save"** to add the entry

**Tips**:
- Title and Type are free-form text
- Use consistent Type names for better analytics
- Common types: Development, Meeting, Research, Planning, Design, Testing

### Editing an Entry

1. Find the entry in the list
2. Click the **"?? Edit"** button
3. Modify any fields
4. Duration recalculates automatically
5. Click **"Save"**

### Deleting an Entry

1. Find the entry in the list
2. Click the **"??? Delete"** button
3. Confirm deletion
4. Entry is permanently removed (until you reload data)

**?? Warning**: Deletions are permanent unless you reload the original data file!

---

## ?? Data Management

### Loading Data

**Option 1: First Time**
1. Click **"Load Data"**
2. Select your JSON file from your computer
3. Data appears immediately

**Option 2: With Existing Data**
- Loading new data **replaces** current data
- Make sure to save first if you have unsaved changes!

**Supported Browsers**:
- ? Chrome/Edge: Full file access
- ? Firefox: File picker only
- ? Safari: File picker only

### Saving Data

**Modern Browsers (Chrome, Edge)**:
1. Click **"Save Data"**
2. Choose save location
3. Name your file (e.g., `my-time-tracker.json`)
4. Click "Save"
5. File is saved directly to chosen location

**Other Browsers**:
1. Click **"Save Data"**
2. File downloads to your Downloads folder
3. Move it to your preferred location
4. Replace old file if updating

**?? Pro Tip**: Save after each session to avoid losing data!

### Data File Location

You can store your JSON file anywhere:
- Desktop folder
- Documents folder
- Cloud storage (Dropbox, Google Drive, OneDrive)
- USB drive (for portability)
- Multiple files for different projects

**Recommended Structure**:
```
My Documents/
??? TimeTracker/
    ??? 2024-work.json
    ??? 2024-personal.json
    ??? archive/
        ??? 2023-work.json
```

---

## ?? Understanding Analytics

### Summary Cards

**Daily Average**
- Average time spent per day
- Calculated from all entries
- Useful for tracking consistency

**Weekly Average**
- Average time spent per week
- Helps with weekly planning
- Identifies busy vs. slow weeks

**Total Entries**
- Total number of time entries recorded
- Quick health check of your tracking

**Total Time**
- Sum of all tracked time
- Lifetime total across all entries

### Charts

**Daily Totals Chart**
- Shows last 7 days
- Bar height = hours worked that day
- Hover to see exact values
- Updates automatically when you add/edit entries

**Weekly Totals Chart**
- Shows last 4 weeks
- Aggregates time by week
- Useful for long-term trends
- Week starts on Sunday

**Chart Features**:
- Interactive hover labels
- Responsive (resizes with window)
- Automatically updates with new data

---

## ?? Interface Guide

### Top Bar

| Button | Action |
|--------|--------|
| ?? Load Data | Open JSON file from your computer |
| ?? Save Data | Save current data to JSON file |
| + Add Task | Create new time entry |

### Entry Cards

Each entry displays:
- **Title**: Task name
- **Type**: Category/project
- **Date**: When you worked
- **Time**: Start - End time
- **Duration**: Calculated time spent (highlighted in blue)
- **Actions**: Edit ?? and Delete ??? buttons

### Modal Form

**Required Fields** (marked with *):
- All fields are required
- Form won't submit without them

**Auto-Calculated**:
- Duration updates as you change times
- Validates end time > start time

**Keyboard Shortcuts**:
- `Esc`: Close modal
- `Enter`: Submit form (when valid)

---

## ?? Best Practices

### Daily Workflow

1. **Start of Day**
   - Open the app
   - Load yesterday's data file (if continuing)

2. **During the Day**
   - Add entries as you complete tasks, OR
   - Add entries at end of day

3. **End of Day**
   - Review entries
   - Save data file
   - Check daily total

### Weekly Review

1. Load your data file
2. Check weekly total in charts
3. Review weekly average
4. Adjust planning for next week

### Data Organization

**Option 1: Single File**
```json
Pros: Simple, one file to manage
Cons: Large file over time
```

**Option 2: Multiple Files**
```json
Pros: Organized by project/year
Cons: Need to load different files
```

**Recommended**: Monthly files
- `2024-01-time-tracker.json`
- `2024-02-time-tracker.json`
- Easy to archive
- Manageable file size

### Backup Strategy

1. **Daily**: Save to local folder
2. **Weekly**: Backup to cloud storage
3. **Monthly**: Archive old files
4. **Optional**: Version control with Git

```bash
# Git backup example
git init
git add *.json
git commit -m "Time tracking backup $(date)"
git push
```

---

## ?? Keyboard Tips

While the app doesn't have built-in shortcuts, you can use browser shortcuts:

- `Ctrl/Cmd + S`: Save page (prompts download on some browsers)
- `Ctrl/Cmd + R`: Reload app (?? unsaved data lost!)
- `Tab`: Navigate form fields
- `Enter`: Submit form
- `Esc`: Close modal

---

## ?? Filtering and Search

The current version shows all entries chronologically (newest first).

### Manual Filtering

**By Date**:
- Scroll through entries
- Visual scanning by date field

**By Type**:
- Use browser search (`Ctrl/Cmd + F`)
- Search for type name (e.g., "Meeting")

**By Title**:
- Use browser search
- Search for keywords in title

### Future Enhancement Ideas

You could add:
- Date range filter
- Type filter dropdown
- Search box
- Export filtered results

---

## ?? Mobile Usage

The app is fully responsive and works on mobile devices!

### Mobile Tips

1. **Landscape Mode**
   - Better for viewing charts
   - Easier form input

2. **Touch Gestures**
   - Tap to open modal
   - Scroll through entries
   - Pinch to zoom charts (browser feature)

3. **Date/Time Pickers**
   - Native mobile pickers appear
   - Easier than typing

4. **Saving on Mobile**
   - May download to Downloads folder
   - Use file manager to organize

---

## ??? Troubleshooting

### Data Won't Load

**Problem**: File picker doesn't appear
- Solution: Click "Load Data" again
- Check browser pop-up blocker

**Problem**: "Invalid data format" error
- Solution: Validate JSON at [jsonlint.com](https://jsonlint.com)
- Ensure structure matches format

**Problem**: File loads but no entries show
- Solution: Check `entries` array isn't empty
- Verify entry structure

### Can't Save Data

**Problem**: Nothing happens when clicking "Save Data"
- Solution: Check browser permissions
- Try different browser (Chrome/Edge recommended)

**Problem**: File downloads but can't save directly
- Solution: Normal behavior in some browsers
- Manually move downloaded file

### Duration Shows Negative

**Problem**: Negative duration or incorrect calculation
- Solution: Ensure end time > start time
- For overnight entries, use separate entries per day

### Charts Not Showing

**Problem**: Blank chart area
- Solution: Add entries with dates in last 7 days/4 weeks
- Check browser console for errors

**Problem**: Charts cut off on mobile
- Solution: Rotate to landscape
- Zoom out in browser

---

## ?? Advanced Usage

### Multiple Projects

**Scenario**: Track different projects separately

**Solution 1**: Use different Type values
- Personal, Work, Side Project, etc.
- All in one file
- Filter manually

**Solution 2**: Separate data files
- `work-2024.json`
- `personal-2024.json`
- `side-project-2024.json`
- Load different files as needed

### Team Usage

**Scenario**: Share time tracking with team

**Solution**:
- Each person has their own data file
- Combine files manually for team totals
- Or export to shared spreadsheet

**Note**: App doesn't support multi-user editing

### Exporting Data

**To Excel/Sheets**:
1. Open JSON file in text editor
2. Copy entries
3. Use online JSON to CSV converter
4. Import CSV to Excel/Sheets

**To Reports**:
1. Use analytics in app for quick stats
2. Screenshot charts for presentations
3. Export data for detailed analysis

---

## ?? Tips for Accuracy

### Time Tracking Best Practices

1. **Be Consistent**
   - Track every day
   - Use same Type names
   - Fill in gaps promptly

2. **Be Honest**
   - Track actual time, not estimated
   - Include breaks if relevant
   - Round to nearest 5-15 minutes

3. **Be Detailed**
   - Specific titles help later
   - Include project context
   - Note blockers or delays

4. **Review Regularly**
   - Weekly check-ins
   - Adjust tracking method as needed
   - Archive old data

### Common Mistakes

? **Don't**:
- Forget to save data
- Mix personal and work in confusing ways
- Use inconsistent Type names
- Track overlapping time periods

? **Do**:
- Save after each session
- Use clear naming conventions
- Regular backups
- Check daily/weekly totals make sense

---

## ?? Success Stories

### Use Cases

**Freelancers**:
- Track billable hours
- Per-client time tracking
- Invoice preparation

**Students**:
- Study time per subject
- Project time management
- Productivity insights

**Professionals**:
- Meeting vs. productive time
- Project allocation
- Work-life balance

**Creatives**:
- Time per project
- Creative vs. admin time
- Productivity patterns

---

## ?? Getting Help

### Self-Help

1. **Browser Console**
   - Press F12
   - Check Console tab for errors
   - Screenshot errors if reporting issues

2. **Validate Data**
   - Use [jsonlint.com](https://jsonlint.com)
   - Check file structure
   - Compare with sample-data.json

3. **Check README**
   - Review main documentation
   - Check deployment guide
   - Read this user guide again

### Community Resources

- GitHub Issues (if hosted on GitHub)
- Browser documentation
- JSON format guides
- Web development forums

---

## ?? Next Steps

Now that you know how to use the app:

1. ? Create your first real entry
2. ? Establish a saving routine
3. ? Set up backups
4. ? Track for a week
5. ? Review your first analytics
6. ? Optimize your workflow

**Happy time tracking! ??**
