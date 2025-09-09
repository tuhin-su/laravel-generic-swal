// resources/js/swal.v2.js
import Swal from 'sweetalert2'
window.Swal = Swal

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  timer: 3000,
  timerProgressBar: true,
  showConfirmButton: false,
})

window.swalToastSuccess = (title = 'Success', text = '', opts = {}) =>
  Toast.fire({ icon: 'success', title, text, ...opts })
window.swalToastWarning = (title = 'Warning', text = '', opts = {}) =>
  Toast.fire({ icon: 'warning', title, text, ...opts })
window.swalToastError = (title = 'Error', text = '', opts = {}) =>
  Toast.fire({ icon: 'error', title, text, ...opts })

window.swalFireSuccess = (title = 'Success', text = '', opts = {}) =>
  Swal.fire({ icon: 'success', title, text, ...opts })
window.swalFireWarning = (title = 'Warning', text = '', opts = {}) =>
  Swal.fire({ icon: 'warning', title, text, ...opts })
window.swalFireError = (title = 'Error', text = '', opts = {}) =>
  Swal.fire({ icon: 'error', title, text, ...opts })

window.swalTakeInput = async (cfg = {}) => {
  const {
    title = 'Enter a value',
    text = '',
    input = 'text',
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
  if (res.isConfirmed) return res.value ?? ''
  return null
}

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

window.swalFireAsk = async (cfg = {}) => {
  const { title='Are you sure?', text='', confirmButtonText='Yes', cancelButtonText='No', ...opts } = cfg
  const res = await Swal.fire({
    icon: 'question',
    title, text,
    showCancelButton: true,
    confirmButtonText, cancelButtonText,
    reverseButtons: true,
    ...opts,
  })
  return res.isConfirmed
}

document.addEventListener('livewire:load', () => {
  if (window.__swalLivewireBoundV2) return
  window.__swalLivewireBoundV2 = true

  window.addEventListener('swal:toast', e => {
    const { icon, title, text, opts = {} } = e.detail || {}
    if (icon === 'success') return window.swalToastSuccess(title || 'Success', text || '', opts)
    if (icon === 'warning') return window.swalToastWarning(title || 'Warning', text || '', opts)
    if (icon === 'error')   return window.swalToastError(title || 'Error', text || '', opts)
    return Toast.fire({ title, text, ...opts })
  })

  window.addEventListener('swal:modal', e => {
    const { icon, title, text, opts = {} } = e.detail || {}
    if (icon === 'success') return window.swalFireSuccess(title || 'Success', text || '', opts)
    if (icon === 'warning') return window.swalFireWarning(title || 'Warning', text || '', opts)
    if (icon === 'error')   return window.swalFireError(title || 'Error', text || '', opts)
    return Swal.fire({ title, text, ...opts })
  })

  window.addEventListener('swal:confirm', async e => {
    const cfg = e.detail || {}
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg
    const ok = await window.swalFireAsk({ ...cfg, ...opts })
    if (ok && thenEvent) {
      if (thenEventTo) Livewire.emitTo(thenEventTo, thenEvent, thenParams)
      else Livewire.emit(thenEvent, thenParams)
    }
  })

  window.addEventListener('swal:input', async e => {
    const cfg = e.detail || {}
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg
    const value = await window.swalTakeInput({ ...cfg, ...opts })
    if (value === null || !thenEvent) return
    const payload = { value, ...thenParams }
    if (thenEventTo) Livewire.emitTo(thenEventTo, thenEvent, payload)
    else Livewire.emit(thenEvent, payload)
  })

  window.addEventListener('swal:password', async e => {
    const cfg = e.detail || {}
    const { opts = {}, thenEvent, thenParams = {}, thenEventTo } = cfg
    const value = await window.swalPromptPassword({ ...cfg, ...opts })
    if (value === null || !thenEvent) return
    const payload = { value, ...thenParams }
    if (thenEventTo) Livewire.emitTo(thenEventTo, thenEvent, payload)
    else Livewire.emit(thenEvent, payload)
  })

  // Verify current user password flow for v2
  window.addEventListener('swal:verify-current-password', async e => {
    const cfg = e.detail || {}
    const {
      opts = {},
      thenEventTrue = null,
      thenParamsTrue = {},
      thenEventFalse = null,
      thenParamsFalse = {},
      thenEventTo = null,
    } = cfg
    const value = await window.swalPromptPassword({ ...cfg, ...opts })
    if (value === null) return
    const payload = { value, thenEventTrue, thenParamsTrue, thenEventFalse, thenParamsFalse, thenEventTo }
    // send to a conventional handler name on PHP side
    Livewire.emit('__swal.verify_current_user_password', payload)
  })
})
