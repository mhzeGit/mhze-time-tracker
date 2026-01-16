# Off-Day Feature Implementation (Updated)

## Overview
The Off-Day feature has been refactored based on user feedback. Instead of being a property of a "Type", it is now a property of an individual "Entry" (Task). This allows for quick addition of holiday/non-working days without managing special types.

**Key Changes:**
1.  **Entry-Level Flag:** `isOffDay` is now a property of entries, not types.
2.  **UI Integration:** "Off Day" checkbox added to the "Add/Edit Task" modal.
3.  **Automatic Values:** When "Off Day" is checked:
    -   **Title:** Automatically set to "Off Day" (input disabled).
    -   **Type:** Automatically skipped (input disabled).
    -   **Time:** Automatically set to 00:00 - 00:00 (input disabled).
    -   **Date:** Remains editable by the user.
4.  **Statistics & Charts:** Off-day entries are completely **hidden** from charts and ignored in all statistical calculations (averages, totals).

## How to Use

### Adding an Off-Day
1.  Click **"Add Task"** (or the + button).
2.  Check the **"Off Day (Holiday/Skip)"** checkbox at the top of the form.
3.  Notice that Title, Type, and Time fields become disabled.
4.  Select the desired **Date**.
5.  Click **"Add"**.

### Result
-   The entry is saved in the database.
-   It will **NOT** appear in the graphs (bars/pie).
-   It will **NOT** count towards daily/weekly averages or total time.
-   It effectively "skips" that day in terms of productivity tracking.

### Editing
-   You can edit an existing task and toggle "Off Day" on or off.
-   Toggling it "On" clears your custom title/type/time.
-   Toggling it "Off" restores editability (you'll need to re-enter values).

## Technical Implementation

### Modified Files

#### 1. **js/modules/entry-manager.js**
-   Updated `addEntry` and `updateEntry` to handle `isOffDay` property.
-   Ensured `isOffDay` persists in the data model.

#### 2. **js/modules/analytics.js**
-   Updated `getEntriesToAnalyzeExcludingOffDays` to filter by `entry.isOffDay` instead of `type.isOffDay`.
-   Updated `getDailyTotalsByType`, `getWeeklyTotalsByType`, `getMonthlyTotalsByType`, `getTimePerType` to use the filtered list.
-   This ensures off-day entries are excluded from ALL charts and stats.

#### 3. **js/ui/modal-manager.js**
-   Added `handleOffDayToggle` logic to disable/enable form fields.
-   Updated `openAddModal` and `openEditModal` to initialize the checkbox state.
-   Updated `handleFormSubmit` to handle validation logic (skip type validation if off-day) and save the correct data structure.

#### 4. **js/data/data-manager.js**
-   Updated `validateData` to allow `null` values for `typeId`, `startTime`, `endTime` IF `isOffDay` is true.

#### 5. **index.html**
-   Added the "Off Day" checkbox to the `#taskForm`.
-   Removed the previous "Off Day" checkbox from `#typeForm`.

#### 6. **js/modules/type-manager.js** & **js/ui/type-modal-manager.js**
-   Reverted changes regarding `isOffDay` on types.

## Data Structure
Revised Entry structure:

```json
{
  "id": "uuid...",
  "title": "Off Day",
  "typeId": null,
  "date": "2024-01-01",
  "startTime": "00:00",
  "endTime": "00:00",
  "durationMinutes": 0,
  "isOffDay": true
}
```

## Backward Compatibility
-   Existing entries work as normal (undefined `isOffDay` is treated as false).
-   The previous "Off Day Type" implementation has been removed; if any types were created with `isOffDay: true` in the short interim, that property is now ignored, and they behave as normal types.
