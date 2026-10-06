import { Injectable } from '@angular/core';

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  readonly members: TeamMember[] = [
    { name: 'Dr. Cecilia Oluwamodupe', role: 'Founder/CEO' },
    { name: 'Mercy Adelabu', role: 'Product Manager' },
    { name: 'Chris Balogun', role: 'Technical Supervisor', },
    { name: 'Clement Raji', role: 'Visual Communication Specialist' },
    { name: 'Judah King', role: 'Media Team Head' },
  ];
}
