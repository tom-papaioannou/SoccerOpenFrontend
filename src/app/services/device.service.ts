import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, debounceTime, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobileSubject.asObservable();

  private readonly MOBILE_BREAKPOINT = 1024;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkDevice();

      fromEvent(window, 'resize')
        .pipe(debounceTime(150))
        .subscribe(() => this.checkDevice());
    }
  }

  private checkDevice(): void {
    const width = window.innerWidth;
    const isMobile = width <= this.MOBILE_BREAKPOINT;

    this.isMobileSubject.next(isMobile);
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
