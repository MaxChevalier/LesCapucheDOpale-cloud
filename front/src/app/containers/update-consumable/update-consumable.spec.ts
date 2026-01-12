import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateConsumable } from './update-consumable';
import { ConsumableService } from '../../services/consumable/consumable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConsumableFormData } from '../../models/models';

describe('UpdateConsumable', () => {
  let component: UpdateConsumable;
  let fixture: ComponentFixture<UpdateConsumable>;

  let mockConsumableService: jasmine.SpyObj<ConsumableService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockConsumable: ConsumableFormData = {
    name: 'Health Potion',
    consumableTypeId: 1,
    cost: 50,
    quantity: 10
  };

  beforeEach(async () => {
    mockConsumableService = jasmine.createSpyObj('ConsumableService', ['getConsumableById', 'updateConsumable', 'getConsumableTypes']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')  // ID valide par défaut
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [UpdateConsumable],
      providers: [
        { provide: ConsumableService, useValue: mockConsumableService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateConsumable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load consumable on init when id is valid', () => {
    mockConsumableService.getConsumableById.and.returnValue(of(mockConsumable));
    fixture.detectChanges(); // déclenche ngOnInit

    expect(component['id']).toBe(1);
    expect(mockConsumableService.getConsumableById).toHaveBeenCalledWith(1);
    expect(component['consumable']).toEqual(mockConsumable);
  });

  it('should navigate away if id is invalid', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('invalid-id');
    fixture = TestBed.createComponent(UpdateConsumable);
    component = fixture.componentInstance;

    spyOn(console, 'error');

    fixture.detectChanges(); // ngOnInit

    expect(console.error).toHaveBeenCalledWith('Invalid consumable ID');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/consumables']);
  });

  it('should call updateConsumable and navigate on successful form submission', () => {
    mockConsumableService.updateConsumable.and.returnValue(of(mockConsumable));
    component['id'] = 1;

    (component as any).onFormSubmitted(mockConsumable);

    expect(mockConsumableService.updateConsumable).toHaveBeenCalledWith(mockConsumable, 1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/consumables']);
  });

  it('should log error if updateConsumable fails', () => {
    const error = new Error('Update failed');
    mockConsumableService.updateConsumable.and.returnValue(throwError(() => error));
    component['id'] = 1;

    spyOn(console, 'error');

    (component as any).onFormSubmitted(mockConsumable);

    expect(console.error).toHaveBeenCalledWith('Error updating consumable:', error);
  });
});
