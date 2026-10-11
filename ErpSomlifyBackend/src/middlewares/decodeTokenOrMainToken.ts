import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { decodeToken } from './authJwtMiddleware';
import { getMainUserPermissions } from './main.jwt';

/**
 * Use for routes that can be accessed by both:
 * - Main users via mainAccessToken cookie (roles/permissions from MainUserRole → RolePermission → Permission)
 * - Company users via authToken/token cookie or Bearer (roles/permissions from UserRole → RolePermission → Permission)
 * When main user: req.user has no company_id; controllers should use query.company_id or list all.
 * We always load roles and permissions from the database (user_roles / main_user_roles) so every step can be permission-checked.
 */
export const decodeTokenOrMainToken = async (req: any, res: Response, next: NextFunction): Promise<void | Response> => {
  const mainToken = req.cookies?.mainAccessToken;
  if (mainToken) {
    try {
      const decoded = jwt.verify(mainToken, process.env.JWT_SECRET!) as Record<string, any>;
      if (!decoded.user_id) throw new Error('Invalid token payload');
      // Load roles and permissions from MainUserRole (user_roles) - single source of truth
      const { roles, permissions } = await getMainUserPermissions(decoded.user_id);
      req.user = {
        user_id: decoded.user_id,
        full_name: decoded.full_name,
        email: decoded.email,
        roles,
        permissions,
      };
      return next();
    } catch (_) {
      // fall through to normal token (company user or invalid main token)
    }
  }
  return decodeToken(req, res, next);
};
