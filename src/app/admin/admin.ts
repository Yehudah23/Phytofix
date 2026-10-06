import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../admin.service';
import { AuthService } from '../auth.service';
import { OrderService, OrderView } from '../order.service';
import { NewsService } from '../news.service';
import { PRODUCTS, formatPrice } from '../catalog';

@Component({
  imports: [CommonModule, RouterLink],
  selector: 'app-admin',
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin {
  readonly auth = inject(AuthService);
  readonly adminService = inject(AdminService);
  readonly orders = inject(OrderService);
  readonly news = inject(NewsService);
  readonly products = PRODUCTS;
  readonly formatPrice = formatPrice;

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

  advance(id: string): void {
    this.orders.advance(id);
  }
}