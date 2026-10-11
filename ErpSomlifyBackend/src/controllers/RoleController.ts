import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

// ============================================
// ROLE CONTROLLERS
// ============================================

// Get All Roles
export const getAllRoles = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const roles = await prisma.roleDefinition.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: {
                        user_roles: true,
                        main_user_roles: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.status(200).json(roles);
    } catch (error) {
        console.error(`Error fetching roles: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Single Role
export const getRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const role = await prisma.roleDefinition.findUnique({
            where: { id: parseInt(id) },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                user_roles: {
                    include: {
                        user: {
                            select: {
                                user_id: true,
                                full_name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }

        res.status(200).json(role);
    } catch (error) {
        console.error(`Error fetching role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Role
export const createRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { name, description, is_active = true, permission_ids = [] } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Role name is required' });
            return;
        }

        // Check if role name already exists
        const existingRole = await prisma.roleDefinition.findUnique({ where: { name } });
        if (existingRole) {
            res.status(400).json({ message: 'Role name already exists' });
            return;
        }

        const role = await prisma.roleDefinition.create({
            data: {
                name,
                description,
                is_active,
                permissions: {
                    create: permission_ids.map((permissionId: number) => ({
                        permission: { connect: { id: permissionId } },
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        console.error(`Error creating role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Role
export const updateRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;

        const role = await prisma.roleDefinition.update({
            where: { id: parseInt(id) },
            data: { name, description, is_active },
        });

        res.status(200).json({ message: 'Role updated successfully', role });
    } catch (error) {
        console.error(`Error updating role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Role
export const deleteRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if role has users assigned
        const userCount = await prisma.userRole.count({
            where: { role_id: parseInt(id) },
        });

        if (userCount > 0) {
            res.status(400).json({
                message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`,
            });
            return;
        }

        await prisma.roleDefinition.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(`Error deleting role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign Role to Company User
export const assignRoleToUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, userId } = req.params;
        const { company_id } = req.body;

        const finalCompanyId = company_id || req.user?.company_id;

        if (!finalCompanyId) {
            res.status(400).json({ message: 'Company ID is required' });
            return;
        }

        // Check if user exists
        const user = await prisma.company_users.findUnique({
            where: { user_id: parseInt(userId) },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Check if role exists
        const role = await prisma.roleDefinition.findUnique({
            where: { id: parseInt(roleId) },
        });

        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }

        // Create user role assignment
        const userRole = await prisma.userRole.upsert({
            where: {
                user_id_role_id: {
                    user_id: parseInt(userId),
                    role_id: parseInt(roleId),
                },
            },
            update: {},
            create: {
                user_id: parseInt(userId),
                role_id: parseInt(roleId),
                company_id: finalCompanyId,
            },
        });

        res.status(200).json({ message: 'Role assigned to user successfully', userRole });
    } catch (error) {
        console.error(`Error assigning role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove Role from Company User
export const removeRoleFromUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, userId } = req.params;

        await prisma.userRole.delete({
            where: {
                user_id_role_id: {
                    user_id: parseInt(userId),
                    role_id: parseInt(roleId),
                },
            },
        });

        res.status(200).json({ message: 'Role removed from user successfully' });
    } catch (error) {
        console.error(`Error removing role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get User Roles
export const getUserRoles = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const userRoles = await prisma.userRole.findMany({
            where: { user_id: parseInt(userId) },
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
        });

        res.status(200).json(userRoles);
    } catch (error) {
        console.error(`Error fetching user roles: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add Permission to Role
export const addPermissionToRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, permissionId } = req.params;

        const rolePermission = await prisma.rolePermission.upsert({
            where: {
                role_id_permission_id: {
                    role_id: parseInt(roleId),
                    permission_id: parseInt(permissionId),
                },
            },
            update: {},
            create: {
                role_id: parseInt(roleId),
                permission_id: parseInt(permissionId),
            },
        });

        res.status(200).json({ message: 'Permission added to role', rolePermission });
    } catch (error) {
        console.error(`Error adding permission to role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove Permission from Role
export const removePermissionFromRole = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, permissionId } = req.params;

        await prisma.rolePermission.delete({
            where: {
                role_id_permission_id: {
                    role_id: parseInt(roleId),
                    permission_id: parseInt(permissionId),
                },
            },
        });

        res.status(200).json({ message: 'Permission removed from role' });
    } catch (error) {
        console.error(`Error removing permission from role: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================
// MAIN USER ROLE CONTROLLERS
// ============================================

// Get Main User Roles
export const getMainUserRoles = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const userRoles = await prisma.mainUserRole.findMany({
            where: { user_id: parseInt(userId) },
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
        });

        res.status(200).json(userRoles);
    } catch (error) {
        console.error(`Error fetching main user roles: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign Role to Main User
export const assignRoleToMainUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, userId } = req.params;

        // Check if main user exists
        const user = await prisma.main_users.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            res.status(404).json({ message: 'Main user not found' });
            return;
        }

        // Check if role exists
        const role = await prisma.roleDefinition.findUnique({
            where: { id: parseInt(roleId) },
        });

        if (!role) {
            res.status(404).json({ message: 'Role not found' });
            return;
        }

        // Create main user role assignment
        const userRole = await prisma.mainUserRole.upsert({
            where: {
                user_id_role_id: {
                    user_id: parseInt(userId),
                    role_id: parseInt(roleId),
                },
            },
            update: {},
            create: {
                user_id: parseInt(userId),
                role_id: parseInt(roleId),
            },
        });

        res.status(200).json({ message: 'Role assigned to main user successfully', userRole });
    } catch (error) {
        console.error(`Error assigning role to main user: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove Role from Main User
export const removeRoleFromMainUser = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { roleId, userId } = req.params;

        await prisma.mainUserRole.delete({
            where: {
                user_id_role_id: {
                    user_id: parseInt(userId),
                    role_id: parseInt(roleId),
                },
            },
        });

        res.status(200).json({ message: 'Role removed from main user successfully' });
    } catch (error) {
        console.error(`Error removing role from main user: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};
