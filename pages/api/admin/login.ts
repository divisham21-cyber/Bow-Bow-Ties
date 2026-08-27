import type { NextApiRequest, NextApiResponse } from 'next'
import { getAdminLoginCookie, isAdminConfigured, isValidAdminPassword } from '../../../lib/adminAuth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!isAdminConfigured()) {
    res.status(500).json({ message: 'Admin password is not configured.' })
    return
  }

  if (!isValidAdminPassword(req.body?.password)) {
    res.status(401).json({ message: 'Incorrect password.' })
    return
  }

  res.setHeader('Set-Cookie', getAdminLoginCookie())
  res.status(200).json({ ok: true })
}
