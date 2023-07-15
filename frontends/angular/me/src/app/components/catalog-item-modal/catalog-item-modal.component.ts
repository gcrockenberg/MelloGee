import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapBagPlus, bootstrapXLg } from "@ng-icons/bootstrap-icons"
import { ButtonAddToCartComponent } from "../button-add-to-cart/button-add-to-cart.component";
import { ModalService } from 'src/app/services/modal/modal.service';
import { IModal } from 'src/app/models/modal/modal.model';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';

@Component({
  selector: 'app-catalog-item-modal',
  standalone: true,
  providers: [provideIcons({ bootstrapBagPlus, bootstrapXLg })],
  templateUrl: './catalog-item-modal.component.html',
  styleUrls: ['./catalog-item-modal.component.scss'],
  imports: [CommonModule, NgIconComponent, NgIf, ButtonAddToCartComponent]
})
export class CatalogItemModalComponent implements IModal, OnInit, OnDestroy {
  @Input() id!: string;
  isOpen: boolean = false;

  item!: ICatalogItem;
  private _element: any;

  constructor(public modalService: ModalService, private el: ElementRef) {
    this._element = el;
  }


  ngOnInit() {
    // add self (this modal instance) to the modal service so it can be opened from any component
    this.modalService.add(this);
  }


  open() {
    this.isOpen = true;
  }


  close() {
    this.isOpen = false;
  }


  setTarget<T>(target: T) {
    this.item = target as ICatalogItem;
  }


  ngOnDestroy(): void {
    // remove self from modal service
    this.modalService.remove(this);

    // remove modal element from html
    this._element.remove();
  }

}

