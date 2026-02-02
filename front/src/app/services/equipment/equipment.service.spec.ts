import { TestBed } from '@angular/core/testing';
import { EquipmentService } from './equipment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EquipmentType } from '../../models/equipment-type';
import { EquipmentFormData, Equipment, StockEquipment } from '../../models/models';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EquipmentService]
    });

    service = TestBed.inject(EquipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // s'assure qu'aucune requête ne reste ouverte
  });

  it('should fetch equipment types', () => {
    const mockTypes: EquipmentType[] = [
      { id: 1, name: 'Weapon' },
      { id: 2, name: 'Armor' }
    ];

    service.getEquipmentType().subscribe(types => {
      expect(types).toEqual(mockTypes);
    });

    const req = httpMock.expectOne('/api/equipment-types');
    expect(req.request.method).toBe('GET');
    req.flush(mockTypes);
  });

  it('should add equipment type', () => {
    const newType: EquipmentType = { id: 3, name: 'Shield' };

    service.addEquipmentType('Shield').subscribe(type => {
      expect(type).toEqual(newType);
    });

    const req = httpMock.expectOne('/api/equipment-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Shield' });
    req.flush(newType);
  });

  it('should create equipment', () => {
    const data: EquipmentFormData = { name: 'Sword', equipmentTypeId: 1, cost: 100, maxDurability: 250 };
    const response = { ...data };

    service.createEquipment(data).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne('/api/equipment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(response);
  });

  it('should update equipment', () => {
    const id = 1;
    const data: EquipmentFormData = { name: 'Long Sword', equipmentTypeId: 1, cost: 120, maxDurability: 300 };

    service.updateEquipment(data, id).subscribe(res => {
      expect(res).toEqual(data);
    });

    const req = httpMock.expectOne(`/api/equipment/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(data);
    req.flush(data);
  });

  it('should get all equipment', () => {
    const equipments: Equipment[] = [
      { id: 1, name: 'Sword', cost: 100, equipmentTypeId: 1, equipmentType: { id: 1, name: 'Weapon' }, maxDurability: 250 },
      { id: 2, name: 'Shield', cost: 80, equipmentTypeId: 2, equipmentType: { id: 2, name: 'Armor' }, maxDurability: 300 }
    ];

    service.getAllEquipment().subscribe(data => {
      expect(data).toEqual(equipments);
    });

    const req = httpMock.expectOne('/api/equipment');
    expect(req.request.method).toBe('GET');
    req.flush(equipments);
  });

  it('should get equipment by id', () => {
    const id = 1;
    const equipment: EquipmentFormData = { name: 'Sword', equipmentTypeId: 1, cost: 100, maxDurability: 250 };

    service.getEquipmentById(id).subscribe(data => {
      expect(data).toEqual(equipment);
    });

    const req = httpMock.expectOne(`/api/equipment/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(equipment);
  });

  it('should get stock equipments', () => {
    const stockEquipments: StockEquipment[] = [
      { id: 1, equipmentId: 1, durability: 10, equipment: { id: 1, name: 'Sword', cost: 100, equipmentTypeId: 1, equipmentType: { id: 1, name: 'Weapon' }, maxDurability: 250 } }
    ];

    service.getStockEquipments().subscribe(data => {
      expect(data).toEqual(stockEquipments);
    });

    const req = httpMock.expectOne('/api/equipment-stocks');
    expect(req.request.method).toBe('GET');
    req.flush(stockEquipments);
  });

  it('should create equipment stock', () => {
    const equipmentId = 1;
    const quantity = 5;

    service.createEquipmentStock(equipmentId, quantity).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/equipment-stocks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ equipmentId, quantity });
    req.flush({});
  });

  it('should assign equipment to quest', () => {
    const questId = 1;
    const equipmentId = 2;

    service.assignEquipment(questId, equipmentId).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`/api/quests/${questId}/equipment-stocks/attach`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ ids: [equipmentId] });
    req.flush(null);
  });

  it('should unassign equipment from quest', () => {
    const questId = 1;
    const equipmentId = 2;

    service.unassignEquipment(questId, equipmentId).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`/api/quests/${questId}/equipment-stocks/detach`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ ids: [equipmentId] });
    req.flush(null);
  });
});
