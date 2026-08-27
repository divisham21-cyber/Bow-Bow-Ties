import crypto from 'crypto'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { IncomingMessage } from 'http'

const adminCookieName = 'bow_bow_ties_admin'
const maxAgeSeconds = 60 * 60 * 8

function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD || '').trim()
}

function getAdminToken() {
  const password = getAdminPassword()
  if (!password) return ''

  return crypto
    .createHash('sha256')
    .update(`bow-bow-ties-admin:${password}`)
    .digest('hex')
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf('=')
        if (separatorIndex === -1) return [cookie, '']

        return [
          decodeURIComponent(cookie.slice(0, separatorIndex)),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ]
      })
  )
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword())
}

export function isValidAdminPassword(password: unknown) {
  if (typeof password !== 'string') return false

  return password.trim() === getAdminPassword()
}

export function isAdminAuthenticated(req: IncomingMessage) {
  const token = getAdminToken()
  if (!token) return false

  const cookies = parseCookies(req.headers.cookie)
  return cookies[adminCookieName] === token
}

export function getAdminLoginCookie() {
  const token = getAdminToken()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  return `${adminCookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`
}

export function getAdminLogoutCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''

  return `${adminCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function getAdminRedirectDestination(context: GetServerSidePropsContext) {
  const next = encodeURIComponent(context.resolvedUrl || '/admin')
  return `/admin/login?next=${next}`
}

export function requireAdminPage<P extends Record<string, unknown> = Record<string, never>>(
  context: GetServerSidePropsContext,
  props = {} as P
): GetServerSidePropsResult<P> {
  if (!isAdminAuthenticated(context.req)) {
    return {
      redirect: {
        destination: getAdminRedirectDestination(context),
        permanent: false,
      },
    }
  }

  return { props }
}
