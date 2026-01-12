import { Component, OnInit } from '@angular/core';
import { ItemStockEquipment } from '../../components/item-stock-equipment/item-stock-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { StockEquipment } from '../../models/stock-equipment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-stock',
  imports: [
    ItemStockEquipment,
    RouterLink
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
})
export class Stock implements OnInit {
  protected stockEquipments!: StockEquipment[];

  constructor(
    private readonly equipmentService: EquipmentService,
  ) {}

  ngOnInit(): void {
    this.equipmentService.getStockEquipments().subscribe((equipments) => {
      this.stockEquipments = equipments;
      console.log(this.stockEquipments);
    });
  }
}
