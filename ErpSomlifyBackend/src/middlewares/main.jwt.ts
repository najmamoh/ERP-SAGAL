import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

// ============================================
// INTERFACES
// ============================================

export interface mainData {
    user_id: number;
    full_name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

export interface CustomUserRequest extends Request {
    user?: mainData;
}

// ============================================
// JWT CONFIGURATION
// ============================================

const jwtAuthConfig = {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpiration: 3600, // 1 hour
    jwtRefreshExpiration: 86400, // 1 day (86400 seconds)
};

// Secure cookie options
export const getMainSecureCookieOptions = (maxAge: number = 24 * 60 * 60 * 1000) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Fetch main user permissions from database
async function getMainUserPermissions(userId: number): Promise<{ roles: string[], permissions: string[] }> {
    try {
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
    } catch (error) {
        console.error('Error fetching main user permissions:', error);
        return { roles: [], permissions: [] };
    }
}

// ============================================
// TOKEN GENERATION
// ============================================

export const generateMainToken = (user: mainData): string => {
    const payload = {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
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


// Interface to extend Express Request for custom user data
export interface CustomUserRequest extends Request {
    user?: mainData; // Optional user property to store decoded token
}

// Middleware to decode JWT token and attach user data to the request
// export const decodeToken = (req: CustomUserRequest, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers.authorization?.startsWith('Bearer ') 
//             ? req.headers.authorization.split(' ')[1] 
//             : null;

//         if (!token) {
//             return res.status(401).json({
//                 isSuccess: false,
//                 message: 'UNAUTHORIZED1',
//             });
//         }

//         // Verify the token and cast to UserData type
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserData;
//         req.user = decoded; // Attach decoded user data to the request
        
//         next(); // Pass control to the next middleware
//     } catch (error) {
//         console.error(`Error decoding token: ${error}`);
//         return res.status(401).json({
//             isSuccess: false,
//             message: 'UNAUTHORIZED',
//         });
//     }
// };

// Update decodeMainToken middleware to read from cookies only
export const decodeMainToken = async (req: CustomUserRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from cookies (ONLY mainAccessToken for main users)
        const token = req.cookies?.mainAccessToken;

        if (!token) {
            return res.status(401).json({
                isSuccess: false,
                message: 'UNAUTHORIZED: No token provided in cookies',
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

        // Fetch fresh roles and permissions from database to ensure they're up-to-date
        // This is important for security - roles/permissions may have changed since token was issued
        let roles = decoded.roles || [];
        let permissions = decoded.permissions || [];

        // If roles/permissions are missing or empty, fetch from database
        if (roles.length === 0 || permissions.length === 0) {
            const freshPerms = await getMainUserPermissions(decoded.user_id);
            roles = freshPerms.roles;
            permissions = freshPerms.permissions;
        }

        // Map to mainData interface with roles and permissions
        req.user = {
            user_id: decoded.user_id,
            full_name: decoded.full_name,
            email: decoded.email,
            roles,
            permissions,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                isSuccess: false,
                message: 'TOKEN_EXPIRED: Please refresh your token',
                code: 'TOKEN_EXPIRED',
            });
        }
        console.error(`Error decoding main token: ${error}`);
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

// Middleware to ensure user is admin or superAdmin (for admin dashboard access)
export const isMainAdmin = (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
): void | Response => {
    if (!req.user) {
        return res.status(401).json({
            isSuccess: false,
            message: 'UNAUTHORIZED: Authentication required',
        });
    }
    
    // Only allow admin, superAdmin, or super_admin roles
    // Support both naming conventions: 'superAdmin' (camelCase) and 'super_admin' (snake_case)
    const userRoles = req.user.roles || [];
    const hasAdminRole = userRoles.includes('admin') || 
                         userRoles.includes('superAdmin') || 
                         userRoles.includes('super_admin');
    
    if (!hasAdminRole) {
        return res.status(403).json({
            isSuccess: false,
            message: 'FORBIDDEN: Admin access required. Only admin and superAdmin users can access this resource.',
        });
    }
    
    next();
};

// ============================================
// PERMISSION-BASED MIDDLEWARE
// ============================================

export const requireMainPermission = (resource: string, action: string) => {
    return (req: CustomUserRequest, res: Response, next: NextFunction): void | Response => {
        const permission = `${resource}:${action}`;

        // Super admin bypass - check roles array
        const userRoles = req.user?.roles || [];
        if (userRoles.includes('superAdmin') || userRoles.includes('super_admin')) {
            return next();
        }

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

export { getMainUserPermissions };