import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Quest } from '../../models/models';
import { QuestService } from '../../services/quest/quest.service';
import { ItemQuest } from '../../components/item-quest/item-quest';

@Component({
  selector: 'app-list-quest',
  standalone: true,
  imports: [CommonModule, ItemQuest, RouterLink],
  templateUrl: './list-quest.html',
  styleUrls: ['./list-quest.scss']
})
export class ListQuest implements OnInit {
  quests: Quest[] = [];

  constructor(
    private readonly questService: QuestService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.questService.getAllQuests().subscribe({
      next: (quests) => (this.quests = quests),
      error: (err) => console.error('Erreur lors du chargement des quêtes', err),
    });
  }

  onQuestClick(questId: number): void {
    this.router.navigate(['/quest', questId]);
  }
}
