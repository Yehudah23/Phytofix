import { inject, Injectable, signal, computed } from '@angular/core';
import { AdminService } from './admin.service';

export interface NewsPost {
  id: string;
  tag: 'Company' | 'Products' | 'Research';
  title: string;
  excerpt: string;
  date: string;
  content?: string;
  createdBy?: string;
  createdAt?: number;
}

const DEFAULT_POSTS: NewsPost[] = [
  {
    id: 'phytofix-labs',
    tag: 'Company',
    title: 'Phytofix opens its botanical research lab in Lagos',
    excerpt: 'Our new facility expands phytochemistry and product development capacity for standardized botanical wellness solutions.',
    date: 'Sep 28, 2026',
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'glucofix-batch',
    tag: 'Products',
    title: 'Glucofix Herbal Capsule: new batch now shipping',
    excerpt: 'The latest Glucofix batch completed third-party quality screening and is now available for your routine.',
    date: 'Sep 14, 2026',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'phytogold-infusion',
    tag: 'Products',
    title: 'PhytoGold Tea: a ritual for everyday vitality',
    excerpt: 'A scientifically formulated herbal infusion crafted from medicinal plants grown on sustainable Nigerian farms.',
    date: 'Aug 30, 2026',
    createdAt: Date.now() - 86400000 * 35,
  },
  {
    id: 'biodiversity',
    tag: 'Research',
    title: 'From discovery to impact: Africa\'s botanical biodiversity',
    excerpt: 'How we combine indigenous plant knowledge with rigorous modern science to create market-ready wellness products.',
    date: 'Aug 12, 2026',
    createdAt: Date.now() - 86400000 * 50,
  },
];

const STORAGE_KEY = 'phytofix-news-posts';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly admin = inject(AdminService);
  private readonly posts = signal<NewsPost[]>(this.readAll());

  readonly allPosts = this.posts.asReadonly();

  readonly latest = computed(() => {
    const sorted = [...this.posts()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return (count = 3) => sorted.slice(0, count);
  });

  getPost(id: string): NewsPost | undefined {
    return this.posts().find((p) => p.id === id);
  }

  addPost(post: Omit<NewsPost, 'id' | 'createdAt' | 'createdBy'>): NewsPost {
    const adminUser = this.admin.isAdmin() ? 'Admin' : 'User';
    const newPost: NewsPost = {
      ...post,
      id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      createdBy: adminUser,
    };
    this.posts.update((list) => [newPost, ...list]);
    this.persist();
    return newPost;
  }

  updatePost(id: string, updates: Partial<NewsPost>): boolean {
    const index = this.posts().findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.posts.update((list) => {
      const newList = [...list];
      newList[index] = { ...newList[index], ...updates };
      return newList;
    });
    this.persist();
    return true;
  }

  deletePost(id: string): boolean {
    const index = this.posts().findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.posts.update((list) => list.filter((p) => p.id !== id));
    this.persist();
    return true;
  }

  private readAll(): NewsPost[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as NewsPost[];
      }
      return DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts()));
  }
}