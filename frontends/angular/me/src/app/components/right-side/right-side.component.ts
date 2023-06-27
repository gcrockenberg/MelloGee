import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutComponent } from '../about/about.component';
import { ContactMeComponent } from '../contact-me/contact-me.component';
import { IntroductionComponent } from '../introduction/introduction.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { ResumeComponent } from '../resume/resume.component';
import { WhatIDoComponent } from '../what-i-do/what-i-do.component';

@Component({
  selector: 'app-right-side',
  standalone: true,
  templateUrl: './right-side.component.html',
  styleUrls: ['./right-side.component.css'],
  imports: [
    AboutComponent,
    CommonModule,
    ContactMeComponent,
    IntroductionComponent,
    PortfolioComponent,
    ResumeComponent,
    WhatIDoComponent
  ]
})
export class RightSideComponent {

}
