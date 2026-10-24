import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService, TeamMember } from '../team.service';

@Component({
  imports: [CommonModule],
  selector: 'app-team',
  styleUrl: './team.css',
  templateUrl: './team.html',
})
export class Team {
  protected readonly team = inject(TeamService);

  constructor() {
    void this.team.load();
  }

  imageSrcset(image: string | null | undefined): string | null {
    if (!image?.startsWith('/team/') || !image.endsWith('.webp') || image.endsWith('-480.webp')) {
      return null;
    }

    return `${image.replace(/\.webp$/, '-480.webp')} 480w, ${image} 800w`;
  }
}
