export interface IModal {
    id: string;
    isOpen: boolean;
    open(): void;
    close(): void;
    setTarget<T>(target: T): void;
}