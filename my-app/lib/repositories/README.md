# Repositories

Table-scoped data access. Repositories wrap Supabase queries so services and
lib modules do not repeat pagination, table names, or session wiring.

## Architecture

```
lib/repositories/
├── BaseRepository.ts   # Table + client, plus readAllPages
├── types.ts            # PAGE_SIZE and page result shape
└── index.ts
```

Concrete repositories (cards, decks, progress) come in later slices.

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

This slice is unused scaffolding. Later slices add one repository, then
migrate one function at a time (`saveCard`, then the rest of `library.ts`).
