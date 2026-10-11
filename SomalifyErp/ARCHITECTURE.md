# Clean Architecture Documentation

## Project Structure

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/             # Core business entities
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Vendor.ts
│   │   └── index.ts
│   └── repositories/         # Repository interfaces (contracts)
│       ├── IProductRepository.ts
│       ├── IVendorRepository.ts
│       ├── IAuthRepository.ts
│       └── index.ts
│
├── application/               # Application Layer (Use Cases)
│   └── services/             # Business logic services
│       ├── ProductService.ts
│       ├── VendorService.ts
│       ├── AuthService.ts
│       └── index.ts
│
├── infrastructure/           # Infrastructure Layer (External Concerns)
│   ├── api/                  # API implementations
│   │   ├── ProductRepository.ts
│   │   └── VendorRepository.ts
│   └── http/                 # HTTP client setup
│       └── api.ts
│
├── presentation/             # Presentation Layer (UI)
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── hooks/              # Custom React hooks
│   └── store/              # Redux store
│       ├── slices/         # Redux slices
│       └── Store.tsx
│
└── shared/                  # Shared utilities
    ├── constants/          # Constants
    └── utils/              # Utility functions
```

## Layer Responsibilities

### Domain Layer
- **Entities**: Core business objects with no dependencies
- **Repository Interfaces**: Contracts defining data access operations
- **No dependencies** on other layers

### Application Layer
- **Services**: Business logic and use cases
- **Depends on**: Domain layer only
- **No UI or infrastructure dependencies**

### Infrastructure Layer
- **Repository Implementations**: Concrete implementations of repository interfaces
- **HTTP Client**: API communication setup
- **Depends on**: Domain layer (interfaces)

### Presentation Layer
- **Components**: React UI components
- **Pages**: Page-level components
- **Store**: Redux state management
- **Depends on**: Application services and domain entities

## Usage Example

```typescript
// In a component or hook
import { ProductService } from '@/application/services';
import { ProductRepository } from '@/infrastructure/api';

// Create service instance
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

// Use service
const products = await productService.getAllProducts(1, 20);
```

## Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to mock repositories for testing
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: Easy to add new features following the same pattern
5. **Independence**: Business logic is independent of frameworks
