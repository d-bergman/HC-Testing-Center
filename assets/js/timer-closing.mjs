const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function getClosingDeadlineMs(nowMs = Date.now()) {
  const closing = new Date(nowMs);
  if (closing.getDay() === 5) {
    closing.setHours(16, 30, 0, 0);
  } else {
    closing.setHours(19, 0, 0, 0);
  }
  return closing.getTime();
}

export function secondsUntilDeadline(deadlineMs, nowMs = Date.now()) {
  return Math.max(0, Math.floor((deadlineMs - nowMs) / 1000));
}

export function getNewTimerTiming(requestedSeconds, nowMs = Date.now()) {
  const closingDeadlineMs = getClosingDeadlineMs(nowMs);
  return {
    remainingSeconds: Math.min(
      requestedSeconds,
      secondsUntilDeadline(closingDeadlineMs, nowMs)
    ),
    closingDeadlineMs
  };
}

export function getRemainingSeconds(timer, nowMs = Date.now()) {
  const remaining = timer.paused
    ? timer.pausedRemaining || 0
    : Math.ceil((timer.endAt - nowMs) / 1000);

  if (!Number.isFinite(timer.closingDeadlineMs)) {
    return Math.max(0, remaining);
  }

  return Math.min(
    Math.max(0, remaining),
    Math.max(0, Math.ceil((timer.closingDeadlineMs - nowMs) / 1000))
  );
}

export function getProjectedEndMs(timer, nowMs = Date.now()) {
  const projectedEndMs = timer.paused
    ? nowMs + (timer.pausedRemaining || 0) * 1000
    : timer.endAt;

  return Number.isFinite(timer.closingDeadlineMs)
    ? Math.min(projectedEndMs, timer.closingDeadlineMs)
    : projectedEndMs;
}

export function getResumeEndMs(timer, nowMs = Date.now()) {
  const remaining = getRemainingSeconds(timer, nowMs);
  if (remaining <= 0) return null;

  const endAt = nowMs + remaining * 1000;
  return Number.isFinite(timer.closingDeadlineMs)
    ? Math.min(endAt, timer.closingDeadlineMs)
    : endAt;
}

export function getFiveMinuteUpdate(timer, nowMs = Date.now()) {
  const hasDeadline = Number.isFinite(timer.closingDeadlineMs);

  if (timer.paused) {
    const pausedRemaining = getRemainingSeconds(timer, nowMs) + 300;
    return {
      pausedRemaining,
      alarmDismissed: false,
      ...(hasDeadline && {
        closingDeadlineMs: Math.max(
          timer.closingDeadlineMs + FIVE_MINUTES_MS,
          nowMs + pausedRemaining * 1000
        )
      })
    };
  }

  const endAt = Math.max(timer.endAt, nowMs) + FIVE_MINUTES_MS;
  return {
    endAt,
    alarmDismissed: false,
    ...(hasDeadline && {
      closingDeadlineMs: Math.max(
        timer.closingDeadlineMs + FIVE_MINUTES_MS,
        endAt
      )
    })
  };
}

export function getEditDeadlineMs(timer, durationSeconds, nowMs = Date.now()) {
  const existingDeadline = Number.isFinite(timer.closingDeadlineMs)
    ? timer.closingDeadlineMs
    : getClosingDeadlineMs(nowMs);

  return Math.max(existingDeadline, nowMs + durationSeconds * 1000);
}
