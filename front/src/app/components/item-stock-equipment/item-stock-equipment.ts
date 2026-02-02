import { Component, Input, OnChanges } from '@angular/core';
import { StockEquipment } from '../../models/models';

@Component({
  selector: 'app-item-stock-equipment',
  imports: [],
  templateUrl: './item-stock-equipment.html',
  styleUrl: './item-stock-equipment.scss',
})
export class ItemStockEquipment implements OnChanges{
  @Input() equipment!: StockEquipment;
  @Input() isSelected: boolean = false;

  ngOnChanges() {
    console.log('ItemStockEquipment - equipment changed:', this.equipment);
  }
}
