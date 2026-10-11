import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import {
  CustomUserRequest,
  mainData,
  generateMainToken,
  getMainSecureCookieOptions,
  getMainUserPermissions
} from '../middlewares/main.jwt';

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

// Create Refresh Token for Main Users
const createMainUserRefreshToken = async (userId: number): Promise<{ token: string; expiry_date: Date }> => {
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + jwtAuthConfig.jwtRefreshExpiration);

  const token = uuidv4();

  await prisma.main_users_refresh_tokens.create({
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

// Main User Signup (Only by SuperAdmin)
export const signup = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, company_id } = req.body;

    // Check if user has superAdmin role
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden! You do not have permission.' });
      return;
    }

    if (!full_name || !email || !password) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }

    const existingUser = await prisma.main_users.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email is already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData: any = {
      full_name,
      email,
      password: hashedPassword,
    };

    // Link company if provided
    if (company_id) {
      userData.companies = {
        connect: [{ company_id: company_id }],
      };
    }

    const newUser = await prisma.main_users.create({
      data: userData,
    });

    // If company_id provided, link the company
    if (company_id) {
      await prisma.companies.update({
        where: { company_id: company_id },
        data: {
          created_by: newUser.id,
        },
      });
    }

    res.status(201).json({ message: 'Main user created!', user: newUser });
  } catch (error) {
    console.error(`Signup error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Main User Signin (Cookie-based)
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 Admin signin request received:', { email: req.body?.email, hasPassword: !!req.body?.password });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      res.status(400).json({ message: 'Email and password required.' });
      return;
    }

    console.log('🔍 Looking up user:', email);
    const user = await prisma.main_users.findUnique({ where: { email } });
    if (!user) {
      console.log('❌ User not found:', email);
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    console.log('✅ User authenticated:', email);

    // Fetch user roles and permissions
    const { roles, permissions } = await getMainUserPermissions(user.id);

    const userMData: mainData = {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles,
      permissions,
    };

    const accessToken = generateMainToken(userMData);
    const refreshToken = await createMainUserRefreshToken(user.id);

    // Clear any existing normal user tokens first (to avoid conflicts)
    res.clearCookie('token', { path: '/' });
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    // Set cookies with proper expiration times
    // Access token: 1 hour
    const accessTokenMaxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    const accessTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: accessTokenMaxAge,
      path: '/',
    };
    
    // Refresh token: 1 day
    const refreshTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const refreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: refreshTokenMaxAge,
      path: '/',
    };
    
    // Set ONLY main user tokens (no backward compatibility cookies)
    res.cookie('mainAccessToken', accessToken, accessTokenCookieOptions);
    res.cookie('mainRefreshToken', refreshToken.token, refreshTokenCookieOptions);
    
    console.log('✅ Admin signin - Main user tokens set in cookies:', {
      mainAccessToken: 'set (15 min)',
      mainRefreshToken: 'set (1 day)',
      email: user.email,
    });

    res.status(200).json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        roles,
        permissions,
      },
      accessToken: accessToken, // Include in response for frontend storage if needed
      refreshToken: refreshToken.token,
      refreshTokenExpiry: refreshToken.expiry_date.toISOString(),
      accessTokenExpiry: new Date(Date.now() + accessTokenMaxAge).toISOString(),
    });
  } catch (error) {
    console.error(`Signin error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Refresh Access Token for Main Users
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookies (primary) or body (fallback)
    const requestToken = req.cookies?.mainRefreshToken || req.cookies?.refreshToken || req.body?.refreshToken;

    if (!requestToken) {
      res.status(403).json({ message: 'Refresh token required.' });
      return;
    }

    // Find the refresh token in database
    const storedToken = await prisma.main_users_refresh_tokens.findUnique({
      where: { token: requestToken },
    });

    if (!storedToken) {
      res.status(403).json({ message: 'Invalid refresh token.' });
      return;
    }

    // Check if expired
    if (new Date(storedToken.expiry_date) < new Date()) {
      await prisma.main_users_refresh_tokens.delete({ where: { id: storedToken.id } });
      res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
      return;
    }

    const user = await prisma.main_users.findUnique({
      where: { id: storedToken.user_id },
    });

    if (!user) {
      await prisma.main_users_refresh_tokens.delete({ where: { id: storedToken.id } });
      res.status(403).json({ message: 'User no longer exists.' });
      return;
    }

    // Fetch fresh roles and permissions
    const { roles, permissions } = await getMainUserPermissions(user.id);

    const userMData: mainData = {
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles,
      permissions,
    };

    const newAccessToken = generateMainToken(userMData);

    // Token rotation - delete old refresh token and create new one
    await prisma.main_users_refresh_tokens.delete({ where: { id: storedToken.id } });
    const newRefreshToken = await createMainUserRefreshToken(user.id);

    // Clear any existing normal user tokens first (to avoid conflicts)
    res.clearCookie('token', { path: '/' });
    res.clearCookie('authToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    // Set cookies with proper expiration times
    // Access token: 1 hour
    const accessTokenMaxAge = 60 * 60 * 1000; // 1 hour in milliseconds
    const accessTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: accessTokenMaxAge,
      path: '/',
    };
    
    // Refresh token: 1 day
    const refreshTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const refreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: refreshTokenMaxAge,
      path: '/',
    };
    
    // Set ONLY main user tokens (no backward compatibility cookies)
    res.cookie('mainAccessToken', newAccessToken, accessTokenCookieOptions);
    res.cookie('mainRefreshToken', newRefreshToken.token, refreshTokenCookieOptions);
    
    console.log('✅ Admin refresh token - New main user tokens set in cookies');

    res.status(200).json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken.token,
      refreshTokenExpiry: newRefreshToken.expiry_date.toISOString(),
      accessTokenExpiry: new Date(Date.now() + accessTokenMaxAge).toISOString(),
    });
  } catch (error) {
    console.error(`Refresh token error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Logout Main User (Clear Cookies and Refresh Tokens)
// Logout Main Admin — deletes refresh token from DB and clears ALL auth cookies server-side
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { refreshToken?: string; mainRefreshToken?: string };
    const refreshToken =
      body?.mainRefreshToken ||
      body?.refreshToken ||
      req.cookies?.mainRefreshToken ||
      req.cookies?.refreshToken;

    if (refreshToken) {
      await prisma.main_users_refresh_tokens.deleteMany({
        where: { token: refreshToken },
      });
    }

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Clear main admin cookies
    res.clearCookie('mainAccessToken', cookieOpts);
    res.clearCookie('mainRefreshToken', cookieOpts);
    res.clearCookie('mainRefreshToken', { ...cookieOpts, path: '/api/main/auth/refresh-token' });

    // Also clear company user cookies (belt-and-suspenders)
    res.clearCookie('authToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);
    res.clearCookie('refreshToken', { ...cookieOpts, path: '/api/auth/refresh-token' });
    res.clearCookie('token', cookieOpts);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(`Logout error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get Current Main User (Whoami)
export const whoami = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.user_id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.main_users.findUnique({
      where: { id: req.user.user_id },
      include: {
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

    // Extract roles and permissions from user_roles → role → permissions (RolePermission) → permission
    const roles = user.user_roles.map(ur => ur.role.name);
    const permissionSet = new Set<string>();
    user.user_roles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        const p = rp.permission as { name?: string; resource?: string; action?: string };
        const permStr = p.name || (p.resource && p.action ? `${p.resource}:${p.action}` : '');
        if (permStr) permissionSet.add(permStr);
      });
    });

    res.status(200).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles,
      permissions: Array.from(permissionSet),
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error(`Error fetching current main user: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get All Main Users
export const getAllMainUsers = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    // Check if user has admin or superAdmin role
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin') && !userRoles.includes('admin')) {
      res.status(403).json({ message: 'Forbidden!' });
      return;
    }

    const users = await prisma.main_users.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        created_at: true,
        updated_at: true,
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
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(`Get all error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Get One Main User
export const getOneMainUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user has admin or superAdmin role
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin') && !userRoles.includes('admin')) {
      res.status(403).json({ message: 'Forbidden!' });
      return;
    }

    if (!id || id.trim() === '') {
      res.status(400).json({ message: 'User ID is required.' });
      return;
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ message: 'Invalid user ID format.' });
      return;
    }

    const user = await prisma.main_users.findUnique({
      where: { id: userId },
      include: {
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

    user ? res.status(200).json(user) : res.status(404).json({ message: 'User not found.' });
  } catch (error) {
    console.error(`Get one error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Update Main User
export const updateMainUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, email, password, companies } = req.body;

    // Check if user has superAdmin role
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden!' });
      return;
    }

    const updateData: any = { full_name, email };
    if (password) updateData.password = await bcrypt.hash(password, 12);
    if (companies) updateData.companies = { set: companies.map((cid: string) => ({ company_id: cid })) };

    const updatedUser = await prisma.main_users.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({ message: 'User updated!', user: updatedUser });
  } catch (error) {
    console.error(`Update error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Delete Main User
export const deleteMainUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user has superAdmin role
    const userRoles = req.user?.roles || [];
    if (!userRoles.includes('superAdmin') && !userRoles.includes('super_admin')) {
      res.status(403).json({ message: 'Forbidden!' });
      return;
    }

    await prisma.main_users.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'User deleted!' });
  } catch (error) {
    console.error(`Delete error: ${error}`);
    res.status(500).json({ message: 'Internal server error.' });
  }
};