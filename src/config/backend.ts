const isDevelopmentMode = import.meta.env.MODE === 'development'

const configuredBackendBase = import.meta.env.VITE_BACKEND_BASE?.trim()

const developmentBackendBase = isDevelopmentMode
  ? import.meta.env.VITE_DEV_BACKEND_BASE?.trim()
  : undefined

export const BACKEND_BASE = (
  configuredBackendBase ||
  developmentBackendBase ||
  'https://akasha.trrw.cn'
).replace(/\/+$/, '')
