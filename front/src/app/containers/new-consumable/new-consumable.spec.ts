import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewConsumable } from './new-consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('NewConsumable', () => {
  let component: NewConsumable;
  let fixture: ComponentFixture<NewConsumable>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['createConsumable', 'purchaseConsumable']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NewConsumable],
      providers: [
        { provide: ConsumableService, useValue: consumableServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewConsumable);
    component = fixture.componentInstance;
  });

  it('should create consumable and purchase quantity then navigate on success', () => {
    const consumableData = { name: 'Potion', consumableTypeId: 1, cost: 100, quantity: 5 };
    const createdConsumable = { id: 42, ...consumableData };

    consumableServiceSpy.createConsumable.and.returnValue(of(createdConsumable));
    consumableServiceSpy.purchaseConsumable.and.returnValue(of({}));

    (component as any).onFormSubmitted(consumableData);

    expect(consumableServiceSpy.createConsumable).toHaveBeenCalledWith({ ...consumableData, quantity: 0 });
    expect(consumableServiceSpy.purchaseConsumable).toHaveBeenCalledWith(42, 5);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/consumables']);
  });

  it('should handle error on purchasing consumable and navigate to consumable detail', () => {
    const consumableData = { name: 'Potion', consumableTypeId: 1, cost: 100, quantity: 5 };
    const createdConsumable = { id: 42, ...consumableData };
    const error = new Error('Purchase error');

    consumableServiceSpy.createConsumable.and.returnValue(of(createdConsumable));
    consumableServiceSpy.purchaseConsumable.and.returnValue(throwError(() => error));

    spyOn(window, 'alert');

    (component as any).onFormSubmitted(consumableData);

    expect(consumableServiceSpy.createConsumable).toHaveBeenCalled();
    expect(consumableServiceSpy.purchaseConsumable).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Consumable created, but error purchasing quantity. Please try to purchase it again.');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/consumables/42']);
  });

  it('should handle error on creating consumable', () => {
    const consumableData = { name: 'Potion', consumableTypeId: 1, cost: 100, quantity: 5 };
    const error = new Error('Create error');

    consumableServiceSpy.createConsumable.and.returnValue(throwError(() => error));

    spyOn(console, 'error');

    (component as any).onFormSubmitted(consumableData);

    expect(consumableServiceSpy.createConsumable).toHaveBeenCalled();
    expect(consumableServiceSpy.purchaseConsumable).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error creating consumable:', error);
  });
});
