import { Component, OnInit } from '@angular/core';
import { ItemStockEquipment } from '../../components/item-stock-equipment/item-stock-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { StockEquipment } from '../../models/stock-equipment';
import { RouterLink } from '@angular/router';
import { Consumable } from '../../models/consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { ItemConsumable } from '../../components/item-consumable/item-consumable';

@Component({
  selector: 'app-stock',
  imports: [
    ItemStockEquipment,
    ItemConsumable,
    RouterLink
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
})
export class Stock implements OnInit {
  protected stockEquipments!: StockEquipment[];
  protected stockConsumables!: Consumable[];

  constructor(
    private readonly equipmentService: EquipmentService,
    private readonly consumablesService: ConsumableService
  ) {}

  ngOnInit(): void {
    this.equipmentService.getStockEquipments().subscribe((equipments) => {
      this.stockEquipments = equipments;
    });

    this.consumablesService.getAllConsumables().subscribe((consumables) => {
      this.stockConsumables = consumables;
    });
  }
}
