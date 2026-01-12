import { TestBed } from '@angular/core/testing';
import { ConsumableService } from './consumable.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConsumableType } from '../../models/models';

describe('ConsumableService', () => {
  let service: ConsumableService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConsumableService],
    });

    service = TestBed.inject(ConsumableService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête ne reste ouverte
  });

  it('should fetch consumable types', () => {
    const mockTypes: ConsumableType[] = [
      { id: 1, name: 'Potion' },
      { id: 2, name: 'Elixir' }
    ];

    service.getConsumableTypes().subscribe(types => {
      expect(types.length).toBe(2);
      expect(types).toEqual(mockTypes);
    });

    const req = httpMock.expectOne('/api/consumable-types');
    expect(req.request.method).toBe('GET');
    req.flush(mockTypes);
  });

  it('should add a consumable type', () => {
    const newType: ConsumableType = { id: 3, name: 'Scroll' };

    service.addConsumableType('Scroll').subscribe(type => {
      expect(type).toEqual(newType);
    });

    const req = httpMock.expectOne('/api/consumable-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Scroll' });
    req.flush(newType);
  });

  it('should create a consumable', () => {
    const data = { name: 'Health Potion', consumableTypeId: 1, cost: 50, quantity: 10 };
    const response = { id: 1, ...data };

    service.createConsumable(data).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne('/api/consumables');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(response);
  });

  it('should update a consumable', () => {
    const id = 1;
    const data = { name: 'Super Health Potion', cost: 75 };

    service.updateConsumable(data, id).subscribe(res => {
      expect(res).toEqual(data);
    });

    const req = httpMock.expectOne(`/api/consumables/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(data);
    req.flush(data);
  });

  it('should delete a consumable', () => {
    const id = 1;

    service.deleteConsumable(id).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`/api/consumables/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get all consumables', () => {
    const consumables = [
      { id: 1, name: 'Health Potion' },
      { id: 2, name: 'Mana Potion' }
    ];

    service.getAllConsumables().subscribe(data => {
      expect(data).toEqual(consumables);
    });

    const req = httpMock.expectOne('/api/consumables');
    expect(req.request.method).toBe('GET');
    req.flush(consumables);
  });

  it('should get consumable by id', () => {
    const id = 1;
    const consumable = { id, name: 'Health Potion' };

    service.getConsumableById(id).subscribe(data => {
      expect(data).toEqual(consumable);
    });

    const req = httpMock.expectOne(`/api/consumables/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(consumable);
  });

  it('should purchase consumable', () => {
    const id = 1;
    const quantity = 5;
    const response = { success: true };

    service.purchaseConsumable(id, quantity).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`/api/consumables/${id}/purchase`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantity });
    req.flush(response);
  });
});
