import assert from "node:assert/strict";
import test from "node:test";
import {
  getClosingDeadlineMs,
  getEditDeadlineMs,
  getFiveMinuteUpdate,
  getNewTimerTiming,
  getProjectedEndMs,
  getRemainingSeconds,
  getResumeEndMs
} from "../assets/js/timer-closing.mjs";

const thursday = new Date(2026, 8, 24, 18, 30).getTime();
const closing = getClosingDeadlineMs(thursday);

test("new timers are trimmed to closing at second precision", () => {
  const now = new Date(2026, 8, 24, 18, 59, 30).getTime();
  assert.deepEqual(getNewTimerTiming(3600, now), {
    remainingSeconds: 30,
    closingDeadlineMs: closing
  });
  assert.equal(getNewTimerTiming(3600, closing).remainingSeconds, 0);
  const fridayClosing = new Date(
    getClosingDeadlineMs(new Date(2026, 8, 25, 15).getTime())
  );
  assert.equal(fridayClosing.getHours(), 16);
  assert.equal(fridayClosing.getMinutes(), 30);
});

test("paused time shrinks against closing and cannot resume past it", () => {
  const timer = {
    paused: true,
    pausedRemaining: 1800,
    closingDeadlineMs: closing
  };
  const now = new Date(2026, 8, 24, 18, 33).getTime();
  assert.equal(getRemainingSeconds(timer, now), 1620);
  assert.equal(getResumeEndMs(timer, now), closing);
  assert.equal(getProjectedEndMs(timer, now), closing);
  assert.equal(getRemainingSeconds(timer, closing), 0);
  assert.equal(getResumeEndMs(timer, closing), null);
  assert.equal(getProjectedEndMs(timer, closing + 60000), closing);
  assert.equal(getRemainingSeconds(timer, closing - 500), 1);
  assert.equal(getResumeEndMs(timer, closing - 500), closing);
});

test("a running timer keeps its remaining time when paused, then loses waiting time", () => {
  const pauseAt = new Date(2026, 8, 24, 18, 40).getTime();
  const running = { paused: false, endAt: closing, closingDeadlineMs: closing };
  const paused = {
    paused: true,
    pausedRemaining: getRemainingSeconds(running, pauseAt),
    closingDeadlineMs: closing
  };

  assert.equal(paused.pausedRemaining, 1200);
  assert.equal(getRemainingSeconds(paused, pauseAt + 300000), 900);
  assert.equal(getResumeEndMs(paused, pauseAt + 300000), closing);
});

test("manual +5 extends the cap while later pauses still consume time", () => {
  const timer = {
    paused: true,
    pausedRemaining: 1800,
    closingDeadlineMs: closing
  };
  const now = new Date(2026, 8, 24, 18, 33).getTime();
  const added = getFiveMinuteUpdate(timer, now);
  assert.equal(added.pausedRemaining, 1920);
  assert.equal(added.closingDeadlineMs, closing + 300000);
  assert.equal(getResumeEndMs({ ...timer, ...added }, now + 600000), closing + 300000);

  const running = { paused: false, endAt: closing, closingDeadlineMs: closing };
  const runningAdded = getFiveMinuteUpdate(running, closing + 120000);
  assert.equal(runningAdded.endAt, closing + 420000);
  assert.equal(runningAdded.closingDeadlineMs, runningAdded.endAt);

  const afterClosing = getFiveMinuteUpdate(timer, closing + 120000);
  assert.equal(afterClosing.pausedRemaining, 300);
  assert.equal(afterClosing.closingDeadlineMs, closing + 420000);
  assert.equal(
    getResumeEndMs({ ...timer, ...afterClosing }, closing + 120000),
    closing + 420000
  );
});

test("editing can intentionally set a later deadline", () => {
  const now = new Date(2026, 8, 24, 18, 45).getTime();
  const editedDeadline = getEditDeadlineMs({ closingDeadlineMs: closing }, 3600, now);
  assert.equal(editedDeadline, now + 3600000);
  const edited = { paused: true, pausedRemaining: 3600, closingDeadlineMs: editedDeadline };
  assert.equal(getResumeEndMs(edited, now + 300000), editedDeadline);
  assert.equal(
    getEditDeadlineMs({ closingDeadlineMs: editedDeadline }, 300, now + 600000),
    editedDeadline
  );
});

test("legacy timers without a deadline keep their current timing", () => {
  const timer = { paused: true, pausedRemaining: 1800 };
  assert.equal(getRemainingSeconds(timer, closing), 1800);
  assert.equal(getResumeEndMs(timer, closing), closing + 1800000);
});
