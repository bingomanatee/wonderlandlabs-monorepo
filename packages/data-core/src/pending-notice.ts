import { coloredPendingIcon } from './pending-indicator.icon.js'

export interface PendingNoticeOptions {
  /** localStorage key used to remember “don’t show again” for this site. */
  storageKey?: string
}

const notice = {
  storageKey: 'forestry-data-core:pending-notice-dismissed',
  dismissed: 'dismissed',
  title: 'Do not close the window when data is being saved',
  explanation:
    'The spinning icon in the lower right means there are ' +
    'unsaved changes. The number shows how many records still need saving.',
  instruction:
    'Keep this page open until the icon disappears. Closing ' +
    'the page before saving finishes could lose your latest changes.',
  checkbox: 'Don’t show this again',
  confirm: 'Got it',
  titleId: 'pending-notice-title',
  descriptionId: 'pending-notice-description',
}

let activeNotice: (() => void) | undefined

/** Explain the pending icon. Returns a function that removes this notice. */
export function showPendingNotice(options: PendingNoticeOptions = {}) {
  const key = options.storageKey ?? notice.storageKey
  try {
    if (window.localStorage.getItem(key) === notice.dismissed) return () => {}
  } catch {
    // The notice still works when browser storage is unavailable.
  }
  if (activeNotice) return activeNotice

  const host = document.createElement('div')
  const root = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = `
dialog {
  box-sizing: border-box; width: min(420px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px); overflow: auto;
  border: 1px solid #ccc; border-radius: 8px; padding: 24px;
  background: white; color: #171717;
  font: 16px/1.5 system-ui, sans-serif;
}
dialog::backdrop { background: rgb(0 0 0 / 45%); }
.pending-icon {
  display: block; width: 48px; height: 48px; margin: 0 auto 16px;
  animation: pending-notice-spin 1s linear infinite;
}
@keyframes pending-notice-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .pending-icon { animation: none; }
}
h2 { margin: 0 0 16px; font-size: 20px; line-height: 1.3; }
p { margin: 0 0 16px; }
label { display: flex; gap: 8px; align-items: center; cursor: pointer; }
input { width: 16px; height: 16px; margin: 0; }
button {
  display: block; margin: 24px 0 0 auto; padding: 8px 16px;
  border: 1px solid #777; border-radius: 4px; cursor: pointer;
  background: #f4f4f4; color: #171717; font: inherit;
}
button:focus-visible, input:focus-visible { outline: 2px solid #1769aa; }
`
  const dialog = document.createElement('dialog')
  dialog.setAttribute('aria-labelledby', notice.titleId)
  dialog.setAttribute('aria-describedby', notice.descriptionId)
  const title = document.createElement('h2')
  title.id = notice.titleId
  title.textContent = notice.title
  const icon = document.createElement('img')
  icon.className = 'pending-icon'
  icon.src = coloredPendingIcon(64)
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')
  const description = document.createElement('div')
  description.id = notice.descriptionId
  for (const text of [notice.explanation, notice.instruction]) {
    const paragraph = document.createElement('p')
    paragraph.textContent = text
    description.append(paragraph)
  }
  const label = document.createElement('label')
  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  label.append(checkbox, document.createTextNode(notice.checkbox))
  const confirm = document.createElement('button')
  confirm.type = 'button'
  confirm.textContent = notice.confirm
  confirm.autofocus = true
  dialog.append(title, icon, description, label, confirm)
  root.append(style, dialog)

  let removed = false
  const cleanup = () => {
    if (removed) return
    removed = true
    confirm.removeEventListener('click', dismiss)
    dialog.removeEventListener('cancel', dismiss)
    dialog.removeEventListener('close', dismiss)
    if (dialog.open) dialog.close()
    host.remove()
    if (activeNotice === cleanup) activeNotice = undefined
  }
  const dismiss = (event: Event) => {
    event.preventDefault()
    if (checkbox.checked) {
      try {
        window.localStorage.setItem(key, notice.dismissed)
      } catch {
        // Dismissing must work even when storage is unavailable or full.
      }
    }
    cleanup()
  }
  confirm.addEventListener('click', dismiss)
  dialog.addEventListener('cancel', dismiss)
  dialog.addEventListener('close', dismiss)
  document.body.append(host)
  activeNotice = cleanup
  try {
    dialog.showModal()
  } catch (error) {
    cleanup()
    throw error
  }
  return cleanup
}
