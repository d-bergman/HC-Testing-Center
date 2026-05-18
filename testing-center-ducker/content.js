window.addEventListener("message", event => {
  if (event.source !== window) return;
  if (event.data?.source !== "testing-center-dashboard") return;

  if (event.data.action === "duck") {
    chrome.runtime.sendMessage({ action: "duck" });
  }

  if (event.data.action === "restore") {
    chrome.runtime.sendMessage({ action: "restore" });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestSeatMap") {
    window.postMessage(
      {
        source: "testing-center-extension",
        action: "requestSeatMap"
      },
      "*"
    );

    const handleResponse = event => {
      if (event.source !== window) return;
      if (event.data?.action !== "seatMapData") return;

      window.removeEventListener("message", handleResponse);

      sendResponse({
        ok: true,
        data: event.data.data
      });
    };

    window.addEventListener("message", handleResponse);

    return true;
  }
  if (message.action === "quickAddSeatStatus") {
  const data = message.data;

  document.getElementById("seatStatusModeBtn")?.click();

  document.getElementById("labInput").value = data.lab;
  document.getElementById("seatInput").value = data.seat;
  document.getElementById("studentInput").value = data.student;
  document.getElementById("testTypeInput").value = data.testType;
  document.getElementById("seatStatusInput").value = data.status;

  document.getElementById("addSeatStatusBtn")?.click();

  sendResponse({ ok: true });
  return;
}

  if (message.action !== "quickAddTimer") return;

  const data = message.data;

  document.getElementById("timerModeBtn")?.click();

  document.getElementById("labInput").value = data.lab;
  document.getElementById("seatInput").value = data.seat;
  document.getElementById("studentInput").value = data.student;
  document.getElementById("testInput").value = data.test;
  document.getElementById("hoursInput").value = data.hours;
  document.getElementById("minutesInput").value = data.minutes;

  document.getElementById("startTimerBtn")?.click();

  sendResponse({ ok: true });
});