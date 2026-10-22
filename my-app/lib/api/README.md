# API Layer

Shared helpers for Route Handlers. Introduced incrementally so existing
routes keep their current request and response shapes.

## Architecture

```
lib/api/
├── responses/         # Standardized JSON helpers
│   ├── success.ts
│   ├── error.ts
│   └── named.ts
└── middleware/        # Auth and other wrappers (future)
```

## Response contract

Current routes already use these shapes. The helpers preserve them:

- Success: the payload is the JSON body (`{ texts }`, `{ id }`, preview, …)
- Error: `{ error: string }` with 400, 401, 413, 422, or 502

Do not wrap success bodies in `{ success, data }`. That would change clients.

## Usage

```typescript
import { ApiError, ApiResponse } from "@/lib/api/responses";

export async function POST() {
  return ApiResponse.json({ texts: [] });
}

export async function GET() {
  return ApiError.unauthorized("Sign in required");
}
```

Pass the existing route message when migrating. Anki routes use codes such as
`signed-out`; card routes use sentences such as `Sign in required`.

## Migration strategy

Helpers are unused until a later slice. Routes will switch one file at a time.
