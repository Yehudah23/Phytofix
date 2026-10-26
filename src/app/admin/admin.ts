import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { AuthService } from '../auth.service';
import { OrderService, OrderView } from '../order.service';
import { NewsService } from '../news.service';
import { formatPrice, Product } from '../catalog';
import { ProductService } from '../product.service';
import { TeamService } from '../team.service';
import type { NewsPost } from '../news.service';
import { ContactService, ContactMessage } from '../contact.service';
import { RoutineService, RoutineStep } from '../routine.service';

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
  readonly contacts = inject(ContactService);
  readonly routines = inject(RoutineService);
  readonly formatPrice = formatPrice;

  newProduct: Omit<Product, 'id'> = {
    name: '',
    type: '',
    price: 0,
    image: '',
    alt: '',
    description: '',
    featured: false,
  };
  editingProductId: string | null = null;
  productImageFile: File | null = null;
  productError = '';
  productSaving = false;
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
  contactMessages: ContactMessage[] = [];
  contactError = '';
  newRoutine = {
    userEmail: '',
    userName: '',
    name: '',
    description: '',
    totalDays: 1,
    steps: [{ day: 1, title: '', description: '', instructions: '', tips: '' }] as RoutineStep[],
  };
  routineError = '';
  routineSaving = false;

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
    void this.loadContacts();
    void this.routines.loadAdminPrescribed();
  }

  async loadContacts(): Promise<void> {
    try {
      this.contactMessages = await this.contacts.list();
      this.contactError = '';
    } catch (error: unknown) {
      console.error('Unable to load the admin contact inbox.', error);
      this.contactError = 'Contact messages could not be loaded. Check your connection and admin access.';
    }
  }

  async markContactRead(contact: ContactMessage): Promise<void> {
    try {
      await this.contacts.markRead(contact.id);
      this.contactMessages = this.contactMessages.map((item) => item.id === contact.id ? { ...item, isRead: true } : item);
    } catch (error: unknown) {
      console.error('Unable to mark a contact message as read.', error);
      this.contactError = 'The message could not be marked as read.';
    }
  }

  async deleteContact(contact: ContactMessage): Promise<void> {
    if (!confirm('Delete this contact message? This cannot be undone.')) return;
    try {
      await this.contacts.remove(contact.id);
      this.contactMessages = this.contactMessages.filter((item) => item.id !== contact.id);
    } catch (error: unknown) {
      console.error('Unable to delete a contact message.', error);
      this.contactError = 'The message could not be deleted.';
    }
  }

  addRoutineStep(): void {
    this.newRoutine.steps = [...this.newRoutine.steps, {
      day: this.newRoutine.steps.length + 1, title: '', description: '', instructions: '', tips: '',
    }];
  }

  async createPrescribedRoutine(): Promise<void> {
    this.routineError = '';
    if (!this.newRoutine.userEmail.trim() || !this.newRoutine.userName.trim() || !this.newRoutine.name.trim()
      || this.newRoutine.totalDays < 1
      || this.newRoutine.steps.some((step) => !step.title.trim() || step.day < 1 || step.day > this.newRoutine.totalDays)) {
      this.routineError = 'Enter customer details and valid steps within the routine duration.';
      return;
    }
    this.routineSaving = true;
    try {
      await this.routines.createPrescribed({
        userEmail: this.newRoutine.userEmail.trim().toLowerCase(),
        userName: this.newRoutine.userName.trim(),
        name: this.newRoutine.name.trim(),
        description: this.newRoutine.description.trim() || null,
        totalDays: this.newRoutine.totalDays,
        steps: this.newRoutine.steps.map((step) => ({
          ...step,
          title: step.title.trim(),
          description: step.description?.trim() || null,
          instructions: step.instructions?.trim() || null,
          tips: step.tips?.trim() || null,
        })),
      });
      this.newRoutine = {
        userEmail: '', userName: '', name: '', description: '', totalDays: 1,
        steps: [{ day: 1, title: '', description: '', instructions: '', tips: '' }],
      };
    } catch (error: unknown) {
      console.error('Unable to create a prescribed routine.', error);
      this.routineError = 'The prescribed routine could not be saved. Check the customer details and admin access.';
    } finally {
      this.routineSaving = false;
    }
  }

  async advance(id: string): Promise<void> {
    await this.orders.advance(id);
  }

  async addProduct(): Promise<void> {
    this.productError = '';
    if (
      !this.newProduct.name.trim() ||
      !this.newProduct.type.trim() ||
      (!this.newProduct.image.trim() && !this.productImageFile && !this.editingProductId) ||
      !Number.isFinite(this.newProduct.price) ||
      this.newProduct.price < 0
    ) {
      this.productError = 'Enter a name, category, valid non-negative price, and image path or upload.';
      return;
    }

    this.productSaving = true;
    try {
      const productData = {
        ...this.newProduct,
        name: this.newProduct.name.trim(),
        type: this.newProduct.type.trim(),
        image: this.newProduct.image.trim(),
        alt: this.newProduct.alt?.trim() || null,
        description: this.newProduct.description?.trim() || null,
      };
      if (this.editingProductId) {
        await this.productService.update(this.editingProductId, productData, this.productImageFile ?? undefined);
      } else {
        await this.productService.add(productData, this.productImageFile ?? undefined);
      }
      this.cancelProductEdit();
    } catch (error: unknown) {
      console.error('Unable to save a product through the Laravel API.', error);
      this.productError = 'Product could not be saved. Check your connection and admin access, then try again.';
    } finally {
      this.productSaving = false;
    }
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.productImageFile = null;
    this.productError = '';
    const storedImage = product.image.includes('/storage/products/') ? '' : product.image;
    this.newProduct = {
      name: product.name,
      type: product.type,
      price: product.price,
      image: storedImage,
      alt: product.alt ?? '',
      description: product.description ?? '',
      featured: product.featured ?? false,
    };
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    this.productError = '';
    this.productSaving = true;
    try {
      await this.productService.remove(product.id);
      if (this.editingProductId === product.id) this.cancelProductEdit();
    } catch (error: unknown) {
      console.error('Unable to delete a product through the Laravel API.', error);
      this.productError = 'Product could not be deleted. Check your connection and admin access, then try again.';
    } finally {
      this.productSaving = false;
    }
  }

  onProductImageSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0] ?? null;
    this.productError = '';
    if (file && (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
      this.productError = 'Choose a JPG, PNG, or WebP image no larger than 2 MB.';
      input.value = '';
      this.productImageFile = null;
      return;
    }
    this.productImageFile = file;
  }

  cancelProductEdit(): void {
    this.editingProductId = null;
    this.productImageFile = null;
    this.productError = '';
    this.newProduct = {
      name: '',
      type: '',
      price: 0,
      image: '',
      alt: '',
      description: '',
      featured: false,
    };
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