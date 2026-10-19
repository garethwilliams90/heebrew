declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean });
    prepare(source: string): {
      all: () => unknown[];
      get: () => unknown;
    };
    close(): void;
  }
}
