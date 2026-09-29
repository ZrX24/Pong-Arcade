// Background Service Worker: Handles Extension Lifecycle and Error Telemetry (Category 4xx)

const ERROR_CATALOG = {
  401: 'EXT_SERVICE_WORKER_INIT_FAILED',
  402: 'EXT_STORAGE_READ_WRITE_FAILED',
  403: 'EXT_RUNTIME_MESSAGE_DISCONNECTED',
  404: 'EXT_MANIFEST_CONFIG_ERROR'
};

chrome.runtime.onInstalled.addListener((details) => {
  try {
    console.log('[Pong Service Worker] Extension installed/updated:', details.reason);
    chrome.storage.local.set({ gameLogs: [], lastError: null }, () => {
      if (chrome.runtime.lastError) {
        logExtensionError(402, chrome.runtime.lastError.message);
      }
    });
  } catch (err) {
    logExtensionError(401, err.message);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PONG_ERROR') {
    console.error(`[ERR ${message.code}] [${message.category}] ${message.message}`, message.details || '');

    chrome.storage.local.get({ gameLogs: [] }, (data) => {
      const updatedLogs = [...data.gameLogs, { ...message, timestamp: new Date().toISOString() }];
      chrome.storage.local.set({ gameLogs: updatedLogs, lastError: message });
    });

    sendResponse({ status: 'ACK', errorCode: message.code });
  }

  if (message.type === 'GET_LOGS') {
    chrome.storage.local.get(['gameLogs', 'lastError'], (data) => {
      sendResponse(data);
    });
    return true;
  }
});

function logExtensionError(code, detail) {
  const errorObj = {
    type: 'PONG_ERROR',
    code,
    category: '4xx: Extension Runtime',
    message: ERROR_CATALOG[code] || 'Unknown extension runtime error',
    details: detail
  };
  console.error(`[ERR ${code}]`, errorObj);
}
