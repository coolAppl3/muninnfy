import { Request, Response } from 'express';
import { getRequestCookie, removeRequestCookie } from '../util/cookieUtils';
import { isValidUuid } from '../util/tokenGenerator';

export function getAuthSessionId(req: Request, res: Response): string | null {
  const authSessionId: string | null = getRequestCookie(req, 'authSessionId');

  if (!authSessionId) {
    res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });
    return null;
  }

  if (!isValidUuid(authSessionId)) {
    removeRequestCookie(res, 'authSessionId');
    res.status(401).json({ message: 'Sign in session expired.', reason: 'authSessionExpired' });

    return null;
  }

  return authSessionId;
}
