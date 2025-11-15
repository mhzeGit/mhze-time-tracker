# Quick Reference Guide

## Where to Find Things

### Need to modify...

#### Application State
?? `js/core/app.js`
- Add new global state properties
- Modify App object structure

#### Data Loading/Saving
?? `js/data/data-manager.js`
- Change file format
- Add import/export features
- Modify validation rules

#### Caching Behavior
?? `js/data/cache-manager.js`
- Change what gets cached
- Modify cache keys
- Add cache expiration

#### Task Types
?? `js/modules/type-manager.js`
- Add type properties
- Modify type validation
- Change CRUD behavior

#### Time Entries
?? `js/modules/entry-manager.js`
- Add entry fields
- Modify duration calculation
- Change sorting logic

#### Filtering
?? `js/modules/filter-manager.js`
- Add new filter types
- Modify filter logic
- Change filter UI

#### Sorting
?? `js/modules/sort-manager.js`
- Add new sort columns
- Change sort behavior
- Modify sort indicators

#### Statistics/Analytics
?? `js/modules/analytics.js`
- Add new calculations
- Modify aggregations
- Change chart data format

#### Charts
?? `js/ui/chart-renderer.js`
- Modify chart appearance
- Add new chart types
- Change Chart.js config

#### Main UI Rendering
?? `js/ui/ui-renderer.js`
- Change how things render
- Add new UI sections
- Modify templates

#### Task Modal
?? `js/ui/modal-manager.js`
- Add form fields
- Change validation
- Modify modal behavior

#### Type Modal
?? `js/ui/type-modal-manager.js`
- Add type form fields
- Change color picker
- Modify modal behavior

#### Notifications
?? `js/ui/notifications.js`
- Change notification style
- Add notification types
- Modify duration

#### Event Listeners
?? `js/core/event-listeners.js`
- Add new button handlers
- Modify existing events
- Add keyboard shortcuts

#### Helper Functions
?? `js/utils/helpers.js`
- Add utility functions
- Modify formatters
- Add validators

#### App Initialization
?? `js/core/init.js`
- Change startup sequence
- Modify initialization logic
- Add startup tasks

---

## Common Tasks

### Adding a New Feature

1. **Identify the layer** (Data, Business Logic, or UI)
2. **Find or create the appropriate module**
3. **Add your function/code**
4. **Update event listeners if needed**
5. **Test the feature**

### Adding a New Field to Entries

1. **Update entry creation** in `js/modules/entry-manager.js`
2. **Update validation** in `js/data/data-manager.js`
3. **Update modal form** in `index.html`
4. **Update modal handler** in `js/ui/modal-manager.js`
5. **Update rendering** in `js/ui/ui-renderer.js`

### Adding a New Chart

1. **Add canvas** to `index.html`
2. **Create render function** in `js/ui/chart-renderer.js`
3. **Add data preparation** in `js/modules/analytics.js`
4. **Call from** `UIRenderer.renderCharts()`

### Adding a New Filter

1. **Add filter UI** to `index.html`
2. **Update filter state** in `js/core/app.js`
3. **Add filter logic** in `js/modules/filter-manager.js`
4. **Add event listener** in `js/core/event-listeners.js`
5. **Update cache** in `js/data/cache-manager.js`

---

## File Size Guide

### Ideal File Sizes
- **Small** (< 100 lines): Utilities, simple managers
- **Medium** (100-200 lines): Feature modules, renderers
- **Large** (200-300 lines): Analytics, complex modules
- **Too Large** (> 300 lines): Consider splitting

### Current Files
```
? app.js                 ~20 lines   (Core state)
? helpers.js             ~70 lines   (Utilities)
? data-manager.js        ~150 lines  (Data I/O)
? cache-manager.js       ~90 lines   (Caching)
? type-manager.js        ~60 lines   (Type CRUD)
? entry-manager.js       ~70 lines   (Entry CRUD)
? filter-manager.js      ~130 lines  (Filtering)
? sort-manager.js        ~90 lines   (Sorting)
? analytics.js           ~250 lines  (Analytics)
? chart-renderer.js      ~190 lines  (Charts)
? ui-renderer.js         ~140 lines  (UI rendering)
? modal-manager.js       ~90 lines   (Task modal)
? type-modal-manager.js  ~70 lines   (Type modal)
? notifications.js       ~30 lines   (Toasts)
? event-listeners.js     ~200 lines  (Events)
? init.js                ~30 lines   (Startup)
```

---

## Naming Conventions

### Files
- `kebab-case.js` for file names
- Clear, descriptive names
- Suffix with purpose: `-manager`, `-renderer`, etc.

### Modules
- `PascalCase` for module names
- Match file purpose: `TypeManager`, `UIRenderer`

### Functions
- `camelCase` for function names
- Verb-based: `addEntry()`, `renderChart()`
- Clear purpose: `getFilteredEntries()`

### Variables
- `camelCase` for variables
- Descriptive: `dailyTotals`, `filteredEntries`
- Constants: `CACHE_KEY`, `FILTERS_KEY`

---

## Testing Checklist

### After Making Changes

- [ ] Check browser console for errors
- [ ] Test the modified feature
- [ ] Test related features
- [ ] Verify data persists (cache)
- [ ] Check all charts render
- [ ] Test filters and sorting
- [ ] Verify modals work
- [ ] Test on different screen sizes
- [ ] Check for console warnings
- [ ] Verify no broken functionality

---

## Performance Tips

### Rendering
- Only re-render what changed
- Batch DOM updates
- Use document fragments for multiple elements

### Data
- Filter data once, reuse results
- Cache calculated values
- Avoid unnecessary loops

### Events
- Use event delegation where possible
- Debounce expensive operations (resize)
- Remove unused event listeners

---

## Debugging Tips

### Browser DevTools
- **Console**: Check for errors and warnings
- **Sources**: Set breakpoints in specific files
- **Network**: Verify all scripts loaded
- **Application**: Check localStorage cache

### Finding Issues
1. Check browser console first
2. Look at the specific module/file
3. Add `console.log()` to track flow
4. Use breakpoints to inspect state
5. Check `App` object state

### Common Issues
- **Module undefined**: Check script load order
- **Function not found**: Check global exposure (`window.X`)
- **State not updating**: Check App object mutations
- **Cache not working**: Check localStorage in DevTools

---

## Best Practices

### When Adding Code
? Keep functions small and focused
? Follow existing patterns
? Comment complex logic
? Use descriptive names
? Expose modules via `window`

### When Modifying Code
? Understand the module first
? Test before and after changes
? Maintain consistency
? Update comments if needed
? Don't break existing features

### When Refactoring
? One change at a time
? Test frequently
? Keep git commits small
? Document breaking changes
? Update this guide if needed

---

## Need Help?

1. Read `CODE-STRUCTURE.md` for architecture
2. Check `MODULE-DIAGRAM.md` for data flow
3. Look at existing code for patterns
4. Test in browser DevTools
5. Check browser console for errors

**Remember**: Each file has a single, clear purpose. If you're not sure where code belongs, look for similar functionality!
