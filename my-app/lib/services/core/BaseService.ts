/**
 * Base service class providing common functionality for all services.
 * Services encapsulate business logic and coordinate between repositories,
 * external APIs, and other services.
 */
export abstract class BaseService {
  protected constructor() {}

  /**
   * Override to perform service initialization.
   * Called automatically on first service access.
   */
  protected async initialize(): Promise<void> {
    // Override in subclasses if initialization is needed
  }

  /**
   * Template method for operations requiring initialization.
   */
  protected async withInit<T>(operation: () => Promise<T>): Promise<T> {
    await this.initialize();
    return operation();
  }
}
