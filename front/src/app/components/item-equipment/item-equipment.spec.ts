import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemEquipment } from './item-equipment';
import { Router } from '@angular/router';
import { Equipment } from '../../models/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ItemEquipment', () => {
  let component: ItemEquipment;
  let fixture: ComponentFixture<ItemEquipment>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockEquipment: Equipment = {
    id: 1,
    name: 'Sword',
    cost: 100,
    maxDurability: 250,
    equipmentTypeId: 1,
    equipmentType: { id: 1, name: 'Weapon' }
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ItemEquipment],
      providers: [
        { provide: Router, useValue: mockRouter },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemEquipment);
    component = fixture.componentInstance;
    component.equipment = mockEquipment;
    fixture.detectChanges();
  });

  // ---------------------------------------------
  //              BASIC CREATION
  // ---------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------
  //        INPUT BINDING
  // ---------------------------------------------
  it('should receive equipment input', () => {
    expect(component.equipment).toEqual(mockEquipment);
    expect(component.equipment.name).toBe('Sword');
  });

  // ---------------------------------------------
  //        OUTPUT : quantityChange
  // ---------------------------------------------
  it('should emit quantityChange when quantity input changes', () => {
    spyOn(component.quantityChange, 'emit');

    const mockEvent = {
      target: { value: '3' }
    } as unknown as Event;

    component.onQuantityChange(mockEvent);

    expect(component.quantityChange.emit).toHaveBeenCalledWith(3);
  });

  // ---------------------------------------------
  //        OUTPUT : invalid quantity
  // ---------------------------------------------
  it('should emit NaN if quantity is invalid', () => {
    spyOn(component.quantityChange, 'emit');

    const mockEvent = {
      target: { value: 'abc' }
    } as unknown as Event;

    component.onQuantityChange(mockEvent);

    expect(component.quantityChange.emit).toHaveBeenCalledWith(NaN);
  });

  // ---------------------------------------------
  //        NAVIGATION
  // ---------------------------------------------
  it('should navigate to equipment update page on update', () => {
    component.onUpdate();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/equipment', 1]);
  });
});
