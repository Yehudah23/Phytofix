import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface NewsPost {
  id: string; tag: 'Company' | 'Products' | 'Research'; title: string; excerpt: string | null;
  date: string | null; content?: string | null; image?: string | null;
  createdBy?: string; createdAt?: number;
}

const DEFAULT_POSTS: NewsPost[] = [
  {
    id: 'owsd-conference',
    tag: 'Company',
    title: 'PHYTOFIX LTD. Showcases Innovative Botanical Wellness Products at OWSD Southwest Zonal Conference',
    excerpt: 'PHYTOFIX Ltd., a Nigerian phytopharmaceutical and botanical innovation company, successfully showcased its range of botanical wellness products at the 2nd Biennial Southwest Zonal Conference of the Organization for Women in Science for the Developing World (OWSD), held at Obafemi Awolowo University from 1–4 September 2026.',
    image: '/first news.jpeg',
    date: 'Sep 4, 2026',
    content: `Ile-Ife, Osun State, Nigeria | September 2026

PHYTOFIX Ltd., a Nigerian phytopharmaceutical and botanical innovation company, successfully showcased its range of botanical wellness products at the 2nd Biennial Southwest Zonal Conference of the Organization for Women in Science for the Developing World (OWSD), held at Obafemi Awolowo University from 1–4 September 2026.

The conference, themed "Systems Thinking and Innovation: Transforming Challenges to Opportunities for National Development," brought together participants interested in scientific advancement, innovation and sustainable approaches to national development.

PHYTOFIX Ltd.'s participation provided an opportunity to introduce its botanical wellness products to conference attendees, engage with potential customers and create greater awareness of the company's commitment to translating scientific research into practical botanical solutions.

Three Products Receive Positive Market Response

The company presented three products from its growing portfolio: GLUCOFIX Herbal Capsule, PhytoGold Tea and FIX-IT Herbal Capsule. The products attracted considerable interest and recorded encouraging patronage throughout the event.

The positive response provided an important opportunity for the company to connect with consumers, showcase its product range and strengthen awareness of its brand within a science-focused environment.

PHYTOFIX Ltd. is guided by its core philosophy, "Nature. Science. Impact." The company seeks to harness Africa's rich medicinal plant biodiversity while applying scientific principles to the development of innovative, standardised and quality-driven botanical products.

Its participation at the conference reflects its interest in platforms that encourage scientific collaboration, entrepreneurship and the practical application of research to address health and wellness needs.`,
    createdAt: Date.now() - 86400000 * 40,
  },
  {
    id: 'founder-birthday-launch',
    tag: 'Company',
    title: 'Looking Ahead: Founder/CEO\'s 50th Birthday Celebration and Official Product Launch',
    excerpt: 'PHYTOFIX Ltd. is preparing for a major milestone: the 50th birthday celebration of its Founder and Chief Executive Officer, Dr Cecilia Oluwamodupe, alongside the official launch of PHYTOFIX Ltd. and its innovative wellness products on 12 December 2026.',
    image: '/second news.jpeg',
    date: 'Dec 12, 2026',
    content: `Building on this encouraging outing, PHYTOFIX Ltd. is preparing for a major milestone: the 50th birthday celebration of its Founder and Chief Executive Officer, Dr Cecilia Oluwamodupe, alongside the official launch of PHYTOFIX Ltd. and its innovative wellness products.

The event, themed "From Research to Legacy," is scheduled to hold as follows:

Date: Saturday, 12 December 2026
Time: 1:00 p.m.
Venue: Bon Hotel, Ijapo Estate, Akure, Ondo State, Nigeria.

The celebration will recognise Dr Oluwamodupe's years of professional contribution and mark an important step in the company's journey to bring research-led botanical innovations to a wider audience.

The event is expected to bring together invited guests, distinguished professionals, academics, associates and other stakeholders to celebrate the occasion and witness the company's official product launch.`,
    createdAt: Date.now() - 86400000 * 10,
  },
];

const STORAGE_KEY = 'phytofix-news-posts';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly api = inject(ApiService);
  private readonly posts = signal<NewsPost[]>(this.readAll());
  readonly allPosts = this.posts.asReadonly();
  readonly latest = computed(() => (count = 3) => this.posts().slice(0, count));
  readonly loadError = signal('');

  constructor() { void this.load(); }

  async load(): Promise<void> {
    this.loadError.set('');
    try {
      const remote = await this.api.request<NewsPost[]>('GET', '/news');
      this.posts.set(remote);
    } catch (error: unknown) {
      console.error('Unable to load news from the Laravel API.', error);
      this.loadError.set('News could not be loaded from the server. Showing saved content.');
      this.posts.set(this.readAll());
    }
  }

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