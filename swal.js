// resources/js/swal.js
import Swal from 'sweetalert2'
window.Swal = Swal

// Toast mixin (small, top corner)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  timer: 3000,
  timerProgressBar: true,
  showConfirmButton: false,
})

// Small toasts
window.swalToastSuccess = (title = 'Success', text = '', opts = {}) =>
  Toast.fire({ icon: 'success', title, text, ...opts })

window.swalToastWarning = (title = 'Warning', text = '', opts = {}) =>
  Toast.fire({ icon: 'warning', title, text, ...opts })

window.swalToastError = (title = 'Error', text = '', opts = {}) =>
  Toast.fire({ icon: 'error', title, text, ...opts })

// Larger modals
window.swalFireSuccess = (title = 'Success', text = '', opts = {}) =>
  Swal.fire({ icon: 'success', title, text, ...opts })

window.swalFireWarning = (title = 'Warning', text = '', opts = {}) =>
  Swal.fire({ icon: 'warning', title, text, ...opts })

window.swalFireError = (title = 'Error', text = '', opts = {}) =>
  Swal.fire({ icon: 'error', title, text, ...opts })

// Generic input prompt: returns the entered value or null if cancelled
window.swalTakeInput = async (cfg = {}) => {
  const {
    title = 'Enter a value',
    text = '',
    input = 'text', // e.g., 'text' | 'email' | 'password' | 'number' | 'textarea'
    inputLabel = '',
    inputPlaceholder = '',
    inputAttributes = {},
    confirmButtonText = 'OK',
    cancelButtonText = 'Cancel',
    showCancelButton = true,
    ...opts
  } = cfg

  const res = await Swal.fire({
    icon: 'question',
    title,
    text,
    input,
    inputLabel,
    inputPlaceholder,
    inputAttributes,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    ...opts,
  })

  if (res.isConfirmed) return res.value ?? '' // SweetAlert2 returns value on confirm
  return null
}

// Password prompt preset
window.swalPromptPassword = (cfg = {}) =>
  window.swalTakeInput({
    title: 'Enter your password',
    input: 'password',
    inputLabel: 'Password',
    inputPlaceholder: 'Enter your password',
    inputAttributes: { autocapitalize: 'off', autocorrect: 'off', ...cfg.inputAttributes },
    confirmButtonText: 'Verify',
    ...cfg,
  })

// Confirm (modal-only): returns boolean
window.swalFireAsk = async (cfg = {}) => {
  const {
    title = 'Are you sure?',
    text = '',
    confirmButtonText = 'Yes',
    cancelButtonText = 'No',
    ...opts
  } = cfg
  const res = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    ...opts,
  })
  return res.isConfirmed
}

// Livewire v3 integration
document.addEventListener('livewire:init', () => {
  if (window.__swalLivewireBound) return
  window.__swalLivewireBound = true

  // Toast from PHP
  Livewire.on('swal:toast', (cfg = {}) => {
    const { icon, title, text, opts = {} } = cfg || {}
    if (icon === 'success') return window.swalToastSuccess(title || 'Success', text || '', opts)
    if (icon === 'warning') return window.swalToastWarning(title || 'Warning', text || '', opts)
    if (icon === 'error')   return window.swalToastError(title || 'Error', text || '', opts)
    return Toast.fire({ title, text, ...opts })
  })

  // Modal from PHP
  Livewire.on('swal:modal', (cfg = {}) => {
    const { icon, title, text, opts = {} } = cfg || {}
    if (icon === 'success') return window.swalFireSuccess(title || 'Success', text || '', opts)
    if (icon === 'warning') return window.swalFireWarning(title || 'Warning', text || '', opts)
    if (icon === 'error')   return window.swalFireError(title || 'Error', text || '', opts)
    return Swal.fire({ title, text, ...opts })
  })

  // Confirm from PHP
  Livewire.on('swal:confirm', async (cfg = {}) => {
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg || {}
    const ok = await window.swalFireAsk({ ...cfg, ...opts })
    if (ok && thenEvent) {
      if (thenEventTo) Livewire.dispatchTo(thenEventTo, thenEvent, thenParams)
      else Livewire.dispatch(thenEvent, thenParams)
    }
  })

  // Generic input from PHP → send value back via thenEvent
  Livewire.on('swal:input', async (cfg = {}) => {
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg || {}
    const value = await window.swalTakeInput({ ...cfg, ...opts })
    if (value === null || !thenEvent) return
    const payload = { value, ...thenParams }
    if (thenEventTo) Livewire.dispatchTo(thenEventTo, thenEvent, payload)
    else Livewire.dispatch(thenEvent, payload)
  })

  // Password prompt from PHP → send value back via thenEvent
  Livewire.on('swal:password', async (cfg = {}) => {
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg || {}
    const value = await window.swalPromptPassword({ ...cfg, ...opts })
    if (value === null || !thenEvent) return
    const payload = { value, ...thenParams }
    if (thenEventTo) Livewire.dispatchTo(thenEventTo, thenEvent, payload)
    else Livewire.dispatch(thenEvent, payload)
  })

  // Verify current user password flow
  // PHP dispatches 'swal:verify-current-password' and this will prompt, then dispatch back to a built-in handler (__swalVerifyCurrentUserPassword) with the value
  Livewire.on('swal:verify-current-password', async (cfg = {}) => {
    const {
      opts = {},
      thenEventTrue = null,
      thenParamsTrue = {},
      thenEventFalse = null,
      thenParamsFalse = {},
      thenEventTo = null,
    } = cfg || {}
    const value = await window.swalPromptPassword({ ...cfg, ...opts })
    if (value === null) return
    const payload = { value, thenEventTrue, thenParamsTrue, thenEventFalse, thenParamsFalse, thenEventTo }
    // Always send to the current component context by event name; the component-side logic will route further
    Livewire.dispatch('swal.__verify_current_user_password', payload)
  })
})
