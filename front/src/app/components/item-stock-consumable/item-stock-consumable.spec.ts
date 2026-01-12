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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
