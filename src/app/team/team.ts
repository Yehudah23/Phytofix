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
}
