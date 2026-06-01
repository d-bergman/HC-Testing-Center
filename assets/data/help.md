# Overview

This dashboard is used to manage live testing activity across Lab B and Lab C. It tracks active timers, occupied seats, reserved seats, seat flags, projected end times, alarms, connected users, and seat history in real time.

Staff can add timers or seat statuses from the main form, or directly from an empty seat on the map using the seat Quick Add button. Active timers and seat statuses appear on the left side for quick management.

## Adding a Timer

1. Select Lab B or Lab C.
2. Enter the seat number. You can type **C16**, **B12**, or just **16** if the lab dropdown is correct.
3. Enter the student name.
4. Optional: enter a test label, instructor name, or other note in **Test Optional**.
5. Enter hours and minutes.
6. Click **Add Timer**.
7. The timer will appear paused first. Press **Play** when the student is seated and ready to begin.

## Adding From the Seat Map

1. Find an empty seat on the Lab B or Lab C map.
2. Click the **+** button on the seat.
3. The Add From Seat modal opens with the lab and seat already filled in.
4. Choose **Add Timer** or **Add Seat Status**.
5. Complete the required fields and click **Add**.

## Closing Time Auto-Trim

When a new timer is added, the dashboard automatically trims the timer if it would go past closing time. Closing time is currently 7:00 PM Monday–Thursday and 4:30 PM on Friday.

Auto-trim only happens when a timer is first added. The **+5** button and Edit Timer feature do not auto-trim.

## Editing a Timer

1. Pause the timer first.
2. Click **Edit** under the student name.
3. Update the lab, seat, student name, test label, hours, or minutes.
4. Click **Save Timer**.
5. The timer stays paused after editing. Press **Play** to resume.

## Timer Controls

- **Play/Pause:** starts or pauses the timer.
- **+5:** adds five minutes to the timer.
- **Edit:** allows a paused timer to be updated.
- **Flag:** applies or removes ADS/Misconduct seat coloring.
- **Trash:** removes the timer after confirmation.
- **Clear:** clears the timer from the seating map and works the same as deleting the timer.

## Projected End Time

Each active timer shows an estimated end time under the countdown. This helps staff quickly see when a student is expected to finish.

## Adding a Seat Status

1. Click **Add Seat Status**.
2. Select the lab and enter the seat.
3. Student name is optional.
4. Select **Reserved** or **Occupied**.
5. Select the test type: CNA, GED, TEAS, CLEP, Placement, HonorLock, or Other.
6. Click **Add Seat Status**.

## Seat Statuses List

Occupied and reserved seats also appear in the **Seat Statuses** section under Active Timers. This section allows staff to quickly clear a seat status or apply a seat flag.

## Active Count

The Active Timers count includes active timers as **Make-Up** tests and also includes occupied seat statuses by test type.

Example: **9 active - 3 Make-Up • 3 CNA • 2 GED • 1 CLEP**

## Seat Colors

- **Green:** Timer has more than 15 minutes left.
- **Orange:** Timer has 5–15 minutes left.
- **Red:** Timer has under 5 minutes left or is complete.
- **Blue:** Seat is occupied without a timer.
- **Purple:** Seat is reserved.
- **Yellow:** ADS flag.
- **Pink:** Misconduct flag.
- **Gray:** Seat is empty.
- **Dark Gray:** Seat is broken.

## Seat Flags

Seat flags are managed separately from the Test Optional field. Applying a flag changes the seat color without overwriting the test label, instructor name, or other notes.

- **ADS:** turns the seat yellow.
- **Misconduct:** turns the seat pink.
- **Broken:** turns the seat dark gray.
- **None:** removes the flag and returns the seat to its normal timer or seat status color.

## Camera Dots

- **Green dot:** Full camera view.
- **Orange dot:** Partial or harder-to-see camera view.
- **Red dot:** Camera blind spot.

## Alarm Sound

Click **Enable Sound** after opening the dashboard. Browsers usually require one click before they allow alarm audio.

A startup reminder appears after unlocking the dashboard to remind staff to enable sound on the workstation.

## Alarm Dismissal

When an alarm is dismissed on one dashboard, the dismissal syncs across all open dashboards.

## History

The History tab can search past timers and cleared occupied seat statuses by student, seat, lab, test, or date. Reserved seats are not logged unless a student name was entered.

## Duplicate Seat Protection

The dashboard prevents two active items from using the same seat. If a seat already has a timer or status, a confirmation popup will ask before replacing it.

### Important Notes

- Do not close the dashboard tab if you need alarm sounds on that workstation.
- Use **Enable Sound** once per workstation session.
- Use **Clear** when a student leaves a seat.
- The app updates live for all open staff dashboards.

## TC Dash Controller Chrome Extension Optional

The TC Dash Controller extension adds workstation audio ducking, Quick Add tools, Quick Seat Status controls, and a live mini-map directly inside Chrome.

- Automatic YouTube audio ducking during alarms
- Quick Add Timer popup
- Quick Seat Status controls
- Live Lab B / Lab C mini-map
- Keyboard shortcut support: **Ctrl + Shift + V**

## Installing the Extension

1. Download the extension ZIP below.
2. Extract the ZIP file.
3. Open Chrome and go to: `chrome://extensions`
4. Enable **Developer Mode** located at the top right.
5. Click **Load unpacked**.
6. Select the extracted extension folder.

The extension is optional. The dashboard works normally without it.

[Download TC Dash Controller Extension](assets/downloads/tc-dash-controller-v1.9.0.zip)