import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

// ============================================
// INTERFACES
// ============================================

export interface UserData {
    user_id: number;
    full_name: string;
    email: string;
    company_id: string;
    roles: string[];
    permissions: string[];
}

export interface mainData {
    user_id: number;
    full_name: string;
    email: string;
    role: 'user' | 'admin' | 'superAdmin';
    roles: string[];
    permissions: string[];
}

export interface CustomUserRequest extends Request {
    user?: UserData;
}

// ============================================
// JWT CONFIGURATION
// ============================================

const jwtAuthConfig = {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpiration: 3600, // 1 hour
    jwtRefreshExpiration: 604800, // 7 days
};

// Secure cookie options
export const getSecureCookieOptions = (maxAge: number = 24 * 60 * 60 * 1000) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Fetch user permissions from database
async function getUserPermissions(userId: number, isMainUser: boolean = false): Promise<{ roles: string[], permissions: string[] }> {
    try {
        if (isMainUser) {
            const userRoles = await prisma.mainUserRole.findMany({
                where: { user_id: userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            const roles = userRoles.map(ur => ur.role.name);
            const permissionSet = new Set<string>();

            userRoles.forEach(ur => {
                ur.role.permissions.forEach(rp => {
                    const p = rp.permission;
                    const permStr = (p as any).name || ((p as any).resource && (p as any).action ? `${(p as any).resource}:${(p as any).action}` : '');
                    if (permStr) permissionSet.add(permStr);
                });
            });

            return { roles, permissions: Array.from(permissionSet) };
        } else {
            const userRoles = await prisma.userRole.findMany({
                where: { user_id: userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            });

            const roles = userRoles.map(ur => ur.role.name);
            const permissionSet = new Set<string>();

            userRoles.forEach(ur => {
                ur.role.permissions.forEach(rp => {
                    const p = rp.permission;
                    const permStr = (p as any).name || ((p as any).resource && (p as any).action ? `${(p as any).resource}:${(p as any).action}` : '');
                    if (permStr) permissionSet.add(permStr);
                });
            });

            return { roles, permissions: Array.from(permissionSet) };
        }
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return { roles: [], permissions: [] };
    }
}

// ============================================
// TOKEN GENERATION
// ============================================

export const generateToken = (user: UserData): string => {
    const payload = {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        company_id: user.company_id || null,
        roles: user.roles || [],
        permissions: user.permissions || [],
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: jwtAuthConfig.jwtExpiration,
    });
};

// ============================================
// DECODE TOKEN MIDDLEWARE (COOKIE-BASED)
// ============================================

export const decodeToken = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        // Try to get token from cookies first (primary method)
        let token = req.cookies?.authToken || req.cookies?.token;
        
        // Fall back to Authorization header if cookie is not present (for backward compatibility)
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                isSuccess: false,
                message: 'UNAUTHORIZED: No token provided',
            });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Record<string, any>;

        // Validate required fields
        if (!decoded.user_id) {
            return res.status(401).json({
                isSuccess: false,
                message: 'Invalid token payload',
            });
        }

        // Fetch fresh permissions from database if not in token or empty
        let roles = decoded.roles || [];
        let permissions = decoded.permissions || [];

        if (roles.length === 0 || permissions.length === 0) {
            const freshPerms = await getUserPermissions(decoded.user_id, false);
            roles = freshPerms.roles;
            permissions = freshPerms.permissions;
        }

        // Map to UserData interface
        const user: UserData = {
            user_id: decoded.user_id,
            full_name: decoded.full_name,
            email: decoded.email,
            company_id: decoded.company_id,
            roles,
            permissions,
        };

        // Check company status if user belongs to a company
        if (user.company_id) {
            const company = await prisma.companies.findUnique({
                where: { company_id: user.company_id },
                select: { isBanned: true }
            });

            if (company?.isBanned) {
                return res.status(403).json({
                    isSuccess: false,
                    message: 'COMPANY_BANNED: This company account has been suspended',
                });
            }
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                isSuccess: false,
                message: 'TOKEN_EXPIRED: Please refresh your token',
            });
        }
        console.error(`Error decoding token: ${error}`);
        return res.status(401).json({
            isSuccess: false,
            message: 'UNAUTHORIZED: Invalid token',
        });
    }
};

// ============================================
// ROLE-BASED MIDDLEWARE
// ============================================

export const isAdmin = (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
): void | Response => {
    if (!req.user) {
        return res.status(403).json({
            isSuccess: false,
            message: 'FORBIDDEN: Authentication required',
        });
    }
    
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('superAdmin') && !userRoles.includes('super_admin')) {
        return res.status(403).json({
            isSuccess: false,
            message: 'FORBIDDEN: Admin access required',
        });
    }
    next();
};

export const isSuperAdmin = (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
): void | Response => {
    if (!req.user) {
        return res.status(403).json({
            isSuccess: false,
            message: 'FORBIDDEN: Authentication required',
        });
    }
    
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin')) {
        return res.status(403).json({
            isSuccess: false,
            message: 'FORBIDDEN: Super admin access required',
        });
    }
    next();
};

// ============================================
// PERMISSION-BASED MIDDLEWARE
// ============================================

/**
 * Middleware factory to check if user has specific permission
 * @param resource - The resource name (e.g., 'sales', 'reports', 'customers')
 * @param action - The action name (e.g., 'create', 'read', 'update', 'delete')
 */
export const requirePermission = (resource: string, action: string) => {
    return (req: CustomUserRequest, res: Response, next: NextFunction): void | Response => {
        const permission = `${resource}:${action}`;

        // Bypass for super_admin/superAdmin (full access). Admin also bypasses so role "admin" works without assigning every permission in DB; for strict RBAC assign permissions to admin role and remove admin here.
        const userRoles = req.user?.roles || [];
        if (userRoles.includes('superAdmin') || userRoles.includes('super_admin') || userRoles.includes('admin')) {
            return next();
        }

        // Check permission from DB (user_roles → role → RolePermission → Permission.name = "resource:action")
        if (!req.user?.permissions?.includes(permission)) {
            return res.status(403).json({
                isSuccess: false,
                message: `FORBIDDEN: Missing permission '${permission}'`,
                required: permission,
            });
        }

        next();
    };
};

/**
 * Middleware factory to check if user has any of the specified roles
 * @param allowedRoles - Array of role names that are allowed
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: CustomUserRequest, res: Response, next: NextFunction): void | Response => {
        // Super admin bypass - check roles array
        const userRoles = req.user?.roles || [];
        if (userRoles.includes('superAdmin')) {
            return next();
        }

        // Check if user has any of the allowed roles
        const hasRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({
                isSuccess: false,
                message: `FORBIDDEN: Required role(s): ${allowedRoles.join(', ')}`,
                required: allowedRoles,
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 * @param permissions - Array of permission strings (e.g., ['sales:read', 'reports:view'])
 */
export const requireAllPermissions = (...permissions: string[]) => {
    return (req: CustomUserRequest, res: Response, next: NextFunction): void | Response => {
        // Super admin bypass - check roles array
        const userRoles = req.user?.roles || [];
        if (userRoles.includes('superAdmin')) {
            return next();
        }

        const userPermissions = req.user?.permissions || [];
        const missingPermissions = permissions.filter(p => !userPermissions.includes(p));

        if (missingPermissions.length > 0) {
            return res.status(403).json({
                isSuccess: false,
                message: `FORBIDDEN: Missing permissions: ${missingPermissions.join(', ')}`,
                required: permissions,
                missing: missingPermissions,
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param permissions - Array of permission strings
 */
export const requireAnyPermission = (...permissions: string[]) => {
    return (req: CustomUserRequest, res: Response, next: NextFunction): void | Response => {
        // Super admin bypass - check roles array
        const userRoles = req.user?.roles || [];
        if (userRoles.includes('superAdmin')) {
            return next();
        }

        const userPermissions = req.user?.permissions || [];
        const hasAny = permissions.some(p => userPermissions.includes(p));

        if (!hasAny) {
            return res.status(403).json({
                isSuccess: false,
                message: `FORBIDDEN: Requires one of: ${permissions.join(', ')}`,
                required: permissions,
            });
        }

        next();
    };
};

export { getUserPermissions };
