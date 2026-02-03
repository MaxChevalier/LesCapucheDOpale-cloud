import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemStockConsumable } from './item-stock-consumable';

describe('ItemStockConsumable', () => {
  let component: ItemStockConsumable;
  let fixture: ComponentFixture<ItemStockConsumable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemStockConsumable]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ItemStockConsumable);
    component = fixture.componentInstance;

    const typeData = { id: 1, name: 'Type de Potion' };

    const itemData = {
      id: 1,
      name: 'Potion de Test',
      price: 10,
      description: 'Test',
      damage: 0,
      consumableType: typeData,
      rarity: "Basique"
    };

    component.consumable = {
      quantity: 5,
      consumable: itemData,
      item: itemData,
      ...itemData
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
