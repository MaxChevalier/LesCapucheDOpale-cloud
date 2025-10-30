import { Component } from '@angular/core';
import { FormAdventurerComponent } from '../../components/form-adventurer/form-adventurer.component';
import { AdventurerFormData } from '../../models/models';
import { AdventurerService } from '../../services/adventurer/adventurer.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-adventurer',
    imports: [
        FormAdventurerComponent
    ],
    templateUrl: './new-adventurer.component.html',
    styleUrl: './new-adventurer.component.scss'
})
export class NewAdventurerComponent {
  constructor(
    private readonly adventurerService: AdventurerService,
    private readonly router: Router
  ) { }

  protected onFormSubmitted(data: AdventurerFormData): void {
    this.adventurerService.createAdventurer(data).subscribe({
      next: (adventurer) => {
        this.router.navigate(['/adventurers']);
      },
      error: (error) => {
        console.error('Error creating adventurer:', error);
      }
    });
  }
}
