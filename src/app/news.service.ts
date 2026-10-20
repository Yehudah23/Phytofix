import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface NewsPost {
  id: string; tag: 'Company' | 'Products' | 'Research'; title: string; excerpt: string | null;
  date: string | null; content?: string | null; createdBy?: string; createdAt?: number;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly api = inject(ApiService);
  private readonly posts = signal<NewsPost[]>([]);
  readonly allPosts = this.posts.asReadonly();
  readonly latest = computed(() => (count = 3) => this.posts().slice(0, count));

  constructor() { void this.load(); }

  async load(): Promise<void> { this.posts.set(await this.api.request<NewsPost[]>('GET', '/news')); }
  getPost(id: string): NewsPost | undefined { return this.posts().find((post) => post.id === id); }
  async addPost(post: Omit<NewsPost, 'id' | 'createdAt' | 'createdBy'>): Promise<NewsPost> {
    const created = await this.api.request<NewsPost>('POST', '/admin/news', post);
    this.posts.update((posts) => [created, ...posts]);
    return created;
  }
  async updatePost(id: string, updates: Partial<NewsPost>): Promise<void> {
    const updated = await this.api.request<NewsPost>('PUT', `/admin/news/${id}`, updates);
    this.posts.update((posts) => posts.map((post) => post.id === id ? updated : post));
  }
  async deletePost(id: string): Promise<void> {
    await this.api.request('DELETE', `/admin/news/${id}`);
    this.posts.update((posts) => posts.filter((post) => post.id !== id));
  }
}
