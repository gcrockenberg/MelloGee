import { WritableSignal } from "@angular/core";

/**
 * Modal components should implement this interface and register with ModalService
 * in OnInit and OnDestroy
 */
export interface ISidebar {
    id: string;
    isOpen: WritableSignal<boolean>;
}
