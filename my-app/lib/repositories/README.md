# Repositories

Table-scoped data access. Repositories wrap Supabase queries so services and
lib modules do not repeat pagination, table names, or session wiring.

## Architecture

```
lib/repositories/
├── BaseRepository.ts   # Table + client, plus readAllPages
├── CardRepository.ts   # cards inserts, updates, upserts, deletes
├── types.ts            # PAGE_SIZE and page result shape
└── index.ts
```

`CardRepository` is unused until a later slice migrates `saveCard`. Deck and
progress repositories come after that.

## Usage

```typescript
import { BaseRepository, readAllPages } from "@/lib/repositories";

class ExampleRepository extends BaseRepository {
  constructor(supabase: RepositoryClient) {
    super("cards", supabase);
  }
}

const rows = await readAllPages((from, to) =>
  supabase.from("card_progress").select("card_id").range(from, to),
);
```

Pass the same client `requireUser()` or a Route Handler already created.
Do not construct a second anonymous client inside the repository.

## Why not the service container

`ServiceContainer` holds process-wide singletons. A repository must use the
request's Supabase client so cookies and RLS stay correct. Construct one per
call site, then pass it in.

## Migration strategy

`saveCard` uses `CardRepository`. `removeCard` and deck deletes still use
inline queries until later slices.
