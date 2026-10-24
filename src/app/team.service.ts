import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface TeamMember { id?: string; name: string; role: string; bio?: string | null; image?: string | null; }

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly api = inject(ApiService);
  readonly members = signal<TeamMember[]>([]);
  readonly adminMembers = signal<TeamMember[]>([]);
  constructor() { void this.load(); }
  async load(admin = false): Promise<void> {
    const members = await this.api.request<TeamMember[]>('GET', admin ? '/admin/team' : '/team');
    if (admin) this.adminMembers.set(members);
    else this.members.set(members);
  }
  async addMember(member: Omit<TeamMember, 'id'>): Promise<void> {
    const created = await this.api.request<TeamMember>('POST', '/admin/team', member);
    this.adminMembers.update((members) => [...members, created]);
    if (created.image) this.members.update((members) => [...members, created]);
  }
  async updateMember(id: string, updates: Partial<TeamMember>): Promise<void> {
    const updated = await this.api.request<TeamMember>('PUT', `/admin/team/${id}`, updates);
    this.adminMembers.update((members) => members.map((member) => member.id === id ? updated : member));
    this.members.update((members) => members.map((member) => member.id === id ? updated : member));
  }
  async removeMember(id: string): Promise<void> {
    await this.api.request('DELETE', `/admin/team/${id}`);
    this.adminMembers.update((members) => members.filter((member) => member.id !== id));
    this.members.update((members) => members.filter((member) => member.id !== id));
  }
}
