import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stock } from './stock';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { of } from 'rxjs';
import { StockEquipment } from '../../models/stock-equipment';
import { Consumable } from '../../models/consumable';
import { RouterTestingModule } from '@angular/router/testing';

describe('Stock', () => {
  let component: Stock;
  let fixture: ComponentFixture<Stock>;

  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;
  let mockConsumableService: jasmine.SpyObj<ConsumableService>;

  const mockStockEquipments: StockEquipment[] = [
    { id: 1, equipmentId: 1, durability: 10, equipment: { id: 1, name: 'Sword', cost: 100, equipmentTypeId: 1, equipmentType: {id:1, name: 'Weapon'}, maxDurability: 250 } },
    { id: 2, equipmentId: 2, durability: 5, equipment: { id: 2, name: 'Shield', cost: 80, equipmentTypeId: 2, equipmentType: {id:2, name: 'Armor'}, maxDurability: 300 } }
  ];

  const mockStockConsumables: Consumable[] = [
    { id: 1, name: 'Health Potion', consumableTypeId: 1, cost: 50, quantity: 20, consumableType: {id:1, name:'Potion'} },
    { id: 2, name: 'Mana Potion', consumableTypeId: 1, cost: 60, quantity: 15, consumableType: {id:1, name:'Potion'} }
  ];

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', ['getStockEquipments']);
    mockConsumableService = jasmine.createSpyObj('ConsumableService', ['getAllConsumables']);

    mockEquipmentService.getStockEquipments.and.returnValue(of(mockStockEquipments));
    mockConsumableService.getAllConsumables.and.returnValue(of(mockStockConsumables));

    await TestBed.configureTestingModule({
      imports: [Stock, RouterTestingModule],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService },
        { provide: ConsumableService, useValue: mockConsumableService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Stock);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stockEquipments on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(mockEquipmentService.getStockEquipments).toHaveBeenCalled();
    expect(component['stockEquipments']).toEqual(mockStockEquipments);
  });

  it('should load stockConsumables on init', () => {
    fixture.detectChanges();
    expect(mockConsumableService.getAllConsumables).toHaveBeenCalled();
    expect(component['stockConsumables']).toEqual(mockStockConsumables);
  });
});
