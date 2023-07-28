import { Injectable } from '@angular/core';
import { ISidebar } from 'src/app/models/sitebar/sidebar.model';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebars: ISidebar[] = [];

  add(sidebar: ISidebar) {
    // ensure component has a unique id attribute
    if (!sidebar.id || this.sidebars.find(x => x.id === sidebar.id)) {
      throw new Error(`Sidebar id: ${ sidebar.id } must be unique. Sidebar count: ${ this.sidebars.length }`);
    }

    // add modal to array of active modals
    this.sidebars.push(sidebar);
  }

  remove(sidebar: ISidebar) {
    // remove modal from array of active modals
    this.sidebars = this.sidebars.filter(x => x === sidebar);
  }

  open(id: string) {
    // open modal specified by id
    const sidebar = this.sidebars.find(x => x.id === id);

    if (!sidebar) {
      throw new Error(`sidebar '${id}' not found`);
    }
      
    sidebar.isOpen.set(true);
  }

  close() {
    // close the modal that is currently open
    const sidebar = this.sidebars.find(x => x.isOpen);
    sidebar?.isOpen.set(false);
  }
}