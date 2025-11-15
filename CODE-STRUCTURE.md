# Time Tracker - Code Structure

This document describes the modular structure of the Time Tracker application.

## Directory Structure

```
time-tracker/
??? index.html              # Main HTML file
??? style.css              # Stylesheet
??? js/
?   ??? core/              # Core application files
?   ?   ??? app.js         # Application state (single source of truth)
?   ?   ??? event-listeners.js  # All DOM event bindings
?   ?   ??? init.js        # Application initialization
?   ?
?   ??? data/              # Data management layer
?   ?   ??? data-manager.js     # File I/O and data validation
?   ?   ??? cache-manager.js    # LocalStorage caching
?   ?
?   ??? modules/           # Business logic modules
?   ?   ??? type-manager.js     # Task type CRUD operations
?   ?   ??? entry-manager.js    # Time entry CRUD operations
?   ?   ??? filter-manager.js   # Entry filtering logic
?   ?   ??? sort-manager.js     # Entry sorting logic
?   ?   ??? analytics.js        # Statistics and aggregations
?   ?
?   ??? ui/                # UI rendering and interaction
?   ?   ??? ui-renderer.js      # Main UI rendering
?   ?   ??? chart-renderer.js   # Chart.js visualizations
?   ?   ??? notifications.js    # Toast notifications
?   ?   ??? modal-manager.js    # Task entry modal
?   ?   ??? type-modal-manager.js  # Type modal
?   ?
?   ??? utils/             # Utility functions
?       ??? helpers.js     # Helper functions (UUID, formatting, etc.)
```

## Module Overview

### Core (`js/core/`)

**app.js**
- Contains the main `App` object (application state)
- Single source of truth for all data
- Globally accessible via `window.App`

**event-listeners.js**
- Centralized event listener setup
- Organized by feature area
- Called once during initialization

**init.js**
- Application entry point
- Handles cache loading
- Initializes all modules

### Data Layer (`js/data/`)

**data-manager.js**
- Loading data from JSON files
- Saving data to JSON files
- Data structure validation
- File System Access API support

**cache-manager.js**
- LocalStorage persistence
- Automatic cache on data changes
- Cache restoration on page load
- Filter state persistence

### Business Logic (`js/modules/`)

**type-manager.js**
- Create, read, update, delete task types
- Type validation

**entry-manager.js**
- Create, read, update, delete time entries
- Entry sorting

**filter-manager.js**
- Filter entries by type and date range
- Filter UI management
- Filter state management

**sort-manager.js**
- Sort entries by any column
- Sort direction toggling
- Sort indicator UI

**analytics.js**
- Calculate daily/weekly averages
- Aggregate data by day/week/month
- Generate chart data
- Statistics calculations

### UI Layer (`js/ui/`)

**ui-renderer.js**
- Render all UI components
- Summary statistics
- Types list
- Entries table
- Coordinate other renderers

**chart-renderer.js**
- Pie chart rendering (type distribution)
- Time graph rendering (stacked bar chart)
- Chart.js configuration

**notifications.js**
- Toast notification system
- Success/error/info messages

**modal-manager.js**
- Task entry add/edit modal
- Form validation
- Duration calculation display

**type-modal-manager.js**
- Type add/edit modal
- Color picker management

### Utilities (`js/utils/`)

**helpers.js**
- UUID generation
- HTML escaping (XSS prevention)
- Date formatting
- Duration calculation and formatting

## Loading Order

Scripts must be loaded in this specific order (as defined in `index.html`):

1. **Chart.js** (external library)
2. **Core/App** - Application state
3. **Utils** - Helper functions
4. **Data Layer** - Data and cache management
5. **Business Logic** - All feature modules
6. **UI Layer** - Rendering and interaction
7. **Core/Event Listeners** - Event bindings
8. **Core/Init** - Application startup

## Data Flow

```
User Action
    ?
Event Listener (event-listeners.js)
    ?
Business Logic Module (modules/)
    ?
App State Update (app.js)
    ?
Cache Update (cache-manager.js)
    ?
UI Re-render (ui-renderer.js)
    ?
User sees updated UI
```

## Best Practices

1. **Single Responsibility**: Each module has one clear purpose
2. **No Direct DOM Access in Business Logic**: Business logic modules don't manipulate DOM
3. **Centralized State**: All state lives in `App` object
4. **Automatic Caching**: All data changes trigger cache save
5. **Global Exposure**: All modules exposed via `window` for cross-module access

## Adding New Features

When adding a new feature:

1. Identify the layer (Data, Business Logic, or UI)
2. Create or modify the appropriate module
3. Update event listeners if needed
4. Ensure proper loading order in `index.html`
5. Follow existing patterns for consistency

## Migration from Single File

The original `script.js` has been split into 15 focused modules:
- Easier to maintain and debug
- Clear separation of concerns
- Better code organization
- Improved testability
- No functionality changes - everything works exactly the same
