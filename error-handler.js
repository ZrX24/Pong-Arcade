/**
 * 1xx: Environment / Init
 * 2xx: DOM / Canvas
 * 3xx: Assets / Network
 * 4xx: Extension Runtime (Manifest, Service Worker, Storage)
 * 5xx: Gameplay / Runtime Exceptions
 */

const PONG_ERROR_CODES = {
  // 1xx: Environment / Init
  101: { category: '1xx: Environment/Init', label: 'ENV_WINDOW_UNDEFINED', message: 'Global window context unavailable.' },
  102: { category: '1xx: Environment/Init', label: 'ENV_CHROME_API_MISSING', message: 'Chrome extension runtime APIs are missing.' },
  103: { category: '1xx: Environment/Init', label: 'ENV_INIT_TIMEOUT', message: 'Initialization failed to complete in time.' },

  // 2xx: DOM / Canvas
  201: { category: '2xx: DOM/Canvas', label: 'DOM_CANVAS_MISSING', message: 'Game canvas element (#gameCanvas) was not found in the DOM.' },
  202: { category: '2xx: DOM/Canvas', label: 'DOM_CONTEXT_2D_FAILED', message: 'Failed to acquire 2D rendering context from canvas.' },
  203: { category: '2xx: DOM/Canvas', label: 'DOM_UI_ELEMENT_MISSING', message: 'One or more required HUD elements are missing from DOM.' },

  // 3xx: Assets / Network
  301: { category: '3xx: Assets/Network', label: 'ASSET_STYLESHEET_MISSING', message: 'Stylesheets failed to load or apply.' },
  302: { category: '3xx: Assets/Network', label: 'ASSET_FONT_IMAGE_LOAD_FAILED', message: 'Resource failed to fetch or decode.' },

  // 4xx: Extension Runtime
  401: { category: '4xx: Extension Runtime', label: 'EXT_DISCONNECTED', message: 'Port or runtime connection to service worker lost.' },
  402: { category: '4xx: Extension Runtime', label: 'EXT_STORAGE_ERROR', message: 'Failed to access chrome.storage runtime API.' },

  // 5xx: Gameplay / Runtime Exceptions
  501: { category: '5xx: Gameplay/Runtime', label: 'GAME_UNHANDLED_EXCEPTION', message: 'Uncaught JavaScript runtime error during game execution.' },
  502: { category: '5xx: Gameplay/Runtime', label: 'GAME_UNHANDLED_REJECTION', message: 'Unhandled asynchronous Promise rejection.' },
  503: { category: '5xx: Gameplay/Runtime', label: 'GAME_LOOP_CRASH', message: 'Fatal failure inside animation frame loop.' }
};

class PongDiagnostics {
  static dispatch(code, customDetails = '') {
    const errorDef = PONG_ERROR_CODES[code] || {
      category: '5xx: Gameplay/Runtime',
      label: 'UNKNOWN_ERROR',
      message: 'An unspecified error occurred.'
    };

    const errorPayload = {
      type: 'PONG_ERROR',
      code: code,
      category: errorDef.category,
      label: errorDef.label,
      message: `${errorDef.message} ${customDetails}`.trim(),
      timestamp: new Date().toISOString()
    };

    PongDiagnostics.displayErrorUI(errorPayload);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(errorPayload).catch(() => {
        console.warn(`[ERR ${code}] Service worker unreachable.`);
      });
    }

    console.error(`[ERROR ${errorPayload.code}] [${errorPayload.category}] ${errorPayload.message}`);
  }

  static displayErrorUI(error) {
    let overlay = document.getElementById('pong-error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pong-error-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(20, 5, 5, 0.92); color: #ff5555;
        font-family: monospace; z-index: 99999; padding: 20px; display: flex;
        flex-direction: column; justify-content: center; align-items: center; text-align: center;
      `;
      document.body ? document.body.appendChild(overlay) : document.documentElement.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div style="border: 2px solid #ff5555; padding: 24px; max-width: 480px; background: #000;">
        <h2 style="margin: 0 0 10px 0; color: #ff8888;">ERR_${error.code}: ${error.label}</h2>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #aaa;">Category: ${error.category}</p>
        <p style="margin: 0; font-size: 14px; color: #fff;">${error.message}</p>
      </div>
    `;
  }

  static verifyEnvironment() {
    if (typeof window === 'undefined') {
      PongDiagnostics.dispatch(101);
      return false;
    }
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      PongDiagnostics.dispatch(102);
    }
    return true;
  }

  static verifyDOM() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      PongDiagnostics.dispatch(201);
      return false;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      PongDiagnostics.dispatch(202);
      return false;
    }

    const requiredElements = ['playerScore', 'computerScore', 'status', 'gameMessage', 'messageText', 'restartButton'];
    const missing = requiredElements.filter(id => !document.getElementById(id));
    if (missing.length > 0) {
      PongDiagnostics.dispatch(203, `Missing UI IDs: ${missing.join(', ')}`);
      return false;
    }

    return true;
  }
}

window.addEventListener('error', (event) => {
  PongDiagnostics.dispatch(501, `${event.message} at ${event.filename}:${event.lineno}`);
});

window.addEventListener('unhandledrejection', (event) => {
  PongDiagnostics.dispatch(502, event.reason ? (event.reason.message || String(event.reason)) : '');
});

PongDiagnostics.verifyEnvironment();

document.addEventListener('DOMContentLoaded', () => {
  PongDiagnostics.verifyDOM();
});
