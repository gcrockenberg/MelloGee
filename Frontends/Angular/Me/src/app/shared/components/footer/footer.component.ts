import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterListTitleComponent } from '../footer-list-title/footer-list-title.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { bootstrapFacebook, bootstrapGithub, bootstrapLinkedin, bootstrapYoutube } from "@ng-icons/bootstrap-icons"

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FooterListTitleComponent, NgIconComponent],
  providers: [provideIcons({ bootstrapFacebook, bootstrapGithub, bootstrapLinkedin, bootstrapYoutube })],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  emailInfo: string = '';
  subscription = signal<boolean>(false);

  handleSubscription() {
    if (typeof this.emailInfo != 'undefined' && 0 < this.emailInfo.length) {
      this.subscription.set(true);
      console.log(`--> subscribe email: ${this.emailInfo}`);
    }
    this.subscription.set(false);
  }
}
