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
└── middleware/        # withAuth for Route Handlers
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

## Auth

```typescript
import { withAuth } from "@/lib/api/middleware";

export const POST = withAuth(async (request, { user, supabase }) => {
  return ApiResponse.json({ id: user.id });
});
```

`/api/cards/suggest` is the first migrated route. Other routes still check
auth inline. Pass `"signed-out"` as the second argument for Anki routes.

## Migration strategy

Routes switch one file at a time. Keep each existing error string.
