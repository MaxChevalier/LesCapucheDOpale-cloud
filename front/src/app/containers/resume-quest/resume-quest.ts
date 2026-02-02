import { Component, OnInit } from '@angular/core';
import { QuestService } from '../../services/quest/quest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Quest } from '../../models/quest';
import { DatePipe } from '@angular/common';
import { ItemAdventurer } from '../../components/item-adventurer/item-adventurer';
import { ItemStockEquipment } from '../../components/item-stock-equipment/item-stock-equipment';

@Component({
  selector: 'app-resume-quest',
  imports: [
    ItemAdventurer,
    ItemStockEquipment,
    DatePipe
  ],
  templateUrl: './resume-quest.html',
  styleUrl: './resume-quest.scss',
})
export class ResumeQuest implements OnInit {
  quest!: Quest;
  id!: number;
  cost: number = 0;
  successRate: number = 0;

  constructor(
    private readonly questService: QuestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) { }

  get costBreakdown() {
    return {
      po: Math.floor(this.cost / 100),
      pa: Math.floor((this.cost % 100) / 10),
      pc: this.cost % 10
    };
  }

  get rewardBreakdown() {
    return {
      po: Math.floor(this.quest.reward / 100),
      pa: Math.floor((this.quest.reward % 100) / 10),
      pc: this.quest.reward % 10
    };
  }

  ngOnInit() {
    const idStr = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || Number.isNaN(this.id)) {
      console.error('Invalid quest ID');
      this.router.navigate(['/quests']);
      return;
    }

    this.questService.getQuestById(this.id).subscribe((quest) => {
      this.quest = quest;
      if (![3,4,5,6,7].includes(quest.statusId)) {
        this.router.navigate(['/quest/', this.id]);
      }
      const totalSuccess = this.quest.adventurers.reduce((sum, rate) => sum + rate.experience, 0);
      const totalAdventurers = this.quest.adventurers.length;
      this.successRate = totalAdventurers > 0 ? Math.round((Math.min(1, totalSuccess / Math.max(1,totalAdventurers*0.8)) * 80) * 100) / 100 : 0;

      this.cost = this.quest.adventurers.reduce((sum, adv) => sum + adv.dailyRate * this.quest.estimatedDuration, 0);
    });
  }

  finish(isSuccess: boolean) {
    this.questService.finishQuest(this.id, isSuccess).subscribe(() => {
      this.router.navigate(['/quests']);
    });
  }
  }