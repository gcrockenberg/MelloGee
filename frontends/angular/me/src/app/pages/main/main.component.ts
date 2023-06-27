import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component'
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component'
import { RightSideComponent } from '../../components/right-side/right-side.component'

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  imports: [
    BottomNavigationComponent,
    CommonModule,
    RightSideComponent,
    SidebarComponent
    ]
})
export class MainComponent {

}
