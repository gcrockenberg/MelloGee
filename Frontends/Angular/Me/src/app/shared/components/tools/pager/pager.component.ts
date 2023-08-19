import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPager } from 'src/app/models/pager.model';

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent implements OnInit, OnChanges {
  @Output()
  changed: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  model!: IPager;

  buttonStates: any = {
      nextDisabled: true,
      previousDisabled: true,
  };

  ngOnInit() {
  }

  ngOnChanges() {
      if (this.model) {
          this.model.items = (this.model.itemsPage > this.model.totalItems) ? this.model.totalItems : this.model.itemsPage;

          this.buttonStates.previousDisabled = (this.model.actualPage == 0);
          this.buttonStates.nextDisabled = (this.model.actualPage + 1 >= this.model.totalPages);
      }
  }

  onNextClicked(event: any) {
      event.preventDefault();
      this.changed.emit(this.model.actualPage + 1);
  }

  onPreviousCliked(event: any) {
      event.preventDefault();
      this.changed.emit(this.model.actualPage - 1);
  }
}
