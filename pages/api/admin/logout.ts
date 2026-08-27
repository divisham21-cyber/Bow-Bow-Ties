import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminLogoutCookie } from '../../../lib/adminAuth'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', getAdminLogoutCookie())
  res.redirect(302, '/admin/login')
}

