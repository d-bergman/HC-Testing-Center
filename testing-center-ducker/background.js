const DUCK_VOLUME = 0.1;
const FADE_STEPS = 20;
const FADE_DURATION = 1000;

function setAlarmBadge() {
  chrome.action.setBadgeText({ text: "!" });
  chrome.action.setBadgeBackgroundColor({ color: "#dc2626" });
}

function clearAlarmBadge() {
  chrome.action.setBadgeText({ text: "" });
}

function fadeVideoVolume(video, targetVolume) {
  if (!video.dataset.originalVolume) {
    video.dataset.originalVolume = video.volume;
  }

  const startVolume = video.volume;
  const difference = targetVolume - startVolume;
  let step = 0;

  if (video.dataset.fadeInterval) {
    clearInterval(Number(video.dataset.fadeInterval));
  }

  const interval = setInterval(() => {
    step++;

    const progress = step / FADE_STEPS;
    const nextVolume = startVolume + difference * progress;

    video.volume = Math.max(0, Math.min(1, nextVolume));

    if (step >= FADE_STEPS) {
      video.volume = targetVolume;
      clearInterval(interval);
      delete video.dataset.fadeInterval;
    }
  }, FADE_DURATION / FADE_STEPS);

  video.dataset.fadeInterval = interval;
}

async function duckYouTubeTabs() {
  const tabs = await chrome.tabs.query({
    url: [
      "*://*.youtube.com/*",
      "*://youtube.com/*",
      "*://*.music.youtube.com/*"
    ]
  });

  for (const tab of tabs) {
    if (!tab.id) continue;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (volume, steps, duration) => {
          document.querySelectorAll("video").forEach(video => {
            if (!video.dataset.originalVolume) {
              video.dataset.originalVolume = video.volume;
            }

            const startVolume = video.volume;
            const difference = volume - startVolume;
            let step = 0;

            if (video.dataset.fadeInterval) {
              clearInterval(Number(video.dataset.fadeInterval));
            }

            const interval = setInterval(() => {
              step++;

              const progress = step / steps;
              const nextVolume = startVolume + difference * progress;

              video.volume = Math.max(0, Math.min(1, nextVolume));

              if (step >= steps) {
                video.volume = volume;
                clearInterval(interval);
                delete video.dataset.fadeInterval;
              }
            }, duration / steps);

            video.dataset.fadeInterval = interval;
          });
        },
        args: [DUCK_VOLUME, FADE_STEPS, FADE_DURATION]
      });
    } catch (error) {
      console.warn("Could not duck tab:", tab.url, error);
    }
  }
}

async function restoreYouTubeTabs() {
  const tabs = await chrome.tabs.query({
    url: [
      "*://*.youtube.com/*",
      "*://youtube.com/*",
      "*://*.music.youtube.com/*"
    ]
  });

  for (const tab of tabs) {
    if (!tab.id) continue;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (steps, duration) => {
          document.querySelectorAll("video").forEach(video => {
            const original = video.dataset.originalVolume;

            if (original === undefined) return;

            const targetVolume = Number(original);
            const startVolume = video.volume;
            const difference = targetVolume - startVolume;
            let step = 0;

            if (video.dataset.fadeInterval) {
              clearInterval(Number(video.dataset.fadeInterval));
            }

            const interval = setInterval(() => {
              step++;

              const progress = step / steps;
              const nextVolume = startVolume + difference * progress;

              video.volume = Math.max(0, Math.min(1, nextVolume));

              if (step >= steps) {
                video.volume = targetVolume;
                clearInterval(interval);
                delete video.dataset.fadeInterval;
                delete video.dataset.originalVolume;
              }
            }, duration / steps);

            video.dataset.fadeInterval = interval;
          });
        },
        args: [FADE_STEPS, FADE_DURATION]
      });
    } catch (error) {
      console.warn("Could not restore tab:", tab.url, error);
    }
  }
}

chrome.commands.onCommand.addListener(command => {
  if (command === "open-quick-add") {
    chrome.windows.create({
  url: chrome.runtime.getURL("popup.html"),
  type: "popup",
  width: 340,
  height: 620
});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === "duck") {
        setAlarmBadge();
      await duckYouTubeTabs();
      sendResponse({ ok: true });
      return;
    }

    if (message.action === "restore") {
        clearAlarmBadge();
      await restoreYouTubeTabs();
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false });
  })();

  return true;
});