import { Component } from '@angular/core';
import { FormQuest } from '../../components/form-quest/form-quest';
import { QuestService } from '../../services/quest/quest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-quest',
  imports: [FormQuest],
  templateUrl: './new-quest.html',
  styleUrl: './new-quest.scss'
})
export class NewQuest {
  constructor(
    private readonly questService: QuestService,
    private readonly router: Router,
  ) {}

  protected onFormSubmitted(formValue: any): void {
    this.questService.createQuest(formValue).subscribe({
      next: () => {
        this.router.navigate(['/quests']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de la quête :', err);
        alert('Une erreur est survenue lors de la création de la quête.');
      }
    });
  }
}