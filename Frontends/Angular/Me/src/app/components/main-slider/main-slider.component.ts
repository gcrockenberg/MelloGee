import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, ViewChild, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle'
import { Swiper, SwiperOptions } from 'swiper/types';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';


@Component({
  selector: 'app-main-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainSliderComponent {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
  
  @ViewChild('swiperRef', { static: true })
  protected _swiperRef: ElementRef | undefined
  swiper?: Swiper

  constructor() {
    register();
  }

  ngOnInit(): void {
    this._initSwiper();
  }

  private _initSwiper() {
    // Swiper runs in shadow dom. This is how you apply styles, etc
    const config: SwiperOptions = {
      injectStyles: [`
      .mainSlider .swiper-pagination-bullets {
        bottom: 1.5rem;
      }
      
      .swiper-pagination-bullet-active,
      .mainSlider .swiper-pagination-bullet {
        background: #f6cd46;
      }
      
      .swiper-button-prev,
      .swiper-button-prev::after {
        font-size: 2rem;
      }

      .swiper-button-prev,
      .swiper-button-next,
      .swiper-button-prev::after,
      .swiper-button-next::after {
        font-size: 2rem;
        color: #f6cd46;  
      }`],
      pagination: {
        clickable: true
      }
    }

    const swiperElement = this._swiperRef!.nativeElement
    Object.assign(swiperElement, config)
    swiperElement.initialize()

    if (this.swiper) this.swiper.currentBreakpoint = false // Breakpoint fixes
    this.swiper = this._swiperRef!.nativeElement.swiper

    // this.swiper!.off('slideChange') // Avoid multiple subscription, in case you wish to call the `_initSwiper()` multiple time
    // this.swiper!.on('slideChange', () => { // Any change subscription you wish
    //   this.infinitLoad?.triggerOnScroll()
    // })
  }


  onActiveIndexChange() {
    //console.log(this.swiper?.activeIndex);
  }


  sliderData = [{
    img: 'assets/images/ring2.png',
    preTitle: 'Special offer',
    titlePart1: 'Save 20%',
    titlePart2: 'On your',
    titlePart3: 'first order',
    btnText: 'Shop now',
  },{
    img: 'assets/images/camera.png',
    preTitle: 'Special offer',
    titlePart1: 'Save 20%',
    titlePart2: 'On your',
    titlePart3: 'first order',
    btnText: 'Shop now',
  },{
    img: 'assets/images/camera.png',
    preTitle: 'Special offer',
    titlePart1: 'Save 20%',
    titlePart2: 'On your',
    titlePart3: 'first order',
    btnText: 'Shop now',
  }];
  
}
