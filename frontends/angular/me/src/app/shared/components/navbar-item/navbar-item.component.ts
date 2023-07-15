import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-item.component.html',
  styleUrls: ['./navbar-item.component.scss']
})
export class NavbarItemComponent {
  @Input() label!: string;
  @Input() href!: string;
}
