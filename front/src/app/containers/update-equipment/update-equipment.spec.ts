import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateEquipment } from './update-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EquipmentFormData } from '../../models/models';

describe('UpdateEquipment', () => {
  let component: UpdateEquipment;
  let fixture: ComponentFixture<UpdateEquipment>;

  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;

  const mockEquipment: EquipmentFormData = {
    name: 'Sword',
    cost: 100,
    equipmentTypeId: 1,
    maxDurability: 250
  };

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', [
      'getEquipmentById',
      'createEquipment',
      'getEquipmentType' 
    ]);

    mockEquipmentService.getEquipmentById.and.returnValue(of(mockEquipment));
    mockEquipmentService.createEquipment.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [UpdateEquipment],
      providers: [
        provideRouter([]),
        { provide: EquipmentService, useValue: mockEquipmentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateEquipment);
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
  it('should load equipment on init with valid id', () => {
    expect(component.id).toBe(1);
    expect(mockEquipmentService.getEquipmentById).toHaveBeenCalledWith(1);
    expect(component['equipment']).toEqual(mockEquipment);
  });

  // ---------------------------------------------
  //        INVALID ID HANDLING
  // ---------------------------------------------
  it('should not load equipment if id is invalid', () => {
    const consoleSpy = spyOn(console, 'error');
    mockEquipmentService.getEquipmentById.calls.reset();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UpdateEquipment],
      providers: [
        provideRouter([]),
        { provide: EquipmentService, useValue: mockEquipmentService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'abc2'
              }
            }
          }
        }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(UpdateEquipment);
    fixture2.detectChanges();

    expect(consoleSpy).toHaveBeenCalledWith('Invalid adventurer ID');
    expect(mockEquipmentService.getEquipmentById).not.toHaveBeenCalled();
  });

  // ---------------------------------------------
  //        FORM SUBMIT SUCCESS
  // ---------------------------------------------
  it('should update equipment and navigate on success', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component['onFormSubmitted'](mockEquipment);

    expect(mockEquipmentService.createEquipment).toHaveBeenCalledWith(mockEquipment);
    expect(router.navigate).toHaveBeenCalledWith(['/equipments']);
  });

  // ---------------------------------------------
  //        FORM SUBMIT ERROR
  // ---------------------------------------------
  it('should log error when update fails', () => {
    const consoleSpy = spyOn(console, 'error');
    mockEquipmentService.createEquipment.and.returnValue(
      throwError(() => new Error('Update failed'))
    );

    component['onFormSubmitted'](mockEquipment);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error updating equipment:',
      jasmine.any(Error)
    );
  });
});
