import { Component, OnDestroy, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];
  readonly messages: WritableSignal<string[]> = signal([]);
  readonly toast: WritableSignal<boolean> = signal(false);

  duration: number = 5000;

  constructor(private _signalRService: SignalRService) {

    this._subscriptions.push(
      this._signalRService.messageReceived$
        .subscribe((message: string) => {
          this.messages.mutate(m => m.push(message));
          this._showToast();
          setTimeout(() => { }, 600);
        })
    );
  }


  private _showToast() {
    this.toast.set(true);
    setTimeout(() => {
      this._hideToast();
    }, this.duration)
  }


  private _hideToast() {
    if (2 > this.messages().length) {
      this.toast.set(false)
    }
    setTimeout(() => {
      this.messages.mutate(x => x.splice(x.length - 1, 1))
    }, 600)
  }


  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }
}
