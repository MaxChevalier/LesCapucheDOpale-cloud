import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemConsumable } from './item-consumable';
import { Router } from '@angular/router';
import { Consumable } from '../../models/models';
import { RouterTestingModule } from '@angular/router/testing';

describe('ItemConsumable', () => {
  let component: ItemConsumable;
  let fixture: ComponentFixture<ItemConsumable>;
  let router: Router;

  const mockConsumable: Consumable = {
    id: 42,
    name: 'Health Potion',
    consumableTypeId: 1,
    cost: 100,
    quantity: 10,
    consumableType: { id: 1, name: 'Potion' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemConsumable, RouterTestingModule],  // standalone component in imports
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(ItemConsumable);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    component.consumable = mockConsumable;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit quantityChange when onQuantityChange is called', () => {
    spyOn(component.quantityChange, 'emit');

    // Simuler un event input avec une valeur '5'
    const event = {
      target: { value: '5' }
    } as unknown as Event;

    component.onQuantityChange(event);

    expect(component.quantityChange.emit).toHaveBeenCalledWith(5);
  });

  it('should navigate to consumable detail on onUpdate', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.onUpdate();

    expect(navigateSpy).toHaveBeenCalledWith(['/consumable', mockConsumable.id]);
  });
});
