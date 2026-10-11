# Clean Architecture - Quick Start Guide

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles with clear separation of concerns across 4 main layers:

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)          │  ← React Components, Pages, Hooks
├─────────────────────────────────────┤
│   Application Layer (Business)     │  ← Services, Use Cases
├─────────────────────────────────────┤
│   Domain Layer (Core)               │  ← Entities, Interfaces
├─────────────────────────────────────┤
│   Infrastructure Layer (External)   │  ← API, Storage, HTTP
└─────────────────────────────────────┘
```

## 📦 Layer Responsibilities

### 1. Domain Layer (`src/domain/`)
**Purpose**: Core business logic with no external dependencies

- **Entities**: Business objects (User, Product, Vendor)
- **Repository Interfaces**: Contracts for data access

```typescript
// Example: Domain Entity
export interface Product {
  product_id: number;
  product_name: string;
  product_price: string;
  // ... other fields
}
```

### 2. Application Layer (`src/application/`)
**Purpose**: Business logic and use cases

- **Services**: Contains business rules and validation

```typescript
// Example: Service
export class ProductService {
  async createProducts(products: CreateProductDTO[]): Promise<void> {
    // Business validation
    if (products.length === 0) {
      throw new Error('At least one product is required');
    }
    // Call repository
    await this.repository.create(products);
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)
**Purpose**: External concerns (API, database, etc.)

- **Repositories**: Concrete implementations of repository interfaces
- **HTTP Client**: Axios configuration

```typescript
// Example: Repository Implementation
export class ProductRepository implements IProductRepository {
  async create(data: CreateProductDTO[]): Promise<void> {
    await api.post(`${Url}/products`, data);
  }
}
```

### 4. Presentation Layer (`src/presentation/`)
**Purpose**: UI components and state management

- **Components**: React components
- **Pages**: Page-level components
- **Hooks**: Custom React hooks
- **Store**: Redux state management

## 🚀 Usage Examples

### Example 1: Using Services in Components

```typescript
import { useProductService } from '@/presentation/hooks/useProductService';
import { useState } from 'react';

function ProductForm() {
  const productService = useProductService();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateProductDTO[]) => {
    setLoading(true);
    try {
      await productService.createProducts(data);
      // Success!
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 2: Using Services in Redux Slices

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductService } from '@/application/services/ProductService';
import { ProductRepository } from '@/infrastructure/api/ProductRepository';

export const createProductFn = createAsyncThunk(
  'createProduct',
  async (data: CreateProductDTO[], { rejectWithValue }) => {
    try {
      const repository = new ProductRepository();
      const service = new ProductService(repository);
      await service.createProducts(data);
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Example 3: Direct Service Usage

```typescript
import { ProductService } from '@/application/services/ProductService';
import { ProductRepository } from '@/infrastructure/api/ProductRepository';

// Create instances
const repository = new ProductRepository();
const service = new ProductService(repository);

// Use service
const products = await service.getAllProducts(1, 20);
await service.createProducts([productData]);
```

## 📁 File Organization

```
src/
├── domain/
│   ├── entities/          # User.ts, Product.ts, Vendor.ts
│   └── repositories/      # IProductRepository.ts, etc.
│
├── application/
│   └── services/          # ProductService.ts, VendorService.ts
│
├── infrastructure/
│   ├── api/               # ProductRepository.ts, VendorRepository.ts
│   └── http/              # api.ts (Axios setup)
│
├── presentation/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── hooks/            # Custom hooks (useProductService, etc.)
│   └── store/            # Redux store and slices
│
└── shared/
    └── constants/         # App-wide constants
```

## ✅ Benefits

1. **Testability**: Easy to mock repositories
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features
4. **Type Safety**: Strong typing throughout
5. **Independence**: Business logic independent of frameworks

## 📚 Documentation Files

- `ARCHITECTURE.md` - Detailed architecture documentation
- `MIGRATION_GUIDE.md` - Step-by-step migration guide
- `CLEAN_ARCHITECTURE_SUMMARY.md` - Implementation summary

## 🔄 Migration Status

✅ **Completed**:
- Domain entities and interfaces
- Application services
- Infrastructure repositories
- HTTP client setup
- Shared constants
- Example hooks

⏳ **In Progress**:
- Migrating existing Redux slices
- Updating component imports

## 💡 Tips

1. Always use services, never call repositories directly from components
2. Keep business logic in services, not in components
3. Use hooks for easy service access in components
4. Follow the dependency rule: inner layers don't depend on outer layers
