const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create roles if they don't exist
    const superAdminRole = await prisma.roleDefinition.upsert({
      where: { name: 'superAdmin' },
      update: {},
      create: {
        name: 'superAdmin',
        description: 'Super administrator with full system access',
      },
    });

    const adminRole = await prisma.roleDefinition.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrator with elevated permissions',
      },
    });

    console.log('✅ Roles created/verified');

    // Create main admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'sagal', 10);
    
    const adminUser = await prisma.main_users.upsert({
      where: { email: process.env.ADMIN_EMAIL || 'admin@system.com' },
      update: {},
      create: {
        full_name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@system.com',
        password: hashedPassword,
      },
    });

    console.log('✅ Main user created/verified:', adminUser.email);

    // Assign superAdmin role to the main user
    const userRole = await prisma.mainUserRole.upsert({
      where: {
        user_id_role_id: {
          user_id: adminUser.id,
          role_id: superAdminRole.id,
        },
      },
      update: {},
      create: {
        user_id: adminUser.id,
        role_id: superAdminRole.id,
      },
    });

    console.log('✅ SuperAdmin role assigned to main user');

    // Create some basic permissions if they don't exist
    const permissions = [
      { name: 'users:create', description: 'Create users' },
      { name: 'users:read', description: 'Read users' },
      { name: 'users:update', description: 'Update users' },
      { name: 'users:delete', description: 'Delete users' },
      { name: 'companies:create', description: 'Create companies' },
      { name: 'companies:read', description: 'Read companies' },
      { name: 'companies:update', description: 'Update companies' },
      { name: 'companies:delete', description: 'Delete companies' },
      { name: 'system:admin', description: 'System administration' },
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      });
    }

    console.log('✅ Basic permissions created/verified');

    // Assign all permissions to superAdmin role
    const allPermissions = await prisma.permission.findMany();
    
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: superAdminRole.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: superAdminRole.id,
          permission_id: permission.id,
        },
      });
    }

    console.log('✅ All permissions assigned to superAdmin role');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
