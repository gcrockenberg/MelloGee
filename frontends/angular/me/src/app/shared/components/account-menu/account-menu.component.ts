import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.scss']
})
export class AccountMenuComponent {
  @Input() visible: boolean = false;
}
