import { Component, OnInit } from '@angular/core';
import { Consumable } from '../../models/models';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { Router, RouterLink } from '@angular/router';
import { ItemConsumable } from '../../components/item-consumable/item-consumable';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-consumable',
  imports: [
    ItemConsumable,
    RouterLink,
  ],
  templateUrl: './list-consumable.html',
  styleUrl: './list-consumable.scss',
})
export class ListConsumable implements OnInit {
  protected consumables: Consumable[] = [];
  private cart: { [consumableId: number]: number } = {};

  constructor(
    private readonly consumableService: ConsumableService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.consumableService.getAllConsumables().subscribe((consumables) => {
      this.consumables = consumables;
    });
  }

  onQuantityChange(consumableId: number, quantity: any): void {
    this.cart[consumableId] = quantity;
  }

  onPurchase(): void {
    const purchaseObservables = [];
    for (const consumableId in this.cart) {
      const quantity = this.cart[consumableId];
      purchaseObservables.push(
        this.consumableService.purchaseConsumable(+consumableId, quantity)
      );
    }
    forkJoin(purchaseObservables).subscribe({
      next: () => {
        this.router.navigate(['/stock']);
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout au stock:', err);
      }
    });
  }
}
