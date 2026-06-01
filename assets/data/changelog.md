# Version 2.2.0 - 6/1/26 - 1:04 PM
### Guides, Resources & Staff Workflow Update

## New Features

### Markdown Content System

- Converted Help/Overview content to Markdown (`help.md`).
- Converted Changelog content to Markdown (`changelog.md`).
- Content can now be updated using Notepad++ without editing HTML.
- Improved maintainability for documentation and future updates.

---

### Resource Enhancements

- Added Resource Pinning.
- Pinned resources now remain at the top of the list.
- Added Recently Added badge.
- Recently Added badge automatically expires after 48 hours.
- Added Resource Usage Counter.
- Tracks how many times each resource has been opened.
- Resource titles are now clickable.

---

### Guides System

- Added dedicated Guides page.
- Added guide cards with condensed summaries.
- Added guide viewing modal.
- Added guide editing modal.
- Added guide deletion.
- Added guide pinning.
- Added guide open tracking.
- Added guide Last Edited timestamp.
- Added New badge support for recently created guides.

---

### Seat Management

- Added Broken PC seat status.
- Broken seats display with a dark gray indicator.
- Helps staff quickly identify unavailable workstations.

---

### Help & Documentation

- Added Back to Top button in Help modal.
- Button only appears while scrolling.
- Smooth scroll behavior when returning to the top.

---

### Staff Presence Tracking

- Added Staff Check-In workflow after dashboard unlock.
- Staff members select their name when starting a session.
- Connected Users now displays names instead of only a user count.
- Active staff names are automatically disabled to prevent duplicates.
- Staff selections persist during the current session.
- Connected Users display now uses: `Connected Users: 3 • Darren • Yuliia • Jae`

---

### Startup Experience

- Added optional startup video support.
- Video plays before the dashboard password screen.
- Full-screen startup presentation support.

---

## Improvements

- Improved onboarding support for new staff.
- Improved documentation management.
- Improved resource organization.
- Improved visibility of active staff workstations.
- Improved maintainability of dashboard content.

---

## Notes

- Staff presence tracking is session-based and does not require user accounts.
- Firebase Authentication and enhanced security controls are planned for a future update.


# Version 2.1.0 — 5/29/26 — 8:35 AM

### Resources Management Update

#### New Features

### Resources Page

- Added dedicated Resources page for storing useful Testing Center links.
- Resources are stored in Firebase and synced live across all users.
- Resources can be accessed from the new Resources button on the dashboard.

### Resource Management

- Added ability to create new resources.
- Added ability to edit existing resources.
- Added ability to delete resources.
- Added resource categories for organization.

### Search & Filtering

- Added resource search functionality.
- Added category filtering.
- Resource counts now update automatically based on filters.

### User Interface Improvements

- Resource titles are now clickable links.
- Added Open button for quick access to resources.
- Improved resource card layout and action button styling.
- Added confirmation modal for resource deletion.
- Resource management now follows the same modal design standards used throughout the dashboard.

### System Improvements

- Added centralized version management using `version.txt`.
- Version number now updates across all pages from a single file.

---

# Version 2.0.0 — 5/28/26 — 5:24 PM

## Major Dashboard & Seat Management Update

### New Features

### Seat Quick Add System

- Added seat-map Quick Add buttons for empty seats.
- Clicking a seat now opens a modal with the selected seat automatically prefilled.
- Quick Add modal supports:
  - Add Timer
  - Add Seat Status
- Quick Add modal now follows the same closing-time auto-trim logic as the main timer form.

### Live Alarm Sync

- Alarm dismissals are now synced across all open dashboards.
- Dismissing an alarm on one workstation dismisses it for everyone.

### Seat Status Management

- Added dedicated Seat Statuses section below Active Timers.
- Seat statuses now display in a live list with:
  - Seat badge
  - Student/Test label
  - Flag controls
  - Clear button
  - Trash shortcut
- Seat statuses now update live alongside timers.

### Seat Flags System

- Added independent seat flag system:
  - ADS
  - Misconduct
- Flags are no longer tied to the Test Optional field.
- Flags override seat color visually without overwriting testing data.
- Flags now work for:
  - Active timers
  - Occupied seats
  - Reserved seats

### Map Improvements

- Empty seats now show Quick Add buttons.
- Occupied seats now support faster clearing workflows.
- Added support for live map-based workflow management.

### Sound Reminder System

- Added startup reminder modal after dashboard unlock.
- Reminds staff to click Enable Sound before using the workstation.
- Reminder only appears once per browser session.

### Improvements

- Improved operational workflow for live seat management.
- Improved visibility for occupied and reserved seats.
- Improved dashboard synchronization behavior.
- Improved modal consistency and styling.
- Improved active seat handling and seat replacement workflows.

### Fixes

- Fixed alarm dismissal syncing issues.
- Fixed Quick Add modal field handling.
- Fixed seat conflict replacement handling.
- Fixed timer rendering and seat color priority behavior.
- Fixed multiple UI alignment and spacing inconsistencies.

### Internal Changes

- Added separate `flag` data support for timers and seat statuses.
- Added centralized seat flag rendering logic.
- Added session-based startup reminder tracking.
- Refactored Quick Add modal logic for multiple modes.

---

# Version 1.9.0 — 5/16/26 — 12:08 PM

## New Chrome Extension

- Added TC Dash Controller Chrome extension.
- Added automatic YouTube audio ducking when dashboard alarms trigger.
- Added smooth fade down to 10% volume.
- Added smooth restore back to original YouTube volume.
- Added manual Duck and Restore controls.
- Added extension badge indicator when alarm audio is active.
- Added keyboard shortcut popup support.
- Added styled extension popup matching dashboard theme.
- Added custom extension icon support.

### Quick Workflow Tools

- Added Quick Add Timer from extension popup.
- Added timer presets:
  - 30m
  - 1h
  - 1h 30m
  - 2h
- Added Quick Seat Status from extension popup.
- Added Lab B / Lab C support in extension controls.
- Added dashboard focus after extension actions.

### Mini Map

- Added mini live seat map inside extension.
- Added Lab B / Lab C mini-map toggle.
- Added clickable seats that autofill the Quick Add seat field.
- Added mini-map color states for:
  - Timed
  - Warning
  - Danger
  - Occupied
  - Reserved
  - Empty
- Increased mini-map refresh speed to 1 second.

### UI / Polish

- Added tabbed extension layout:
  - Quick Add
  - Seat Status
  - Audio
- Added custom popup title bar.
- Added extension version footer.
- Added success/error messaging for extension actions.
- Improved extension popup styling to match the main dashboard.

### Notes

- Extension runs unpacked through Chrome Developer Mode.
- Dashboard tab must be refreshed after reloading/updating the extension.
- Chrome notification support was skipped because workstation policy may block notifications.

---

# Version 1.8.0 — 5/16/26 — 1:57 AM

## New Features

- Added Edit Timer functionality for paused timers.
- Added projected end times under active timer countdowns.
- Added automatic closing-time timer trimming.
- Added special seat flag colors for ADS and Misconduct.
- Added active test-type breakdown to Active Timers counter.
- Added styled in-app modals replacing browser alert/confirm popups.
- Added colored operational action buttons for Pause/Resume, +5, and Delete.
- Added paused timer color state.
- Added custom favicon support.

### Timer Improvements

- Timers now create in a paused state by default.
- Staff can resume timers when students are seated and ready.
- Edit Timer now allows changing:
  - Lab
  - Seat
  - Student Name
  - Test Label
  - Hours
  - Minutes
- Edited timers remain paused until manually resumed.
- +5 minute button bypasses closing-time auto-trim.
- Edit Timer also bypasses auto-trim logic.
- Added projected "Ends At" display beneath countdown timers.
- Added duplicate seat protection to Edit Timer workflow.

### Auto-Trim System

- New timers automatically trim if they would exceed closing time.
- Monday–Thursday closing time: 7:00 PM.
- Friday closing time: 4:30 PM.
- Prevents accidental timers extending beyond operating hours.

### UI / UX Improvements

- Moved Edit Timer action beneath student name for cleaner timer rows.
- Reduced clutter in Active Timers section.
- Updated History layout and compact timestamp formatting.
- Removed seconds from history timestamps.
- Shortened year formatting in History tab.
- Improved spacing and readability across timer/history rows.
- Added custom dashboard-styled modals.
- Added color-coded action buttons:
  - Blue = Pause/Resume
  - Gold = +5 Minutes
  - Red = Delete
- Added visual paused-state timer color.
- Improved map seat readability on green/orange/red timer seats.
- Added favicon to browser tab.

### Special Test Flags

- "ADS" keyword anywhere in Test Optional field turns seat yellow.
- "Misconduct" keyword anywhere in Test Optional field turns seat pink.
- Flags apply dynamically regardless of text formatting or placement.

### Active Counter Improvements

The Active counter now includes:

- Make-Up timers
- CNA
- GED
- CLEP
- Placement
- HonorLock
- Other occupied seat statuses

**Example:**  
`9 active - 3 Make-Up • 3 CNA • 2 GED • 1 CLEP`

### Modal / Confirmation System

- Replaced browser alert popup for Edit Timer warnings.
- Replaced browser confirm popup for Clear All Timers.
- Added unified modal styling consistent with dashboard design.

### Help / Guide Updates

Added instructions for:

- Paused timer workflow
- Edit Timer
- Auto-trim behavior
- Projected end times
- ADS / Misconduct flags
- Updated Active Count system

### Stability / Operations

- Improved operational clarity during stress testing.
- Improved accessibility through color differentiation.
- Maintained real-time Firebase synchronization across workstations.
- Continued optimization for Testing Center staff workflow.

---

# Version 1.7.5

- Added Clear button support for active timers.
- Timer Clear button now mirrors seat status workflow behavior.
- Clear button and Trash button now perform the same timer removal action.
- Improved operational consistency between timers and seat statuses.
- Improved usability and staff workflow clarity during live testing operations.
- General timer action and workflow polish improvements.

# Version 1.7.4

- Improved special seat flag keyword detection.
- ADS seat highlighting now activates when "ADS" appears anywhere in the Test Optional field.
  - Example: `ADS Shryock`
- Added Misconduct seat highlighting support.
- Misconduct keyword detection is now case-insensitive.
- Improved operational flexibility for instructor and testing annotations.
- General seat flagging and keyword detection improvements.

# Version 1.7.3

- Changed timer workflow from immediate-start to staged-start operation.
- New timers are now created in a paused state by default.
- Staff can now seat and prepare students before starting countdowns.
- Added improved operational flexibility during student intake and check-in.
- Changed primary timer button text:
  - From: **Start Timer**
  - To: **Add Timer**
- Improved real-world testing center workflow handling during high-volume periods.
- Reduced risk of timers losing active testing time before students are fully seated.
- Stress testing and operational workflow refinement improvements.

# Version 1.7.2

- Added priority seat color flags for special testing conditions.
- Added ADS seat highlighting.
- Added AM seat highlighting.
- Added dedicated ADS and AM indicators to map legend.
- Added priority seat color override system.
- Improved operational visibility and staff communication through visual seating indicators.
- General seating map and timer visualization improvements.

# Version 1.7.1

- Added full timer form reset behavior after successful timer creation.
- Hours and Minutes fields now clear automatically after starting a timer.
- Improved form consistency between timer creation workflows.
- Added reset support for:
  - Standard timer creation
  - Seat replacement timer creation after conflict confirmation
- Improved overall timer entry workflow speed for repeated use.
- Minor UI and workflow polish improvements.

# Version 1.7.0

- Redesigned History tab for improved readability and cleaner visual hierarchy.
- Simplified history timestamp formatting.
- Added reusable history date formatting function.
- Improved history metadata styling and spacing.
- Improved history row readability for long-term operational use.
- Reduced visual clutter and timestamp dominance in history rows.
- Improved spacing and alignment for history action buttons.
- Added custom dashboard favicon.
- General UI polish and history layout cleanup.

# Version 1.6.0

- Added admin-protected history management system.
- Added Admin Unlock modal for restricted history actions.
- Added session-based admin unlock.
- Added styled confirmation modal for deleting individual history records.
- Added delete button for individual history entries.
- Improved history deletion reliability.
- Preserved regular staff access while restricting deletion actions.
- Maintained consistent modal styling across dashboard actions.
- General history cleanup and admin workflow improvements.

# Version 1.5.0

- Added integrated Help and Documentation modal.
- Added dynamic changelog system loaded from external text file.
- Added in-app version tracking display.
- Added styled delete confirmation modal for timers.
- Added maxlength protections for inputs.
- Improved timer and seat layout stability.
- Fixed NaN timer corruption issue.
- Improved synchronization reliability.
- Added automatic test type display for seat status history.
- Added conditional history logging.
- Improved internal documentation.
- General bug fixes and UI cleanup.

# Version 1.4.0

- Added Seat Status system for non-timed testers and reserved workstations.
- Added support for Reserved and Occupied seat states.
- Added support for multiple test categories.
- Added optional student assignment.
- Added Firebase-powered real-time synchronization.
- Added live seat coloring on Lab B and Lab C maps.
- Added seat clear functionality.
- Added duplicate seat protection.
- Added camera visibility indicators:
  - Green = Full Visibility
  - Orange = Partial Visibility
  - Red = Blind Spot
- Added searchable history system.
- Added history pagination.
- Added live timer alarm modal.
- Added repeating timer alarm improvements.
- Added +5 minute extension button.
- Added pause and resume support.
- Added password protection screen.
- Added Help documentation modal.
- Added version tracking system.
- Added changelog system.
- Improved responsive Bootstrap layout.
- Fixed synchronization and alarm edge cases.
- Improved multi-staff operational workflows.

# Version 1.0.0

## Initial Internal Release

- Firebase realtime timer synchronization.
- Lab B and Lab C interactive seating maps.
- Active timer dashboard.
- Timer alarm audio system.
- Live countdown timers.
- Seat map visual timer indicators.
- Realtime multi-user dashboard updates.