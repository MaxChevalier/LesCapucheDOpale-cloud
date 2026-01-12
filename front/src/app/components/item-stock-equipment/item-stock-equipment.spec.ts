import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemStockEquipment } from './item-stock-equipment';

describe('ItemStockEquipment', () => {
  let component: ItemStockEquipment;
  let fixture: ComponentFixture<ItemStockEquipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemStockEquipment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemStockEquipment);
    component = fixture.componentInstance;
    component.equipment = {
      id: 1,
      durability: 100,
      equipmentId: 1,
      equipment: {
        id: 1,
        name: 'Sword',
        equipmentTypeId: 1,
        equipmentType: {
          id: 1,
          name: 'Weapon'
        },
        cost: 1500,
        maxDurability: 100
      }
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
