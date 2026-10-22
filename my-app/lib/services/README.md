# Services Layer

This directory contains the service layer architecture for the application. Services encapsulate business logic and coordinate between repositories, external APIs, and other services.

## Architecture

```
lib/services/
├── core/              # Base classes and DI container
│   ├── BaseService.ts
│   └── ServiceContainer.ts
├── auth/              # Authentication services (future)
├── cards/             # Card management services (future)
├── learning/          # Learning/progress services (future)
└── payment/           # Payment services (future)
```

## Usage

### Creating a Service

```typescript
import { BaseService } from "@/lib/services/core";

export class MyService extends BaseService {
  async doSomething() {
    // Business logic here
  }
}
```

### Registering a Service

```typescript
import { container } from "@/lib/services/core";
import { MyService } from "@/lib/services/my/MyService";

container.register("MyService", () => new MyService());
```

### Using a Service

```typescript
import { container } from "@/lib/services/core";
import type { MyService } from "@/lib/services/my/MyService";

const myService = container.resolve<MyService>("MyService");
await myService.doSomething();
```

## Principles

1. **Single Responsibility**: Each service handles one domain area
2. **Dependency Injection**: Services are resolved via the container
3. **Testability**: Services can be mocked/stubbed for testing
4. **Stateless**: Services should be stateless singletons where possible

## Migration Strategy

Services are being introduced incrementally. Existing code will be migrated one module at a time to maintain stability.
