# Migration Guide: Clean Architecture

## Overview
This guide helps you migrate from the old structure to the new clean architecture structure.

## Key Changes

### 1. Domain Entities
**Old**: Types scattered in `Interfaces.tsx` and Redux slices
**New**: Centralized in `src/domain/entities/`

```typescript
// Old
import { userRegisterInterface } from '@/Interfaces';

// New
import { UserRegistration, User } from '@/domain/entities/User';
```

### 2. API Calls
**Old**: Direct API calls in Redux slices
**New**: Repository pattern with services

```typescript
// Old (in Redux slice)
const response = await axios.post(`${Url}/products`, data);

// New (using service)
import { ProductService } from '@/application/services';
import { ProductRepository } from '@/infrastructure/api';

const repository = new ProductRepository();
const service = new ProductService(repository);
await service.createProducts(products);
```

### 3. Constants
**Old**: `Url` and `errorMsg` in `Interfaces.tsx`
**New**: `src/shared/constants/index.ts`

```typescript
// Old
import { Url, errorMsg } from '@/Interfaces';

// New
import { Url, errorMsg } from '@/shared/constants';
```

### 4. API Client
**Old**: `src/api.ts`
**New**: `src/infrastructure/http/api.ts`

```typescript
// Old
import api from '@/api';

// New
import api from '@/infrastructure/http/api';
```

## Migration Steps

### Step 1: Update Imports
Replace old imports with new ones:

```typescript
// Before
import { Url } from './Interfaces';
import api from './api';

// After
import { Url } from '@/shared/constants';
import api from '@/infrastructure/http/api';
```

### Step 2: Use Services Instead of Direct API Calls
Instead of calling API directly in components or Redux slices, use services:

```typescript
// Before (in component)
const handleCreate = async () => {
  const response = await api.post('/products', data);
};

// After
import { ProductService } from '@/application/services';
import { ProductRepository } from '@/infrastructure/api';

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

const handleCreate = async () => {
  await productService.createProducts([data]);
};
```

### Step 3: Update Redux Slices
Refactor Redux slices to use services:

```typescript
// Before
export const createProductFn = createAsyncThunk(
  'createProduct',
  async (data, { rejectWithValue }) => {
    const response = await axios.post(`${Url}/products`, data);
    return response.data;
  }
);

// After
import { ProductService } from '@/application/services';
import { ProductRepository } from '@/infrastructure/api';

export const createProductFn = createAsyncThunk(
  'createProduct',
  async (data, { rejectWithValue }) => {
    try {
      const repository = new ProductRepository();
      const service = new ProductService(repository);
      await service.createProducts(data);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## File Organization

### Components
Keep components in `src/presentation/components/` or `src/components/` (your choice)

### Pages
Keep pages in `src/presentation/pages/` or `src/Pages/` (your choice)

### Redux
- Store: `src/presentation/store/Store.tsx`
- Slices: `src/presentation/store/slices/`

## Benefits

1. **Testability**: Easy to mock repositories
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new features
4. **Type Safety**: Strong typing throughout

## Next Steps

1. Gradually migrate Redux slices to use services
2. Update component imports
3. Add more entities as needed (Customer, Sale, Purchase, etc.)
4. Create more services for complex business logic
