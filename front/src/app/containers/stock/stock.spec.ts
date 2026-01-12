import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stock } from './stock';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { of } from 'rxjs';
import { StockEquipment } from '../../models/stock-equipment';
import { provideRouter } from '@angular/router';

describe('Stock', () => {
  let component: Stock;
  let fixture: ComponentFixture<Stock>;
  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;

  const mockStockEquipments: StockEquipment[] = [
    {
      id: 1,
      equipmentId: 1,
      durability: 200,
      equipment: {
        id: 1,
        name: 'Sword',
        cost: 100,
        equipmentTypeId: 1,
        equipmentType: { id: 1, name: 'Weapon' },
        maxDurability: 250
      }
    },
    {
      id: 2,
      equipmentId: 2,
      durability: 150,
      equipment: {
        id: 2,
        name: 'Shield',
        cost: 80,
        equipmentTypeId: 2,
        equipmentType: { id: 2, name: 'Armor' },
        maxDurability: 300
      }
    }
  ];

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'getStockEquipments'
    ]);

    mockEquipmentService.getStockEquipments.and.returnValue(
      of(mockStockEquipments)
    );

    await TestBed.configureTestingModule({
      imports: [Stock],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService },
        provideRouter([]) // requis à cause de RouterLink
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Stock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------
  //              BASIC CREATION
  // ---------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------
  //              INIT LOGIC
  // ---------------------------------------------
  it('should load stock equipments on init', () => {
    expect(mockEquipmentService.getStockEquipments).toHaveBeenCalled();
    expect(component['stockEquipments'].length).toBe(2);
    expect(component['stockEquipments'][0].equipment.name).toBe('Sword');
  });

  // ---------------------------------------------
  //              CONSOLE LOG
  // ---------------------------------------------
  it('should log stock equipments to console', () => {
    const consoleSpy = spyOn(console, 'log');

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith(mockStockEquipments);
  });
});
