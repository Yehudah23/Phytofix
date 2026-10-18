import { Injectable, signal } from '@angular/core';

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  readonly members = signal<TeamMember[]>([
    { name: 'Dr. Cecilia Oluwamodupe', role: 'Founder/CEO', image: '/dr cecilia mopelola.PNG' },
    { name: 'Mercy Adelabu', role: 'Product Manager', image: '/mercy adelabu.PNG' },
    { name: 'Chris Balogun', role: 'Technical Supervisor', image: '/chris balogun.PNG' },
    { name: 'Clement Raji', role: 'Visual Communication Specialist', image: '/clement raji.PNG' },
    { name: 'Judah King', role: 'Media Team Head', image: '/judah king.PNG' },
  ]);

  addMember(member: TeamMember): void {
    this.members.update((members) => [...members, member]);
  }

  removeMember(name: string): void {
    this.members.update((members) => members.filter((m) => m.name !== name));
  }
}
