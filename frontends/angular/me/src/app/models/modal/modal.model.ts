import { WritableSignal } from "@angular/core";

/**
 * Modal components should implement this interface and register with ModalService
 * in OnInit and OnDestroy
 */
export interface IModal {
    id: string;
    isOpen: WritableSignal<boolean>;
    open(): void;
    close(): void;
    setTarget<T>(target: T): void;
}