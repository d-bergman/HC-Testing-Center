import { getProjectedEndMs, getRemainingSeconds } from "./timer-closing.mjs";

export const MAX_TIMERS_PER_PAGE = 10;
export const PAGE_ROTATION_MS = 12_000;

export function sortTimersByCompletion(timers, nowMs = Date.now()) {
  return [...timers].sort((a, b) =>
    getRemainingSeconds(a, nowMs) - getRemainingSeconds(b, nowMs) ||
    getProjectedEndMs(a, nowMs) - getProjectedEndMs(b, nowMs) ||
    (a.createdAtMs || 0) - (b.createdAtMs || 0) ||
    String(a.id).localeCompare(String(b.id))
  );
}

export function getUrgentTimers(timers, nowMs = Date.now()) {
  return sortTimersByCompletion(timers, nowMs).filter(
    timer => getRemainingSeconds(timer, nowMs) <= 300
  );
}

export function getTimerPage(timers, pageIndex, pageSize) {
  const size = Math.max(1, Math.min(MAX_TIMERS_PER_PAGE, pageSize));
  return timers.slice(pageIndex * size, (pageIndex + 1) * size);
}
