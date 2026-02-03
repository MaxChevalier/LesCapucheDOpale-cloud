import { Component, Input } from '@angular/core';
import { Consumable } from "../../models/consumable";

@Component({
  selector: 'app-item-stock-consumable',
  imports: [],
  templateUrl: './item-stock-consumable.html',
  styleUrl: './item-stock-consumable.scss',
})
export class ItemStockConsumable {
  @Input() consumable!: Consumable;
  @Input() isSelected: boolean = false;
}
