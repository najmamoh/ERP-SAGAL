import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default permissions for the system
const defaultPermissions = [
  // Sales permissions
  { name: 'sales:create', resource: 'sales', action: 'create', description: 'Create new sales' },
  { name: 'sales:read', resource: 'sales', action: 'read', description: 'View sales' },
  { name: 'sales:update', resource: 'sales', action: 'update', description: 'Update sales' },
  { name: 'sales:delete', resource: 'sales', action: 'delete', description: 'Delete sales' },

  // Reports permissions
  { name: 'reports:read', resource: 'reports', action: 'read', description: 'View reports' },
  { name: 'reports:export', resource: 'reports', action: 'export', description: 'Export reports' },

  // Customers permissions
  { name: 'customers:create', resource: 'customers', action: 'create', description: 'Create customers' },
  { name: 'customers:read', resource: 'customers', action: 'read', description: 'View customers' },
  { name: 'customers:update', resource: 'customers', action: 'update', description: 'Update customers' },
  { name: 'customers:delete', resource: 'customers', action: 'delete', description: 'Delete customers' },

  // Products permissions
  { name: 'products:create', resource: 'products', action: 'create', description: 'Create products' },
  { name: 'products:read', resource: 'products', action: 'read', description: 'View products' },
  { name: 'products:update', resource: 'products', action: 'update', description: 'Update products' },
  { name: 'products:delete', resource: 'products', action: 'delete', description: 'Delete products' },

  // Purchases permissions
  { name: 'purchases:create', resource: 'purchases', action: 'create', description: 'Create purchases' },
  { name: 'purchases:read', resource: 'purchases', action: 'read', description: 'View purchases' },
  { name: 'purchases:update', resource: 'purchases', action: 'update', description: 'Update purchases' },
  { name: 'purchases:delete', resource: 'purchases', action: 'delete', description: 'Delete purchases' },

  // Employees permissions
  { name: 'employees:create', resource: 'employees', action: 'create', description: 'Create employees' },
  { name: 'employees:read', resource: 'employees', action: 'read', description: 'View employees' },
  { name: 'employees:update', resource: 'employees', action: 'update', description: 'Update employees' },
  { name: 'employees:delete', resource: 'employees', action: 'delete', description: 'Delete employees' },

  // Expenses permissions
  { name: 'expenses:create', resource: 'expenses', action: 'create', description: 'Create expenses' },
  { name: 'expenses:read', resource: 'expenses', action: 'read', description: 'View expenses' },
  { name: 'expenses:update', resource: 'expenses', action: 'update', description: 'Update expenses' },
  { name: 'expenses:delete', resource: 'expenses', action: 'delete', description: 'Delete expenses' },

  // Banking permissions
  { name: 'banking:create', resource: 'banking', action: 'create', description: 'Create banking transactions' },
  { name: 'banking:read', resource: 'banking', action: 'read', description: 'View banking' },
  { name: 'banking:update', resource: 'banking', action: 'update', description: 'Update banking' },
  { name: 'banking:delete', resource: 'banking', action: 'delete', description: 'Delete banking' },

  // Vendors permissions
  { name: 'vendors:create', resource: 'vendors', action: 'create', description: 'Create vendors' },
  { name: 'vendors:read', resource: 'vendors', action: 'read', description: 'View vendors' },
  { name: 'vendors:update', resource: 'vendors', action: 'update', description: 'Update vendors' },
  { name: 'vendors:delete', resource: 'vendors', action: 'delete', description: 'Delete vendors' },

  // Invoices permissions
  { name: 'invoices:create', resource: 'invoices', action: 'create', description: 'Create invoices' },
  { name: 'invoices:read', resource: 'invoices', action: 'read', description: 'View invoices' },
  { name: 'invoices:update', resource: 'invoices', action: 'update', description: 'Update invoices' },
  { name: 'invoices:delete', resource: 'invoices', action: 'delete', description: 'Delete invoices' },

  // Companies permissions (admin only)
  { name: 'companies:create', resource: 'companies', action: 'create', description: 'Create companies' },
  { name: 'companies:read', resource: 'companies', action: 'read', description: 'View companies' },
  { name: 'companies:update', resource: 'companies', action: 'update', description: 'Update companies' },
  { name: 'companies:delete', resource: 'companies', action: 'delete', description: 'Delete companies' },

  // Users permissions
  { name: 'users:create', resource: 'users', action: 'create', description: 'Create users' },
  { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
  { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
  { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },

  // Roles/Permissions management
  { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create roles' },
  { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles' },
  { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update roles' },
  { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
  { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permissions' },
];

// Default roles and their permissions
const defaultRoles = [
  {
    name: 'super_admin',
    description: 'Full system access to all features',
    permissions: defaultPermissions.map(p => p.name), // All permissions
  },
  {
    name: 'admin',
    description: 'Company admin with full company access',
    permissions: defaultPermissions
      .filter(p => !['companies:create', 'companies:delete'].includes(p.name))
      .map(p => p.name),
  },
  {
    name: 'manager',
    description: 'Manage sales, inventory, and reports',
    permissions: [
      'sales:create', 'sales:read', 'sales:update', 'sales:delete',
      'reports:read', 'reports:export',
      'customers:create', 'customers:read', 'customers:update',
      'products:read', 'products:update',
      'purchases:read',
      'employees:read',
      'expenses:read',
      'vendors:read',
      'invoices:create', 'invoices:read', 'invoices:update',
    ],
  },
  {
    name: 'cashier',
    description: 'Handle sales transactions only',
    permissions: [
      'sales:create', 'sales:read',
      'customers:read', 'customers:create',
      'products:read',
      'invoices:create', 'invoices:read',
    ],
  },
  {
    name: 'accountant',
    description: 'Manage financial data and reports',
    permissions: [
      'sales:read',
      'reports:read', 'reports:export',
      'expenses:create', 'expenses:read', 'expenses:update',
      'banking:create', 'banking:read', 'banking:update',
      'purchases:read',
      'invoices:read',
    ],
  },
  {
    name: 'viewer',
    description: 'Read-only access to basic data',
    permissions: [
      'sales:read',
      'reports:read',
      'customers:read',
      'products:read',
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed permissions
  console.log('📝 Creating permissions...');
  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
      },
      create: permission,
    });
  }
  console.log(`✅ Created ${defaultPermissions.length} permissions`);

  // Seed roles
  console.log('👥 Creating roles...');
  for (const roleData of defaultRoles) {
    const role = await prisma.roleDefinition.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
      },
    });

    // Assign permissions to role
    for (const permName of roleData.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: permission.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: permission.id,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${defaultRoles.length} roles with permissions`);

  // Create default super admin if not exists
  const superAdminEmail = 'admin@system.com';
  const existingAdmin = await prisma.main_users.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    console.log('👤 Creating default super admin...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const superAdmin = await prisma.main_users.create({
      data: {
        full_name: 'System Admin',
        email: superAdminEmail,
        password: hashedPassword,
      },
    });

    // Assign super_admin role
    const superAdminRole = await prisma.roleDefinition.findUnique({
      where: { name: 'super_admin' },
    });

    if (superAdminRole) {
      await prisma.mainUserRole.create({
        data: {
          user_id: superAdmin.id,
          role_id: superAdminRole.id,
        },
      });
    }

    console.log('✅ Created super admin: admin@system.com / admin123');
  }

  // ============================================
  // Create Default Company and User
  // ============================================
  console.log('🏢 Creating default company...');
  const companyEmail = 'admin@somalify.com';

  // 1. Create Company
  const defaultCompany = await prisma.companies.upsert({
    where: { company_email: companyEmail },
    update: {},
    create: {
      company_id: 'CMP-SOMALIFY-001',
      company_name: 'Somalify',
      company_email: companyEmail,
      company_address: 'Mogadishu, Somalia',
      company_phone: '+252610000000',
      isBanned: false,
      taxable: true,
      tax_percentage: 5,
    }
  });
  console.log(`✅ Company '${defaultCompany.company_name}' ready.`);

  // 2. Create Company User (Admin)
  const userEmail = 'admin@somalify.com';
  const existingUser = await prisma.company_users.findUnique({
    where: { email: userEmail }
  });

  if (!existingUser) {
    console.log('👤 Creating default company admin user...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create the user
    const newUser = await prisma.company_users.create({
      data: {
        full_name: 'Somalify Admin',
        email: userEmail,
        password: hashedPassword,
        company_id: defaultCompany.company_id,
      }
    });

    // Assign 'admin' role from RoleDefinition (New RBAC)
    const adminRole = await prisma.roleDefinition.findUnique({
      where: { name: 'admin' }
    });

    if (adminRole) {
      await prisma.userRole.create({
        data: {
          user_id: newUser.user_id,
          role_id: adminRole.id,
          company_id: defaultCompany.company_id
        }
      });
    }

    console.log('✅ Created company user: admin@somalify.com / 123456');
  } else {
    console.log('ℹ️ Company user already exists.');
  }

  console.log('🎉 Seeding completed!');
  console.log('✅ Seeded main_users');

  const warehouseCount = await prisma.warehouses.count();
  if (warehouseCount === 0) {
    await prisma.warehouses.create({
      data: {
        warehouse_name: 'Main Warehouse',
        location: 'Main storage',
        description: 'Default warehouse for incoming purchases',
        is_active: true,
        is_default: true,
      },
    });
    console.log('✅ Seeded default warehouse');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
