import { Component, signal, effect, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CarouselSlide {
  src: string;
  alt: string;
  caption: string;
}

const SLIDES: CarouselSlide[] = [
  { src: '/fix-it.PNG', alt: 'Fix-It plant care product', caption: 'Fix-It' },
  { src: '/product 2.PNG', alt: 'Glucofix product', caption: 'Glucofix' },
  { src: '/product 3.PNG', alt: 'PhytoGold Tea', caption: 'PhytoGold Tea' },
];

const INTERVAL_MS = 4500;

@Component({
  imports: [RouterLink],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero implements OnDestroy {
  readonly slides = SLIDES;
  readonly current = signal(0);
  private timerId: ReturnType<typeof setInterval> | undefined;

  constructor() {
    effect(() => {
      this.startAutoAdvance();
    });
  }

  startAutoAdvance(): void {
    this.stopAutoAdvance();
    this.timerId = setInterval(() => this.next(), INTERVAL_MS);
  }

  stopAutoAdvance(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  next(): void {
    this.current.set((this.current() + 1) % this.slides.length);
  }

  prev(): void {
    this.current.set((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  goTo(index: number): void {
    this.current.set(index);
  }

  ngOnDestroy(): void {
    this.stopAutoAdvance();
  }
}