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
    if (!this.newMember.name.trim() || !this.newMember.role.trim() || !this.newMember.image.trim()) {
      return;
    }
    await this.team.addMember({
      name: this.newMember.name.trim(),
      role: this.newMember.role.trim(),
      bio: this.newMember.bio.trim() || undefined,
      image: this.newMember.image.trim(),
    });
    this.newMember = { name: '', role: '', bio: '', image: '' };
  }
}