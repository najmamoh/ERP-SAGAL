import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import {
  CustomUserRequest,
  generateToken,
  UserData,
  getSecureCookieOptions,
  getUserPermissions
} from '../middlewares';

// ============================================
// JWT CONFIGURATIONS
// ============================================
const jwtAuthConfig = {
  secret: process.env.JWT_SECRET,
  jwtExpiration: 3600, // 1 hour
  jwtRefreshExpiration: 86400, // 1 day (86400 seconds)
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Create Refresh Token
const createRefreshToken = async (userId: number): Promise<{ token: string; expiry_date: Date }> => {
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + jwtAuthConfig.jwtRefreshExpiration);

  const token = uuidv4();
  await prisma.comp_users_refresh_tokens.create({
    data: {
      token,
      expiry_date: expiredAt,
      user_id: userId,
    },
  });

  return { token, expiry_date: expiredAt };
};

// ============================================
// AUTH CONTROLLERS
// ============================================

// User Signup — can be called by main users or company admins
export const signup = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, company_id } = req.body;

    if (!full_name || !email || !password) {
      res.status(400).json({ message: 'Missing required fields (full_name, email, password)' });
      return;
    }

    // Use company_id from request body if provided, otherwise fall back to user's company_id
    const finalCompanyId = company_id || req.user?.company_id;

    if (!finalCompanyId) {
      res.status(400).json({ message: 'Company ID is required. Please select a company.' });
      return;
    }

    const existingUser = await prisma.company_users.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email is already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.company_users.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        company_id: finalCompanyId,
      },
    });

    res.status(201).json({ message: 'User registered successfully!', user: newUser });
  } catch (error) {
    console.error(`Error during signup: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User Signin (Cookie-based)
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' });
      return;
    }

    const user = await prisma.company_users.findUnique({
      where: { email },
      include: { companies: true },
    });

    if (!user) {
      // Check if user exists in main_users
      const mainUser = await prisma.main_users.findUnique({ where: { email } });
      if (mainUser) {
        res.status(400).json({
          message: 'User not found in company users. Please use /api/main/auth/signin endpoint.',
        });
        return;
      }
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (user.companies?.isBanned) {
      res.status(403).json({
        message: 'Account suspended. Please contact support',
      });
      return;
    }

    // Fetch user roles and permissions
    const { roles, permissions } = await getUserPermissions(user.user_id, false);

    // Generate Access Token with roles and permissions
    const userData: UserData = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      company_id: user.company_id!,
      roles,
      permissions,
    };

    const accessToken = generateToken(userData);
    const refreshToken = await createRefreshToken(user.user_id);

    // Set secure HTTP-only cookies
    const accessTokenMaxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    const refreshTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    const cookieOptions = getSecureCookieOptions(accessTokenMaxAge);
    const refreshCookieOptions = getSecureCookieOptions(refreshTokenMaxAge);

    res.cookie('authToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken.token, {
      ...refreshCookieOptions,
      path: '/api/auth/refresh-token',
    });

    console.log('✅ Cookie set for company user:', user.email);

    res.status(200).json({
      message: 'Signed in successfully',
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        company_id: user.company_id,
        roles,
        permissions,
      },
      accessToken: accessToken, // Include in response for frontend storage
      refreshToken: refreshToken.token,
      refreshTokenExpiry: refreshToken.expiry_date.toISOString(),
      accessTokenExpiry: new Date(Date.now() + accessTokenMaxAge).toISOString(),
    });
  } catch (error) {
    console.error(`Error during signin: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Refresh Access Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookie or body
    const requestToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!requestToken) {
      res.status(403).json({ message: 'Refresh token is required' });
      return;
    }

    const storedToken = await prisma.comp_users_refresh_tokens.findUnique({
      where: { token: requestToken },
    });

    if (!storedToken) {
      res.status(403).json({ message: 'Refresh token is invalid' });
      return;
    }

    const user = await prisma.company_users.findUnique({
      where: { user_id: storedToken.user_id! },
    });

    if (!user) {
      await prisma.comp_users_refresh_tokens.delete({ where: { id: storedToken.id } });
      res.status(403).json({ message: 'User no longer exists' });
      return;
    }

    // Check if refresh token is expired
    if (new Date(storedToken.expiry_date!) < new Date()) {
      await prisma.comp_users_refresh_tokens.delete({ where: { id: storedToken.id } });
      res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
      return;
    }

    // Fetch fresh roles and permissions
    const { roles, permissions } = await getUserPermissions(user.user_id, false);

    const userData: UserData = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      company_id: user.company_id!,
      roles,
      permissions,
    };

    const newAccessToken = generateToken(userData);

    // Token rotation: delete old, create new
    await prisma.comp_users_refresh_tokens.delete({ where: { id: storedToken.id } });
    const newRefreshToken = await createRefreshToken(user.user_id);

    // Set new cookies with correct expiration times
    const accessTokenMaxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    const refreshTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    const cookieOptions = getSecureCookieOptions(accessTokenMaxAge);
    const refreshCookieOptions = getSecureCookieOptions(refreshTokenMaxAge);

    res.cookie('authToken', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken.token, {
      ...refreshCookieOptions,
      path: '/api/auth/refresh-token',
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
      refreshTokenExpiry: newRefreshToken.expiry_date.toISOString(),
      accessTokenExpiry: new Date(Date.now() + accessTokenMaxAge).toISOString(),
    });
  } catch (error) {
    console.error(`Error during token refresh: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Users — main users see all company users, company users see their own company
export const getAllUsers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // If the user has a company_id, filter by it; otherwise (main user) return all
    const search = (req.query.search as string || '').trim();
    const companyFilter: any = req.user?.company_id
      ? { company_id: req.user.company_id }
      : {};
    if (search) {
      companyFilter.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.company_users.findMany({
      where: companyFilter,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        company_id: true,
        create_at: true,
        updated_at: true,
        companies: {
          select: {
            company_name: true,
          },
        },
        user_roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ create_at: 'desc' }, { user_id: 'desc' }],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error fetching users: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get One User by ID
// Any authenticated user can fetch their own profile; fetching others requires admin/users:read
export const getOneUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const requestedId = parseInt(user_id);
    const requestingUser = req.user as any;
    const requestingUserId: number | undefined = requestingUser?.user_id;
    const roles: string[] = requestingUser?.roles || [];
    const permissions: string[] = requestingUser?.permissions || [];

    const isSelf = requestingUserId === requestedId;
    const isAdmin = roles.some((r: string) => ['admin', 'superAdmin', 'super_admin'].includes(r));
    const hasUsersRead = permissions.includes('users:read');

    // Allow: self-access, admin, or users:read permission
    if (!isSelf && !isAdmin && !hasUsersRead) {
      res.status(403).json({ message: 'You do not have permission to view this user.' });
      return;
    }

    const user = await prisma.company_users.findUnique({
      where: { user_id: requestedId },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        company_id: true,
        create_at: true,
        updated_at: true,
        user_roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update User Info
export const updateUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, email, password, company_id } = req.body;

    // Allow main users (they have req.user.roles array but no company_id)
    const isMainUser = !req.user?.company_id;
    // For company users, check admin/superAdmin role
    if (!isMainUser) {
      const userRoles: string[] = req.user?.roles || [];
      const userRole = (req.user as any)?.role;
      const isAdmin = userRoles.some(r => ['admin', 'superAdmin', 'super_admin'].includes(r))
        || ['admin', 'superAdmin', 'super_admin'].includes(userRole);
      if (!isAdmin) {
        res.status(403).json({ message: 'Forbidden! You do not have permission' });
        return;
      }
    }

    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (company_id !== undefined) updateData.company_id = company_id;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.company_users.update({
      where: { user_id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
  } catch (error) {
    console.error(`Error updating user: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await prisma.company_users.findUnique({ where: { user_id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Delete in transaction to clean up related records
    await prisma.$transaction(async (tx) => {
      // Remove role assignments
      await tx.userRole.deleteMany({ where: { user_id: userId } });
      // Remove refresh tokens
      await tx.comp_users_refresh_tokens.deleteMany({ where: { user_id: userId } });
      // Delete the user
      await tx.company_users.delete({ where: { user_id: userId } });
    });

    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error(`Error deleting user: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Current User (Whoami)
export const whoami = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.company_users.findUnique({
      where: { user_id: req.user.user_id },
      include: {
        companies: {
          select: {
            company_id: true,
            company_name: true,
            company_email: true,
            isBanned: true,
          },
        },
        user_roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Extract roles and permissions
    const roles = user.user_roles.map(ur => ur.role.name);
    const permissionSet = new Set<string>();
    user.user_roles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        permissionSet.add(rp.permission.name);
      });
    });

    res.status(200).json({
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        company_id: user.company_id,
        company: user.companies,
        roles,
        permissions: Array.from(permissionSet),
      },
    });
  } catch (error) {
    console.error(`Error fetching current user: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout Company User — deletes refresh token from DB and clears ALL auth cookies server-side
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { refreshToken?: string };
    const refreshToken = body?.refreshToken || req.cookies?.refreshToken;

    if (refreshToken) {
      await prisma.comp_users_refresh_tokens.deleteMany({
        where: { token: refreshToken },
      });
    }

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Clear company user cookies
    res.clearCookie('authToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('refreshToken', { ...cookieOpts, path: '/api/auth/refresh-token' });
    res.clearCookie('token', cookieOpts);

    // Also clear main admin cookies in case user has both (belt-and-suspenders)
    res.clearCookie('mainAccessToken', cookieOpts);
    res.clearCookie('mainRefreshToken', cookieOpts);
    res.clearCookie('mainRefreshToken', { ...cookieOpts, path: '/api/main/auth/refresh-token' });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(`Logout error: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
