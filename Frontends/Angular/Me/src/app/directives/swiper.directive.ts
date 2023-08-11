import { Directive, ElementRef, Input } from '@angular/core';
import { SwiperOptions } from 'swiper/types';

/**
 * No longer needed/used. Swiper initialization is handled within the Component.
 * Must set init=false on the html Element
 */
@Directive({
  selector: '[appSwiperDirective]',
  standalone: true
})
export class SwiperDirective {

  private readonly swiperElement: HTMLElement;

  @Input('config')
  config?: SwiperOptions;

  constructor(private _el: ElementRef<HTMLElement>) {
    this.swiperElement = _el.nativeElement;
  }

  ngAfterViewInit() {
    Object.assign(this._el.nativeElement, this.config);

    // @ts-ignore
    //this.el.nativeElement.initialize();
  }

}
