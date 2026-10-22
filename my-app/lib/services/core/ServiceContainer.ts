import type { BaseService } from "./BaseService";

/**
 * Simple dependency injection container for services.
 * Provides singleton instances and manages service lifecycle.
 */
export class ServiceContainer {
  private static instance: ServiceContainer | null = null;
  private services: Map<string, BaseService> = new Map();
  private factories: Map<string, () => BaseService> = new Map();

  private constructor() {}

  /**
   * Get the global service container instance.
   */
  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service factory.
   * The factory will be called once when the service is first requested.
   *
   * @param token - Unique identifier for the service
   * @param factory - Function that creates the service instance
   */
  register<T extends BaseService>(token: string, factory: () => T): void {
    this.factories.set(token, factory as () => BaseService);
  }

  /**
   * Resolve a service by its token.
   * Creates the service on first access and returns cached instance thereafter.
   *
   * @param token - Unique identifier for the service
   * @returns The service instance
   * @throws Error if service is not registered
   */
  resolve<T extends BaseService>(token: string): T {
    const cached = this.services.get(token);
    if (cached) {
      return cached as T;
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`Service not registered: ${token}`);
    }

    const service = factory();
    this.services.set(token, service);
    return service as T;
  }

  /**
   * Check if a service is registered.
   */
  has(token: string): boolean {
    return this.factories.has(token);
  }

  /**
   * Clear all cached service instances.
   * Useful for testing or when services need to be recreated.
   */
  clearCache(): void {
    this.services.clear();
  }

  /**
   * Reset the container completely (for testing).
   */
  static reset(): void {
    if (ServiceContainer.instance) {
      ServiceContainer.instance.services.clear();
      ServiceContainer.instance.factories.clear();
    }
    ServiceContainer.instance = null;
  }
}

/**
 * Global container instance for convenient access.
 */
export const container = ServiceContainer.getInstance();
