import { Component, OnInit } from '@angular/core';
import { Equipment } from '../../models/models';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { Router, RouterLink } from '@angular/router';
import { ItemEquipment } from '../../components/item-equipment/item-equipment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-equipment',
  imports: [
    ItemEquipment,
    RouterLink,
  ],
  templateUrl: './list-equipment.html',
  styleUrl: './list-equipment.scss',
})
export class ListEquipment implements OnInit {
  protected equipments: Equipment[] = [];
  private cart: { [equipmentId: number]: number } = {};

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.equipmentService.getAllEquipment().subscribe((equipments) => {
      this.equipments = equipments;
    });
  }

  onQuantityChange(equipmentId: number, quantity: number): void {
    this.cart[equipmentId] = quantity;
  }

  onPurchase(): void {
    const purchaseObservable = [];
    for (const equipmentId in this.cart) {
      const quantity = this.cart[equipmentId];
      purchaseObservable.push(
        this.equipmentService.createEquipmentStock(+equipmentId, quantity)
      );
    }
    forkJoin(purchaseObservable).subscribe({
      next: () => {
        this.router.navigate(['/stock']);
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'ajout au stock:', err);
      }
    });
  }
}
