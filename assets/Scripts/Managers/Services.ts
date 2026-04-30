export class Services {
    private static services = new Map<Function, unknown>();

    public static Register<T>(type: new (...args: any[]) => T, instance: T): void {
        this.services.set(type, instance);
    }

    public static GetService<T>(type: new (...args: any[]) => T): T {
        const service = this.services.get(type);

        if (!service) {
            throw new Error(`[Services] Service not registered: ${type.name}`);
        }

        return service as T;
    }
}