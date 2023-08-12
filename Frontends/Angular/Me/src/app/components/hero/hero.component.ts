import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSliderComponent } from "../main-slider/main-slider.component";
import { CategoryNavComponent } from "../catalog/category-nav/category-nav.component";

@Component({
    selector: 'app-hero',
    standalone: true,
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss'],
    imports: [CommonModule, MainSliderComponent, CategoryNavComponent]
})
export class HeroComponent {

}
