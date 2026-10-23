import { Component, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NewsService } from '../news.service';

@Component({
  imports: [RouterLink],
  selector: 'app-news-detail',
  styleUrl: './news-detail.css',
  templateUrl: './news-detail.html',
})
export class NewsDetail {
  readonly news = inject(NewsService);
  private readonly router = inject(Router);
  readonly post = computed(() => this.news.getPost(this.router.url.split('/').pop() || ''));

  get contentLines(): string[] {
    const content = this.post()?.content;
    if (!content) return [];
    return content.split('\n').filter((line) => line.trim().length > 0);
  }

  back(): void {
    void this.router.navigate(['/about']);
  }
}