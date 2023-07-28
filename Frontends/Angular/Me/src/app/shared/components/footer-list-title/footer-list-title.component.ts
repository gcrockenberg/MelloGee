import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-list-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-list-title.component.html',
  styleUrls: ['./footer-list-title.component.scss']
})
export class FooterListTitleComponent {
  @Input() title!: string; 
}
