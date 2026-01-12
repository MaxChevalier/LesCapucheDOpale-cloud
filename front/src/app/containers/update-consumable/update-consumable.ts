import { Component, OnInit } from '@angular/core';
import { FormConsumable } from '../../components/form-consumable/form-consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsumableFormData } from '../../models/models';

@Component({
  selector: 'app-update-consumable',
  imports: [
    FormConsumable,
  ],
  templateUrl: './update-consumable.html',
  styleUrl: './update-consumable.scss',
})
export class UpdateConsumable implements OnInit {
  protected consumable!: ConsumableFormData;
  id: number = 0;

  constructor(
    private readonly consumableService: ConsumableService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const idStr = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idStr ? Number(idStr) : -1;

    if (!idStr || !/^\d+$/.test(idStr) || this.id < 0 || isNaN(this.id)) {
      console.error('Invalid consumable ID');
      this.router.navigate(['/consumables']);
    }
    else {
      this.consumableService.getConsumableById(this.id).subscribe(consumable => {
        this.consumable = consumable;
      });
    }
  }

  protected onFormSubmitted(data: ConsumableFormData): void {
    this.consumableService.updateConsumable(data, this.id).subscribe({
      next: (consumable) => {
        this.router.navigate(['/consumables']);
      },
      error: (error) => {
        console.error('Error updating consumable:', error);
      }
    });
  }
}
