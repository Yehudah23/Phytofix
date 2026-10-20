import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface TeamMember { id?: number; name: string; role: string; bio?: string | null; image?: string; }

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly api = inject(ApiService);
  readonly members = signal<TeamMember[]>([]);
  constructor() { void this.load(); }
  async load(admin = false): Promise<void> {
    this.members.set(await this.api.request<TeamMember[]>('GET', admin ? '/admin/team' : '/team'));
  }
  async addMember(member: Omit<TeamMember, 'id'>): Promise<void> {
    const created = await this.api.request<TeamMember>('POST', '/admin/team', member);
    this.members.update((members) => [...members, created]);
  }
  async removeMember(id: number): Promise<void> {
    await this.api.request('DELETE', `/admin/team/${id}`);
    this.members.update((members) => members.filter((member) => member.id !== id));
  }
}
