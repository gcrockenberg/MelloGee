import { Component, ElementRef, QueryList, ViewChildren, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapSearch } from '@ng-icons/bootstrap-icons';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ bootstrapSearch })],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  private _searchTerm: string = '';
  @ViewChildren('searchInput')
  public listItems!: QueryList<ElementRef<HTMLInputElement>>

  readonly isAnimating: WritableSignal<boolean> = signal<boolean>(false);

  constructor(private _router: Router) { }



  handleSubmit(e: any) {
    e.preventDefault();
    if (2 < this._searchTerm.length) {
      this.listItems.first.nativeElement.value = '';
      this._router.navigate([`/search/${this._searchTerm}`]);
    } else {
      // animate if search is empty or too short
      this.isAnimating.set(true);
      setTimeout(() => {
        this.isAnimating.set(false);
      }, 1000)
    }
  }


  setSearchTerm(e: any) {
    this._searchTerm = e.target.value;
  }


}
