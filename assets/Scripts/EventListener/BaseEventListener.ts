export class BaseEventListener<T extends Function> {
    private listeners: T[] = [];

    add(cb: T) {
        this.listeners.push(cb);
    }

    remove(cb: T) {
        this.listeners = this.listeners.filter(l => l !== cb);
    }

    invoke(...args: any[]) {
        for (const l of this.listeners) {
            (l as any)(...args);
        }
    }
}