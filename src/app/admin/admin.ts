import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { AuthService } from '../auth.service';
import { OrderService, OrderView } from '../order.service';
import { NewsService } from '../news.service';
import { formatPrice } from '../catalog';
import { ProductService } from '../product.service';
import { TeamService } from '../team.service';
import type { NewsPost } from '../news.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  readonly auth = inject(AuthService);
  readonly adminService = inject(AdminService);
  readonly orders = inject(OrderService);
  readonly news = inject(NewsService);
  readonly team = inject(TeamService);
  readonly productService = inject(ProductService);
  readonly formatPrice = formatPrice;

  newMember = {
    name: '',
    role: '',
    bio: '',
    image: '',
  };
  teamError = '';
  teamSaving = false;
  newPost: Omit<NewsPost, 'id' | 'createdAt' | 'createdBy'> = {
    tag: 'Company',
    title: '',
    excerpt: '',
    date: '',
    content: '',
    image: '',
  };
  newsError = '';
  newsSaving = false;

  readonly stats = computed(() => {
    const all = this.orders.allViews();
    return {
      total: all.length,
      active: all.filter((o) => o.status !== 'delivered').length,
      delivered: all.filter((o) => o.status === 'delivered').length,
      revenue: all.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
    };
  });

  itemCount(order: OrderView): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  itemNames(order: OrderView): string {
    return order.items.map((i) => i.name).join(', ');
  }

  constructor() {
    void this.orders.load(true);
    void this.team.load(true);
  }

  async advance(id: string): Promise<void> {
    await this.orders.advance(id);
  }

  async addTeamMember(): Promise<void> {
    this.teamError = '';
    if (!this.newMember.name.trim() || !this.newMember.role.trim() || !this.newMember.image.trim()) {
      this.teamError = 'Enter a name, role, and image path before adding a team member.';
      return;
    }
    this.teamSaving = true;
    try {
      await this.team.addMember({
        name: this.newMember.name.trim(),
        role: this.newMember.role.trim(),
        bio: this.newMember.bio.trim() || undefined,
        image: this.newMember.image.trim(),
      });
      this.newMember = { name: '', role: '', bio: '', image: '' };
    } catch (error: unknown) {
      console.error('Unable to add a team member through the Laravel API.', error);
      this.teamError = 'Team member could not be added. Check your connection and admin access, then try again.';
    } finally {
      this.teamSaving = false;
    }
  }

  async addNewsPost(): Promise<void> {
    this.newsError = '';
    if (!this.newPost.title.trim()) {
      this.newsError = 'Enter a headline before publishing.';
      return;
    }

    this.newsSaving = true;
    try {
      await this.news.addPost({
        ...this.newPost,
        title: this.newPost.title.trim(),
        excerpt: this.newPost.excerpt?.trim() || null,
        date: this.newPost.date?.trim() || null,
        content: this.newPost.content?.trim() || null,
        image: this.newPost.image?.trim() || null,
      });
      this.newPost = { tag: 'Company', title: '', excerpt: '', date: '', content: '', image: '' };
    } catch (error: unknown) {
      console.error('Unable to publish news through the Laravel API.', error);
      this.newsError = 'News could not be published. Check your connection and admin access, then try again.';
    } finally {
      this.newsSaving = false;
    }
  }
}