import { Injectable } from '@angular/core';
import { IModal } from 'src/app/models/modal/modal.model';

/**
 * Privide hook between Templates and Modal components that implement IModal
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
    private modals: IModal[] = [];

    add(modal: IModal) {
        // ensure component has a unique id attribute
        if (!modal.id || this.modals.find(x => x.id === modal.id)) {
            throw new Error(`Modal id: ${ modal.id } must be unique. Modal count: ${ this.modals.length }`);
        }

        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(modal: IModal) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x === modal);
    }

    open<T>(id: string, data?: T) {
        // open modal specified by id
        const modal = this.modals.find(x => x.id === id);

        if (!modal) {
            throw new Error(`Modal '${id}' not found`);
        }

        if (data) {
            let temp: T = data;
            modal.setTarget<T>(temp);
        }
        
        modal.open();
    }

    close() {
        // close the modal that is currently open
        const modal = this.modals.find(x => x.isOpen);
        modal?.close();
    }
}
