import { Component, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterListTitleComponent } from '../footer-list-title/footer-list-title.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapFacebook, bootstrapGithub, bootstrapLinkedin, bootstrapYoutube } from "@ng-icons/bootstrap-icons"
import { CatalogService } from 'src/app/services/catalog/catalog.service';
import { RouterLink } from '@angular/router';
import { SecurityService } from 'src/app/services/security/security.service';
import { ICatalogType } from 'src/app/models/catalog.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FooterListTitleComponent, NgIconComponent, RouterLink],
  providers: [provideIcons({ bootstrapFacebook, bootstrapGithub, bootstrapLinkedin, bootstrapYoutube })],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  emailInfo: string = '';
  subscription = signal<boolean>(false);
  readonly catalogTypes: WritableSignal<ICatalogType[]> = signal([]);

  constructor(private _catalogservice: CatalogService, private _securityService: SecurityService) {
    _catalogservice.getTypes().subscribe(catalogTypes => this.catalogTypes.set(catalogTypes));
  }


  editProfile() {
    this._securityService.editProfile();
  }


  handleSubscription() {
    if (typeof this.emailInfo != 'undefined' && 0 < this.emailInfo.length) {
      this.subscription.set(true);
    }
    this.subscription.set(false);
  }


  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


}
