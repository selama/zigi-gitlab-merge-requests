interface IConcurrencyLimitter {
    add<T>(action: () => Promise<T>): Promise<T>;
    pause(timeout: number): void;
}
