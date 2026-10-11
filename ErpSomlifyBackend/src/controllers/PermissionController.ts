import { Response } from 'express';
import { prisma } from '../prisma';
import { CustomUserRequest } from '../middlewares';

// ============================================
// PERMISSION CONTROLLERS
// ============================================

// Get All Permissions
export const getAllPermissions = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { resource } = req.query;

        const where = resource ? { resource: resource as string } : {};

        const permissions = await prisma.permission.findMany({
            where,
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        });

        res.status(200).json(permissions);
    } catch (error) {
        console.error(`Error fetching permissions: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Single Permission
export const getPermission = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const permission = await prisma.permission.findUnique({
            where: { id: parseInt(id) },
            include: {
                roles: {
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
        });

        if (!permission) {
            res.status(404).json({ message: 'Permission not found' });
            return;
        }

        res.status(200).json(permission);
    } catch (error) {
        console.error(`Error fetching permission: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Permission
export const createPermission = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { name, resource, action, description } = req.body;

        if (!name || !resource || !action) {
            res.status(400).json({ message: 'Name, resource, and action are required' });
            return;
        }

        // Check if permission already exists
        const existingPermission = await prisma.permission.findUnique({ where: { name } });
        if (existingPermission) {
            res.status(400).json({ message: 'Permission already exists' });
            return;
        }

        const permission = await prisma.permission.create({
            data: { name, resource, action, description },
        });

        res.status(201).json({ message: 'Permission created successfully', permission });
    } catch (error) {
        console.error(`Error creating permission: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Permission
export const updatePermission = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, resource, action, description } = req.body;

        const permission = await prisma.permission.update({
            where: { id: parseInt(id) },
            data: { name, resource, action, description },
        });

        res.status(200).json({ message: 'Permission updated successfully', permission });
    } catch (error) {
        console.error(`Error updating permission: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Permission
export const deletePermission = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if permission is assigned to any roles
        const roleCount = await prisma.rolePermission.count({
            where: { permission_id: parseInt(id) },
        });

        if (roleCount > 0) {
            res.status(400).json({
                message: `Cannot delete permission. It is assigned to ${roleCount} role(s).`,
            });
            return;
        }

        await prisma.permission.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Permission deleted successfully' });
    } catch (error) {
        console.error(`Error deleting permission: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Bulk Create Permissions
export const bulkCreatePermissions = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const { permissions } = req.body;

        if (!Array.isArray(permissions) || permissions.length === 0) {
            res.status(400).json({ message: 'Permissions array is required' });
            return;
        }

        const created = await prisma.permission.createMany({
            data: permissions.map(p => ({
                name: p.name,
                resource: p.resource,
                action: p.action,
                description: p.description,
            })),
            skipDuplicates: true,
        });

        res.status(201).json({
            message: `Created ${created.count} permissions`,
            count: created.count,
        });
    } catch (error) {
        console.error(`Error bulk creating permissions: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Permissions Grouped by Resource
export const getPermissionsByResource = async (req: CustomUserRequest, res: Response): Promise<void> => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        });

        // Group by resource
        const grouped = permissions.reduce((acc, perm) => {
            if (!acc[perm.resource]) {
                acc[perm.resource] = [];
            }
            acc[perm.resource].push(perm);
            return acc;
        }, {} as Record<string, typeof permissions>);

        res.status(200).json(grouped);
    } catch (error) {
        console.error(`Error fetching grouped permissions: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};
