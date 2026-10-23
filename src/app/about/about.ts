import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsService } from '../news.service';

@Component({
  imports: [RouterLink],
  selector: 'app-about',
  styleUrl: './about.css',
  templateUrl: './about.html',
})
export class About {
  readonly news = inject(NewsService);
  readonly latestNews = computed(() => this.news.latest()(3));
}