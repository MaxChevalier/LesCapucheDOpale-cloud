import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormConsumable } from './form-consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('FormConsumable', () => {
  let component: FormConsumable;
  let fixture: ComponentFixture<FormConsumable>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;

  const mockConsumableTypes = [
    { id: 1, name: 'Potion' },
    { id: 2, name: 'Food' }
  ];

  beforeEach(async () => {
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['getConsumableTypes', 'addConsumableType']);
    consumableServiceSpy.getConsumableTypes.and.returnValue(of(mockConsumableTypes));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormConsumable],
      providers: [
        { provide: ConsumableService, useValue: consumableServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormConsumable);
    component = fixture.componentInstance;
  });

  it('should create and load consumable types on init', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(consumableServiceSpy.getConsumableTypes).toHaveBeenCalled();
    expect(component['consumableTypes']).toEqual(mockConsumableTypes);
  });

  it('should patch form and disable quantity when initialData is set', () => {
    const initialData = {
      name: 'Health Potion',
      consumableTypeId: 1,
      cost: 100,
      quantity: 5
    };

    component.initialData = initialData;
    component.ngOnChanges({
      initialData: {
        currentValue: initialData,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component['consumableForm'].get('name')?.value).toBe(initialData.name);
    expect(component['consumableForm'].get('consumableTypeId')?.value).toBe(initialData.consumableTypeId.toString());
    expect(component['consumableForm'].get('cost')?.value).toBe(initialData.cost);
    expect(component['consumableForm'].get('quantity')?.disabled).toBeTrue();
  });

  it('should emit submitForm with correct data when form is valid', () => {
    spyOn(component.submitForm, 'emit');

    component['consumableForm'].setValue({
      name: 'Mana Potion',
      consumableTypeId: '2',
      cost: 150,
      quantity: 10,
      newTypeName: ''
    });

    (component as any).onSubmit();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      name: 'Mana Potion',
      consumableTypeId: 2,
      cost: 150,
      quantity: 10
    });
  });

  it('should not emit submitForm if form is invalid', () => {
    spyOn(component.submitForm, 'emit');

    component['consumableForm'].setValue({
      name: 'a', // too short, minLength 3
      consumableTypeId: '',
      cost: -1,
      quantity: 0,
      newTypeName: ''
    });

    (component as any).onSubmit();

    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  it('should add new consumable type and update form on success', () => {
    const newType = { id: 3, name: 'Elixir' };
    consumableServiceSpy.addConsumableType.and.returnValue(of(newType));

    component['consumableForm'].get('newTypeName')?.setValue('Elixir');
    component.addNewConsumableType();

    expect(consumableServiceSpy.addConsumableType).toHaveBeenCalledWith('Elixir');
    expect(component['consumableTypes']).toContain(newType);
    expect(component['consumableForm'].get('consumableTypeId')?.value).toBe('3');
    expect(component['showTypePopup']).toBeFalse();
    expect(component['consumableForm'].get('newTypeName')?.value).toBe('');
    expect(component['newTypeError']).toBe('');
  });

  it('should set error if new type name is empty', () => {
    component['consumableForm'].get('newTypeName')?.setValue('   ');
    component.addNewConsumableType();

    expect(component['newTypeError']).toBe('Le nom du type est requis.');
  });

  it('should handle error when adding new consumable type fails', () => {
    const error = new Error('Server error');
    consumableServiceSpy.addConsumableType.and.returnValue(throwError(() => error));

    component['consumableForm'].get('newTypeName')?.setValue('InvalidType');
    component.addNewConsumableType();

    expect(component['newTypeError']).toBe('Erreur lors de l\'ajout du type : Server error');
  });

  it('should reset popup on cancelPopup', () => {
    component['showTypePopup'] = true;
    component['consumableForm'].get('newTypeName')?.setValue('Something');
    component['newTypeError'] = 'Error';

    component.cancelPopup();

    expect(component['showTypePopup']).toBeFalse();
    expect(component['consumableForm'].get('newTypeName')?.value).toBe('');
    expect(component['newTypeError']).toBe('');
  });
});
