import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, OnInit, ViewChild, WritableSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICatalog } from 'src/app/models/catalog/catalog.model';
import { ICatalogItem } from 'src/app/models/catalog/catalog-item.model';
import { Swiper, SwiperOptions } from 'swiper/types';
import { register } from 'swiper/element/bundle'
import { ProductComponent } from "../product/product.component";
import { SwiperDirective } from 'src/app/directives/swiper.directive';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, ProductComponent, SwiperDirective],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SliderComponent implements OnInit {
  readonly items: WritableSignal<ICatalogItem[]> = signal([]);
  private _catalog!: ICatalog;
  @Input() set catalog(value: ICatalog) {
    this.items.set(value.data);
    this._catalog = value;
  }
  get catalog(): ICatalog { return this._catalog }

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
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 30
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30
        },
        1024: {
          slidesPerView: 2,
          spaceBetween: 30
        },
        1440: {
          slidesPerView: 5,
          spaceBetween: 30
        }
      },
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
    console.log(this.swiper?.activeIndex);
  }

}
