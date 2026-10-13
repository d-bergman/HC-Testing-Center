import assert from "node:assert/strict";
import test from "node:test";
import {
  getPageRotationMs,
  getTimerPage,
  MAX_TIMERS_PER_PAGE,
  sortTimersByCompletion
} from "../assets/js/timer-monitor.mjs";

const now = Date.parse("2026-10-13T12:00:00Z");

function running(id, minutes, createdAtMs = 0) {
  return { id, endAt: now + minutes * 60_000, paused: false, createdAtMs };
}

test("timers sort by soonest completion, not creation order", () => {
  const timers = [running("later", 60, 1), running("soon", 3, 3), running("middle", 20, 2)];
  const sorted = sortTimersByCompletion(timers, now);
  assert.deepEqual(sorted.map(timer => timer.id), ["soon", "middle", "later"]);
  assert.equal(timers[0].id, "later");
});

test("paused timers use their projected remaining time for order", () => {
  const paused = { id: "paused", paused: true, pausedRemaining: 120, createdAtMs: 2 };
  const sorted = sortTimersByCompletion([running("running", 3, 1), paused], now);
  assert.deepEqual(sorted.map(timer => timer.id), ["paused", "running"]);
});

test("ties retain a stable creation-time order", () => {
  const sorted = sortTimersByCompletion([running("newer", 5, 2), running("older", 5, 1)], now);
  assert.deepEqual(sorted.map(timer => timer.id), ["older", "newer"]);
});

test("page rotation accelerates as the number of pages grows", () => {
  assert.equal(getPageRotationMs(0), 0);
  assert.equal(getPageRotationMs(1), 0);
  assert.equal(getPageRotationMs(2), 20_000);
  assert.equal(getPageRotationMs(3), 15_000);
  assert.equal(getPageRotationMs(4), 10_000);
  assert.equal(getPageRotationMs(8), 10_000);
});

test("twenty timers form two pages at ten per page", () => {
  const timers = Array.from({ length: 20 }, (_, index) => running(String(index), index + 1));
  assert.equal(MAX_TIMERS_PER_PAGE, 10);
  assert.deepEqual(getTimerPage(timers, 0, 10).map(timer => timer.id), timers.slice(0, 10).map(timer => timer.id));
  assert.deepEqual(getTimerPage(timers, 1, 10).map(timer => timer.id), timers.slice(10).map(timer => timer.id));
  assert.equal(getTimerPage(timers, 2, 10).length, 0);
});

test("a smaller display can use fewer rows without losing a timer", () => {
  const timers = Array.from({ length: 20 }, (_, index) => running(String(index), index + 1));
  const pages = [0, 1, 2].flatMap(index => getTimerPage(timers, index, 7));
  assert.deepEqual(pages.map(timer => timer.id), timers.map(timer => timer.id));
});
