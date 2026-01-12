import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormEquipment } from './form-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { of, throwError } from 'rxjs';
import { EquipmentFormData, EquipmentType } from '../../models/models';
import { SimpleChange } from '@angular/core';

describe('FormEquipment', () => {
  let component: FormEquipment;
  let fixture: ComponentFixture<FormEquipment>;
  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;

  const mockEquipmentTypes: EquipmentType[] = [
    { id: 1, name: 'Weapon' },
    { id: 2, name: 'Armor' }
  ];

  const initialData: EquipmentFormData = {
    name: 'Sword',
    equipmentTypeId: 1,
    cost: 100,
    maxDurability: 250
  };

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'getEquipmentType',
      'addEquipmentType'
    ]);

    mockEquipmentService.getEquipmentType.and.returnValue(of(mockEquipmentTypes));
    mockEquipmentService.addEquipmentType.and.returnValue(
      of({ id: 3, name: 'Magic' })
    );

    await TestBed.configureTestingModule({
      imports: [FormEquipment],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormEquipment);
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
  it('should load equipment types on init', () => {
    expect(mockEquipmentService.getEquipmentType).toHaveBeenCalled();
    expect(component['equipmentTypes'].length).toBe(mockEquipmentTypes.length);
  });

  // ---------------------------------------------
  //        NG ON CHANGES
  // ---------------------------------------------
  it('should patch form when initialData changes', () => {
    component.initialData = initialData;

    component.ngOnChanges({
      initialData: new SimpleChange(null, initialData, true)
    });

    expect(component['equipmentForm'].value.name).toBe('Sword');
    expect(component['equipmentForm'].value.equipmentTypeId).toBe('1');
    expect(component['equipmentForm'].value.cost).toBe(100);
    expect(component['equipmentForm'].value.maxDurability).toBe(250);
  });

  // ---------------------------------------------
  //        FORM INVALID
  // ---------------------------------------------
  it('should not submit if form is invalid', () => {
    const consoleSpy = spyOn(console, 'warn');
    spyOn(component.submitForm, 'emit');

    component['equipmentForm'].reset();
    component['onSubmit']();

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.submitForm.emit).not.toHaveBeenCalled();
  });

  // ---------------------------------------------
  //        FORM VALID
  // ---------------------------------------------
  it('should emit submitForm when form is valid', () => {
    spyOn(component.submitForm, 'emit');

    component['equipmentForm'].setValue({
      name: 'Sword',
      equipmentTypeId: '1',
      cost: 120,
      maxDurability: 300,
      newTypeName: ''
    });

    component['onSubmit']();

    expect(component.submitForm.emit).toHaveBeenCalledWith({
      name: 'Sword',
      equipmentTypeId: 1,
      cost: 120,
      maxDurability: 300
    });
  });

  // ---------------------------------------------
  //        ADD NEW TYPE - EMPTY NAME
  // ---------------------------------------------
  it('should show error if new type name is empty', () => {
    component['equipmentForm'].get('newTypeName')?.setValue('   ');
    component.addNewEquipmentType();

    expect(component['newTypeError']).toBe('Le nom du type est requis.');
    expect(mockEquipmentService.addEquipmentType).not.toHaveBeenCalled();
  });

  // ---------------------------------------------
  //        ADD NEW TYPE - SUCCESS
  // ---------------------------------------------
  it('should add new equipment type successfully', () => {
    component['equipmentForm'].get('newTypeName')?.setValue('Magic');

    component.addNewEquipmentType();

    expect(mockEquipmentService.addEquipmentType).toHaveBeenCalledWith('Magic');
    expect(component['equipmentTypes'].length).toBe(3);
    expect(component['equipmentForm'].value.equipmentTypeId).toBe('3');
    expect(component['showTypePopup']).toBeFalse();
    expect(component['newTypeError']).toBe('');
  });

  // ---------------------------------------------
  //        ADD NEW TYPE - ERROR
  // ---------------------------------------------
  it('should set error message when add type fails', () => {
    mockEquipmentService.addEquipmentType.and.returnValue(
      throwError(() => new Error('Backend error'))
    );

    component['equipmentForm'].get('newTypeName')?.setValue('Magic');
    component.addNewEquipmentType();

    expect(component['newTypeError']).toContain('Erreur lors de l\'ajout du type');
  });

  // ---------------------------------------------
  //        CANCEL POPUP
  // ---------------------------------------------
  it('should cancel popup and reset fields', () => {
    component['showTypePopup'] = true;
    component['equipmentForm'].get('newTypeName')?.setValue('Temp');
    component['newTypeError'] = 'error';

    component.cancelPopup();

    expect(component['showTypePopup']).toBeFalse();
    expect(component['equipmentForm'].get('newTypeName')?.value).toBe('');
    expect(component['newTypeError']).toBe('');
  });
});
