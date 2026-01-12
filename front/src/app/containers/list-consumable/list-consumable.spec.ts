import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListConsumable } from './list-consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { of, throwError } from 'rxjs';
import { Consumable } from '../../models/models';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('ListConsumable', () => {
  let component: ListConsumable;
  let fixture: ComponentFixture<ListConsumable>;

  let mockConsumableService: jasmine.SpyObj<ConsumableService>;
  let mockRouter: Router;

  const mockConsumables: Consumable[] = [
    { id: 1, name: 'Health Potion', consumableTypeId: 1, cost: 50, quantity: 10, consumableType: { id: 1, name: 'Potion' } },
    { id: 2, name: 'Mana Potion', consumableTypeId: 1, cost: 60, quantity: 5, consumableType: { id: 1, name: 'Potion' } }
  ];

  beforeEach(async () => {
    mockConsumableService = jasmine.createSpyObj('ConsumableService', ['getAllConsumables', 'purchaseConsumable']);
    mockConsumableService.getAllConsumables.and.returnValue(of(mockConsumables));
    mockConsumableService.purchaseConsumable.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ListConsumable, RouterTestingModule],
      providers: [
        { provide: ConsumableService, useValue: mockConsumableService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListConsumable);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    spyOn(mockRouter, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load consumables on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(mockConsumableService.getAllConsumables).toHaveBeenCalled();
    expect(component['consumables']).toEqual(mockConsumables);
  });

  it('should update cart on quantity change', () => {
    component.onQuantityChange(1, 3);
    component.onQuantityChange(2, 1);
    expect((component as any).cart[1]).toBe(3);
    expect((component as any).cart[2]).toBe(1);
  });

  it('should call purchaseConsumable for each item and navigate on success', () => {
    component.onQuantityChange(1, 2);
    component.onQuantityChange(2, 1);

    component.onPurchase();

    expect(mockConsumableService.purchaseConsumable).toHaveBeenCalledTimes(2);
    expect(mockConsumableService.purchaseConsumable).toHaveBeenCalledWith(1, 2);
    expect(mockConsumableService.purchaseConsumable).toHaveBeenCalledWith(2, 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/stock']);
  });

  it('should log error if purchase fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockConsumableService.purchaseConsumable.and.returnValue(throwError(() => new Error('Purchase error')));

    component.onQuantityChange(1, 1);
    component.onPurchase();

    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'ajout au stock:', jasmine.any(Error));
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
