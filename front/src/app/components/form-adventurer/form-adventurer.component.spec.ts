import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormAdventurerComponent } from './form-adventurer.component';
import { SpecialityService } from '../../services/speciality/speciality.service';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ConsumableService } from '../../services/consumable/consumable.service';

describe('FormAdventurerComponent', () => {
  let component: FormAdventurerComponent;
  let fixture: ComponentFixture<FormAdventurerComponent>;

  let specialityServiceSpy: jasmine.SpyObj<SpecialityService>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;
  let consumableServiceSpy: jasmine.SpyObj<ConsumableService>;

  beforeEach(async () => {
    specialityServiceSpy = jasmine.createSpyObj('SpecialityService', ['getSpecialities']);
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', ['getEquipment']);
    consumableServiceSpy = jasmine.createSpyObj('ConsumableService', ['getConsumables']);

    specialityServiceSpy.getSpecialities.and.returnValue(of([{ id: 1, name: 'Guerrier' }]));
    equipmentServiceSpy.getEquipment.and.returnValue(of([{ id: 10, name: 'Épée' }]));
    consumableServiceSpy.getConsumables.and.returnValue(of([{ id: 20, name: 'Potion' }]));

    await TestBed.configureTestingModule({
      imports: [FormAdventurerComponent],
      providers: [
        { provide: SpecialityService, useValue: specialityServiceSpy },
        { provide: EquipmentService, useValue: equipmentServiceSpy },
        { provide: ConsumableService, useValue: consumableServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormAdventurerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load data from services on init', () => {
    fixture.detectChanges();

    expect(specialityServiceSpy.getSpecialities).toHaveBeenCalled();
    expect(equipmentServiceSpy.getEquipment).toHaveBeenCalled();
    expect(consumableServiceSpy.getConsumables).toHaveBeenCalled();

    expect((component as any).specialities).toEqual([{ id: 1, name: 'Guerrier' }]);
    expect((component as any).equipmentTypes).toEqual([{ id: 10, name: 'Épée' }]);
    expect((component as any).consumableTypes).toEqual([{ id: 20, name: 'Potion' }]);
  });

  it('should patch form with initialData', () => {
    component.initialData = {
      name: 'Aragorn',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
      dailyRate: 345,
    };

    fixture.detectChanges();
    (component as any).ngOnChanges({
      initialData: { currentValue: component.initialData, previousValue: null, firstChange: true, isFirstChange: () => true }
    });

    const form = (component as any).adventurerForm.value;
    expect(form.name).toBe('Aragorn');
    expect(form.specialityId).toBe(1);
    expect(form.equipmentTypeIds).toEqual([10]);
    expect(form.consumableTypeIds).toEqual([20]);
    expect(form.dailyRate).toBe(345);
  });

  it('should set dailyRate to 0 if not provided', () => {
    (component as any).adventurerForm = {
      get: (field: string) => null
    }

    const res = (component as any).getMoney();

    expect(res).toBe(0);
  });

  it('should emit formSubmitted with correct data when form is valid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');

    (component as any).adventurerForm.setValue({
      name: 'Gandalf',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
      dailyRate: 123,
    });

    (component as any).onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      name: 'Gandalf',
      specialityId: 1,
      equipmentTypeIds: [10],
      consumableTypeIds: [20],
      dailyRate: 123,
    });
  });

  it('should not emit when form is invalid', () => {
    fixture.detectChanges();

    const emitSpy = spyOn(component.formSubmitted, 'emit');
    (component as any).adventurerForm.get('name')?.setValue(''); // champ requis vide
    (component as any).onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should set and get money correctly', () => {
    fixture.detectChanges();

    (component as any).setMoney(250);
    expect((component as any).getMoney()).toBe(250);
  });
});
