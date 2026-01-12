import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateEquipment } from './update-equipment';
import { EquipmentService } from '../../services/equipment/equipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EquipmentFormData } from '../../models/models';

describe('UpdateEquipment', () => {
  let component: UpdateEquipment;
  let fixture: ComponentFixture<UpdateEquipment>;

  let mockEquipmentService: jasmine.SpyObj<EquipmentService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockEquipment: EquipmentFormData = {
    name: 'Sword',
    equipmentTypeId: 1,
    cost: 100,
    maxDurability: 250
  };

  beforeEach(async () => {
    mockEquipmentService = jasmine.createSpyObj('EquipmentService', ['getEquipmentById', 'updateEquipment', 'getEquipmentType']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Par défaut, paramMap.get renvoie "1"
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [UpdateEquipment],
      providers: [
        { provide: EquipmentService, useValue: mockEquipmentService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateEquipment);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipment on init when id is valid', () => {
    mockEquipmentService.getEquipmentById.and.returnValue(of(mockEquipment));
    fixture.detectChanges(); // déclenche ngOnInit

    expect(component['id']).toBe(1);
    expect(mockEquipmentService.getEquipmentById).toHaveBeenCalledWith(1);
    expect(component['equipment']).toEqual(mockEquipment);
  });

  it('should navigate away if id is invalid', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('invalid-id');
    fixture = TestBed.createComponent(UpdateEquipment);
    component = fixture.componentInstance;

    spyOn(console, 'error');

    fixture.detectChanges(); // ngOnInit

    expect(console.error).toHaveBeenCalledWith('Invalid equipment ID');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/equipments']);
  });

  it('should call updateEquipment and navigate on successful form submission', () => {
    mockEquipmentService.updateEquipment.and.returnValue(of(mockEquipment));
    component['id'] = 1;

    (component as any).onFormSubmitted(mockEquipment);

    expect(mockEquipmentService.updateEquipment).toHaveBeenCalledWith(mockEquipment, 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/equipments']);
  });

  it('should log error if updateEquipment fails', () => {
    const error = new Error('Update failed');
    mockEquipmentService.updateEquipment.and.returnValue(throwError(() => error));
    component['id'] = 1;

    spyOn(console, 'error');

    (component as any).onFormSubmitted(mockEquipment);

    expect(console.error).toHaveBeenCalledWith('Error updating equipment:', error);
  });
});
