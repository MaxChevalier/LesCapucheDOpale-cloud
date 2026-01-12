import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewEquipment } from './new-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EquipmentFormData } from '../../models/equipment';

describe('NewEquipment', () => {
  let component: NewEquipment;
  let fixture: ComponentFixture<NewEquipment>;

  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const formData: EquipmentFormData = {
    name: 'Sword',
    equipmentTypeId: 1,
    cost: 100,
    maxDurability: 250
  };

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'createEquipment',
      'getEquipmentType'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NewEquipment],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewEquipment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ------------------------------------
  it('should call createEquipment and navigate on success', () => {
    mockEquipmentService.createEquipment.and.returnValue(of({} as any));

    component['onSubmit'](formData);

    expect(mockEquipmentService.createEquipment).toHaveBeenCalledWith(formData);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/equipments']);
  });

  // ------------------------------------
  it('should log error when creation fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockEquipmentService.createEquipment.and.returnValue(
      throwError(() => new Error('Creation failed'))
    );

    component['onSubmit'](formData);

    expect(mockEquipmentService.createEquipment).toHaveBeenCalledWith(formData);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error creating equipment:',
      jasmine.any(Error)
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
