import { coloredPendingIcon } from './pending-indicator.icon.js';
const defaults = { scale: 0.5, speed: 1, hue: 64 };
const messages = {
    pending: 'Unsaved changes. Keep this page open until saving finishes.',
    invalid: 'Options must be finite; scale positive and speed nonnegative.',
    invalidCount: 'Pending count must be a nonnegative safe integer.',
    count: (count) => `${count} unsaved ${count === 1 ? 'record' : 'records'}. Keep this page open until saving finishes.`,
};
/** Create in a browser; importing this module does not require a DOM. */
export function createPendingIndicator(options = {}) {
    let settings = { ...defaults, ...options };
    const validate = (value) => {
        if (!Number.isFinite(value.scale) || value.scale <= 0 ||
            !Number.isFinite(value.speed) || value.speed < 0 ||
            !Number.isFinite(value.hue)) {
            throw new TypeError(messages.invalid);
        }
    };
    validate(settings);
    const host = document.createElement('div');
    host.hidden = true;
    host.style.cssText = 'position:fixed;right:16px;bottom:16px;' +
        'z-index:2147483647;pointer-events:none;';
    host.setAttribute('role', 'img');
    host.setAttribute('aria-label', messages.pending);
    host.title = messages.pending;
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
:host([hidden]) { display: none; }
.count {
  position: absolute; inset: 15%; display: grid; place-items: center;
  border-radius: 50%; background: white; color: #111;
  font-family: system-ui, sans-serif; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
img { display: block; animation: pending-spin var(--duration) linear infinite; }
@keyframes pending-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { img { animation: none; } }
`;
    const icon = document.createElement('img');
    icon.alt = '';
    const countLabel = document.createElement('span');
    countLabel.className = 'count';
    countLabel.setAttribute('aria-hidden', 'true');
    root.append(style, icon, countLabel);
    let count = 0;
    let destroyed = false;
    let renderedHue;
    const apply = () => {
        const hue = ((settings.hue % 360) + 360) % 360;
        if (hue !== renderedHue) {
            icon.src = coloredPendingIcon(hue);
            renderedHue = hue;
        }
        icon.width = Math.round(64 * settings.scale);
        icon.height = icon.width;
        icon.style.setProperty('--duration', `${1 / (settings.speed || 1)}s`);
        icon.style.animationPlayState = settings.speed ? 'running' : 'paused';
        const digits = String(count).length;
        countLabel.style.fontSize = `${Math.min(icon.width * 0.36, icon.width * 0.62 / (0.65 * digits))}px`;
    };
    apply();
    return {
        /** Count unique unsaved records, including failed saves. Zero hides. */
        setPending(unsavedRecords) {
            if (destroyed)
                return;
            if (!Number.isSafeInteger(unsavedRecords) || unsavedRecords < 0) {
                throw new TypeError(messages.invalidCount);
            }
            count = unsavedRecords;
            countLabel.textContent = String(count);
            const label = messages.count(count);
            host.setAttribute('aria-label', label);
            host.title = label;
            apply();
            if (count && !host.isConnected)
                document.body.append(host);
            host.hidden = count === 0;
        },
        configure(next) {
            if (destroyed)
                return;
            const updated = { ...settings, ...next };
            validate(updated);
            settings = updated;
            apply();
        },
        /** Remove the element. Later calls do nothing. */
        destroy() {
            destroyed = true;
            host.remove();
        },
    };
}
export { showPendingNotice } from './pending-notice.js';
