import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BottomNavigationComponent } from '../../shared/components/bottom-navigation/bottom-navigation.component'
import { HeaderComponent } from '../../shared/components/header/header.component'
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component'
import { RightSideComponent } from '../../components/right-side/right-side.component'
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    BottomNavigationComponent,
    CommonModule,
    HeaderComponent,
    RightSideComponent,
    SidebarComponent
    ]
})
export class MainComponent {
  userId: any = undefined;

  constructor(private auth: AuthService) { 
    auth.CurrentUser.subscribe(
      (result) => this.userId = result!.id
    );
  }

}
