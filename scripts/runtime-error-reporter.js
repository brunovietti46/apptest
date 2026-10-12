
// Runtime Error Reporter - captures app errors for auto-fixer
(function() {
  if (window.__runtimeErrorReporterInstalled) return;
  window.__runtimeErrorReporterInstalled = true;

  var reported = {};
  var COOLDOWN_MS = 3000;

  function sendError(msg, file, line, col, stack) {
    // Deduplicate: same message within cooldown
    var key = (msg || '') + ':' + (file || '') + ':' + (line || 0);
    var now = Date.now();
    if (reported[key] && now - reported[key] < COOLDOWN_MS) return;
    reported[key] = now;

    // Skip errors from extensions, devtools, or our own scripts
    if (file && (file.includes('chrome-extension') || file.includes('moz-extension'))) return;
    if (file && file.includes('/scripts/')) return;

    try {
      window.parent.postMessage({
        type: 'RUNTIME_ERROR',
        message: String(msg || 'Unknown error'),
        file: file || undefined,
        line: line || undefined,
        column: col || undefined,
        stack: stack ? String(stack).substring(0, 2000) : undefined,
        timestamp: now
      }, '*');
    } catch (e) {}
  }

  // Global error handler (synchronous errors)
  window.addEventListener('error', function(event) {
    // Skip resource load errors (images, stylesheets) but NOT script errors
    if (event.target && event.target !== window && event.target.tagName !== 'SCRIPT') return;

    sendError(
      event.message,
      event.filename,
      event.lineno,
      event.colno,
      event.error && event.error.stack
    );
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = reason ? (reason.message || String(reason)) : 'Unhandled promise rejection';
    var stack = reason && reason.stack;

    sendError(message, undefined, undefined, undefined, stack);
  });

  // Capture React error boundaries (they swallow errors)
  var origConsoleError = console.error;
  console.error = function() {
    origConsoleError.apply(console, arguments);

    var msg = Array.prototype.join.call(arguments, ' ');
    // React error boundary messages and critical runtime errors
    if (msg.includes('The above error occurred in') ||
        msg.includes('Consider adding an error boundary') ||
        msg.includes('Uncaught Error') ||
        msg.includes('Unhandled Runtime Error') ||
        msg.includes('has been externalized for browser compatibility') ||
        msg.includes('Buffer is not defined') ||
        msg.includes('Buffer.from is not a function') ||
        msg.includes('process is not defined')) {
      sendError(msg);
    }
  };

  // Detect Vite build/compilation errors (syntax errors, missing brackets, etc.)
  // Vite creates a vite-error-overlay custom element when builds fail
  var buildErrorObserver = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      for (var j = 0; j < mutations[i].addedNodes.length; j++) {
        var node = mutations[i].addedNodes[j];
        if (node.tagName && node.tagName.toLowerCase() === 'vite-error-overlay') {
          // Extract error text from the overlay's shadow DOM
          setTimeout(function() {
            try {
              var shadow = node.shadowRoot;
              if (!shadow) return;
              var msgEl = shadow.querySelector('.message-body') || shadow.querySelector('.message') || shadow.querySelector('pre');
              var fileEl = shadow.querySelector('.file') || shadow.querySelector('.file-link');
              var errorText = msgEl ? msgEl.textContent : 'Vite build error';
              var fileText = fileEl ? fileEl.textContent : '';
              // Parse file:line:col from file text
              var locMatch = fileText.match(/([^:]+):(d+):(d+)/);
              sendError(
                errorText.substring(0, 500),
                locMatch ? locMatch[1] : undefined,
                locMatch ? parseInt(locMatch[2]) : undefined,
                locMatch ? parseInt(locMatch[3]) : undefined,
                undefined
              );
            } catch (e) {}
          }, 100);
        }
      }
    }
  });
  buildErrorObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Check for already-existing overlay (race condition: overlay may mount before this script runs)
  var existingOverlay = document.querySelector('vite-error-overlay');
  if (existingOverlay) {
    setTimeout(function() {
      try {
        var shadow = existingOverlay.shadowRoot;
        if (!shadow) return;
        var msgEl = shadow.querySelector('.message-body') || shadow.querySelector('.message') || shadow.querySelector('pre');
        var fileEl = shadow.querySelector('.file') || shadow.querySelector('.file-link');
        var errorText = msgEl ? msgEl.textContent : 'Vite build error';
        var fileText = fileEl ? fileEl.textContent : '';
        var locMatch = fileText.match(/([^:]+):(d+):(d+)/);
        sendError(
          errorText.substring(0, 500),
          locMatch ? locMatch[1] : undefined,
          locMatch ? parseInt(locMatch[2]) : undefined,
          locMatch ? parseInt(locMatch[3]) : undefined,
          undefined
        );
      } catch (e) {}
    }, 100);
  }

  // Render-health probe: confirm the app actually painted something, so the
  // parent can gate "build success" on a real render — not just a 200 from the
  // preview server. A bad named import (e.g. a non-existent lucide icon) or a
  // root that renders null leaves #root empty → white screen the build never
  // catches. We post PREVIEW_READY / PREVIEW_BLANK after the app has had time
  // to mount.
  function rootContentSize() {
    var el = document.getElementById('root') || document.getElementById('app');
    if (!el) {
      // Fall back to body, excluding our injected <script> tags.
      el = document.body;
      if (!el) return 0;
      var nonScript = 0;
      for (var i = 0; i < el.children.length; i++) {
        if (el.children[i].tagName && el.children[i].tagName.toLowerCase() !== 'script') nonScript++;
      }
      return nonScript + (el.textContent || '').trim().length;
    }
    return el.querySelectorAll('*').length + (el.textContent || '').trim().length;
  }
  var lastRenderState = null; // 'ready' | 'blank' — only report transitions
  function reportRenderHealth() {
    var hasOverlay = !!document.querySelector('vite-error-overlay');
    var state = (rootContentSize() > 0 && !hasOverlay) ? 'ready' : 'blank';
    if (state === lastRenderState) return;
    lastRenderState = state;
    try {
      window.parent.postMessage({
        type: state === 'ready' ? 'PREVIEW_READY' : 'PREVIEW_BLANK',
        timestamp: Date.now()
      }, '*');
    } catch (e) {}
  }
  function scheduleRenderHealth() {
    // Settle for async React mount; if still blank, retry once before concluding.
    setTimeout(function() {
      reportRenderHealth();
      if (lastRenderState !== 'ready') setTimeout(reportRenderHealth, 1500);
    }, 1500);
  }
  // Re-evaluate when the mount point's children change (HMR, late async render,
  // recovery after the fixer patches a bad import) so a blank→content flip
  // re-reports PREVIEW_READY without needing a full reload.
  var __rootEl = document.getElementById('root') || document.getElementById('app') || document.body;
  if (__rootEl && typeof MutationObserver !== 'undefined') {
    // Debounce: a re-render or route transition can momentarily empty #root.
    // Only conclude after the DOM settles ~800ms so we don't flap to BLANK
    // (and spuriously trigger the fixer) on a working app mid-transition.
    var __moTimer = null;
    var __mo = new MutationObserver(function() {
      if (__moTimer) clearTimeout(__moTimer);
      __moTimer = setTimeout(reportRenderHealth, 800);
    });
    __mo.observe(__rootEl, { childList: true });
  }
  // Signal the parent immediately before a full reload (e.g. a Vite HMR restart
  // after a file edit) so it can re-show its loading mask over the brief gateway
  // 502/503 window — and over the reload landing on the Traefik error page —
  // instead of letting the raw error flash. PREVIEW_READY (above) clears it once
  // the app repaints. pagehide fires on full reloads/navigations but NOT on HMR
  // partial updates, so this only masks genuine reloads.
  window.addEventListener('pagehide', function() {
    try {
      window.parent.postMessage({ type: 'PREVIEW_RELOADING', timestamp: Date.now() }, '*');
    } catch (e) {}
  });
  if (document.readyState === 'complete') scheduleRenderHealth();
  else window.addEventListener('load', scheduleRenderHealth);
})();
