import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListEquipment } from './list-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Equipment } from '../../models/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ListEquipment', () => {
  let component: ListEquipment;
  let fixture: ComponentFixture<ListEquipment>;

  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockEquipments: Equipment[] = [
    { id: 1, name: 'Sword', cost: 100, equipmentTypeId: 1, equipmentType: { id: 1, name: 'Weapon' }, maxDurability: 250 },
    { id: 2, name: 'Shield', cost: 80, equipmentTypeId: 2, equipmentType: { id: 2, name: 'Armor' }, maxDurability: 300 }
  ];


  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'getAllEquipment',
      'createEquipmentStock'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockEquipmentService.getAllEquipment.and.returnValue(of(mockEquipments));

    await TestBed.configureTestingModule({
      imports: [
        ListEquipment
      ],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService },
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListEquipment);
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
  it('should load equipments on init', () => {
    expect(component['equipments'].length).toBe(2);
    expect(component['equipments'][0].name).toBe('Sword');
  });

  // ---------------------------------------------
  //        QUANTITY CHANGE
  // ---------------------------------------------
  it('should update cart when quantity changes', () => {
    component.onQuantityChange(1, 3);
    component.onQuantityChange(2, 1);

    expect((component as any).cart[1]).toBe(3);
    expect((component as any).cart[2]).toBe(1);
  });

  // ---------------------------------------------
  //        PURCHASE SUCCESS
  // ---------------------------------------------
  it('should create equipment stock for each cart item and navigate on success', () => {
    mockEquipmentService.createEquipmentStock.and.returnValue(of({}));

    component.onQuantityChange(1, 2);
    component.onQuantityChange(2, 1);

    component.onPurchase();

    expect(mockEquipmentService.createEquipmentStock).toHaveBeenCalledTimes(2);
    expect(mockEquipmentService.createEquipmentStock).toHaveBeenCalledWith(1, 2);
    expect(mockEquipmentService.createEquipmentStock).toHaveBeenCalledWith(2, 1);
  });

  // ---------------------------------------------
  //        PURCHASE ERROR
  // ---------------------------------------------
  it('should log error if purchase fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockEquipmentService.createEquipmentStock.and.returnValue(
      throwError(() => new Error('Stock error'))
    );

    component.onQuantityChange(1, 1);
    component.onPurchase();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Erreur lors de l\'ajout au stock:',
      jasmine.any(Error)
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
