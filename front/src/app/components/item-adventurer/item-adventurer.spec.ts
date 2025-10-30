import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemAdventurer } from './item-adventurer';
import { Adventurer } from '../../models/adventurer';

describe('ItemAdventurer', () => {
  let component: ItemAdventurer;
  let fixture: ComponentFixture<ItemAdventurer>;

  const mockAdventurer: Adventurer = {
    id: 1,
    name: 'Aragorn',
    speciality: { id: 1, name: 'Guerrier' },
    specialityId: 1,
    equipmentTypes: [],
    equipmentTypeIds: [],
    consumableTypes: [],
    consumableTypeIds: [],
    dailyRate: 123,
    experience: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemAdventurer]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemAdventurer);
    component = fixture.componentInstance;
    component.adventurer = mockAdventurer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getEquipmentNames', () => {
    it('should return "Aucun" when equipmentTypes is empty', () => {
      const result = component.getEquipmentNames(mockAdventurer);
      expect(result).toBe('Aucun');
    });

    it('should return a comma-separated list of equipment names', () => {
      const adventurerWithEquipments: Adventurer = {
        ...mockAdventurer,
        equipmentTypes: [
          { id: 1, name: 'Épée' },
          { id: 2, name: 'Bouclier' }
        ]
      };

      const result = component.getEquipmentNames(adventurerWithEquipments);
      expect(result).toBe('Épée, Bouclier');
    });

    it('should handle undefined equipmentTypes gracefully', () => {
      const adventurerWithoutEquipments = { ...mockAdventurer, equipmentTypes: undefined as any };
      const result = component.getEquipmentNames(adventurerWithoutEquipments);
      expect(result).toBe('Aucun');
    });
  });

  describe('getConsumableNames', () => {
    it('should return "Aucun" when consumableTypes is empty', () => {
      const result = component.getConsumableNames(mockAdventurer);
      expect(result).toBe('Aucun');
    });

    it('should return a comma-separated list of consumable names', () => {
      const adventurerWithConsumables: Adventurer = {
        ...mockAdventurer,
        consumableTypes: [
          { id: 1, name: 'Potion de soin' },
          { id: 2, name: 'Ration de voyage' }
        ]
      };

      const result = component.getConsumableNames(adventurerWithConsumables);
      expect(result).toBe('Potion de soin, Ration de voyage');
    });

    it('should handle undefined consumableTypes gracefully', () => {
      const adventurerWithoutConsumables = { ...mockAdventurer, consumableTypes: undefined as any };
      const result = component.getConsumableNames(adventurerWithoutConsumables);
      expect(result).toBe('Aucun');
    });
  });
});
