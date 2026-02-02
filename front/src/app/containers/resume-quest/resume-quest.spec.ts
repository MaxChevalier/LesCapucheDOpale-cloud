import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ResumeQuest } from './resume-quest';
import { QuestService } from '../../services/quest/quest.service';
import { Quest } from '../../models/quest';

describe('ResumeQuest', () => {
  let component: ResumeQuest;
  let fixture: ComponentFixture<ResumeQuest>;
  let questServiceSpy: jasmine.SpyObj<QuestService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: { snapshot: { paramMap: { get: jasmine.Spy } } };

  const mockQuest: Quest = {
    id: 1,
    name: 'Test Quest',
    description: 'A test quest description',
    finalDate: '2026-03-01',
    reward: 1234,
    statusId: 3,
    estimatedDuration: 5,
    recommendedXP: 100,
    UserId: 1,
    status: { id: 3, name: 'In Progress' },
    adventurers: [
      {
        id: 1,
        name: 'Adventurer 1',
        speciality: { id: 1, name: 'Warrior' },
        specialityId: 1,
        equipmentTypes: [],
        equipmentTypeIds: [],
        consumableTypes: [],
        consumableTypeIds: [],
        dailyRate: 100,
        experience: 50
      },
      {
        id: 2,
        name: 'Adventurer 2',
        speciality: { id: 2, name: 'Mage' },
        specialityId: 2,
        equipmentTypes: [],
        equipmentTypeIds: [],
        consumableTypes: [],
        consumableTypeIds: [],
        dailyRate: 150,
        experience: 30
      }
    ],
    questStockEquipments: []
  };

  beforeEach(async () => {
    questServiceSpy = jasmine.createSpyObj('QuestService', ['getQuestById', 'finishQuest']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    questServiceSpy.getQuestById.and.returnValue(of(mockQuest));
    questServiceSpy.finishQuest.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ResumeQuest],
      providers: [
        { provide: QuestService, useValue: questServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeQuest);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load quest and calculate cost and success rate', () => {
      fixture.detectChanges();

      expect(questServiceSpy.getQuestById).toHaveBeenCalledWith(1);
      expect(component.quest).toEqual(mockQuest);
      expect(component.id).toBe(1);
    });

    it('should navigate to /quests if id is not provided', () => {
      activatedRouteStub.snapshot.paramMap.get.and.returnValue(null);
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
    });

    it('should navigate to /quests if id is not a valid number', () => {
      activatedRouteStub.snapshot.paramMap.get.and.returnValue('abc');
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
    });

    it('should navigate to /quests if id is negative', () => {
      activatedRouteStub.snapshot.paramMap.get.and.returnValue('-5');
      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
    });

    it('should navigate to /quest/:id if status is not in [3,4,5,6,7]', () => {
      const invalidStatusQuest = { ...mockQuest, statusId: 1 };
      questServiceSpy.getQuestById.and.returnValue(of(invalidStatusQuest));

      fixture.detectChanges();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quest/', 1]);
    });

    it('should not navigate if status is in valid range (3)', () => {
      fixture.detectChanges();

      expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/quest/', 1]);
    });

    it('should calculate cost based on adventurers daily rate and estimated duration', () => {
      fixture.detectChanges();

      // (100 + 150) * 5 = 1250
      expect(component.cost).toBe(1250);
    });

    it('should calculate success rate based on adventurers experience', () => {
      fixture.detectChanges();

      // totalSuccess = 50 + 30 = 80
      // totalAdventurers = 2
      // successRate = Math.round((Math.min(1, 80 / Math.max(1, 2*0.8)) * 80) * 100) / 100
      // = Math.round((Math.min(1, 80 / 1.6) * 80) * 100) / 100
      // = Math.round((Math.min(1, 50) * 80) * 100) / 100
      // = Math.round((1 * 80) * 100) / 100
      // = 80
      expect(component.successRate).toBe(80);
    });

    it('should set successRate to 0 if no adventurers', () => {
      const questWithNoAdventurers = { ...mockQuest, adventurers: [] };
      questServiceSpy.getQuestById.and.returnValue(of(questWithNoAdventurers));

      fixture.detectChanges();

      expect(component.successRate).toBe(0);
    });

    it('should set cost to 0 if no adventurers', () => {
      const questWithNoAdventurers = { ...mockQuest, adventurers: [] };
      questServiceSpy.getQuestById.and.returnValue(of(questWithNoAdventurers));

      fixture.detectChanges();

      expect(component.cost).toBe(0);
    });
  });

  describe('costBreakdown', () => {
    it('should return correct breakdown for cost 1250', () => {
      component.cost = 1250;

      const breakdown = component.costBreakdown;

      expect(breakdown.po).toBe(12);
      expect(breakdown.pa).toBe(5);
      expect(breakdown.pc).toBe(0);
    });

    it('should return correct breakdown for cost 0', () => {
      component.cost = 0;

      const breakdown = component.costBreakdown;

      expect(breakdown.po).toBe(0);
      expect(breakdown.pa).toBe(0);
      expect(breakdown.pc).toBe(0);
    });

    it('should return correct breakdown for cost 999', () => {
      component.cost = 999;

      const breakdown = component.costBreakdown;

      expect(breakdown.po).toBe(9);
      expect(breakdown.pa).toBe(9);
      expect(breakdown.pc).toBe(9);
    });

    it('should return correct breakdown for cost 123', () => {
      component.cost = 123;

      const breakdown = component.costBreakdown;

      expect(breakdown.po).toBe(1);
      expect(breakdown.pa).toBe(2);
      expect(breakdown.pc).toBe(3);
    });
  });

  describe('rewardBreakdown', () => {
    beforeEach(() => {
      component.quest = mockQuest;
    });

    it('should return correct breakdown for reward 1234', () => {
      const breakdown = component.rewardBreakdown;

      expect(breakdown.po).toBe(12);
      expect(breakdown.pa).toBe(3);
      expect(breakdown.pc).toBe(4);
    });

    it('should return correct breakdown for reward 0', () => {
      component.quest = { ...mockQuest, reward: 0 };

      const breakdown = component.rewardBreakdown;

      expect(breakdown.po).toBe(0);
      expect(breakdown.pa).toBe(0);
      expect(breakdown.pc).toBe(0);
    });

    it('should return correct breakdown for reward 567', () => {
      component.quest = { ...mockQuest, reward: 567 };

      const breakdown = component.rewardBreakdown;

      expect(breakdown.po).toBe(5);
      expect(breakdown.pa).toBe(6);
      expect(breakdown.pc).toBe(7);
    });
  });

  describe('finish', () => {
    beforeEach(() => {
      component.id = 1;
    });

    it('should call finishQuest with isSuccess=true and navigate to /quests', () => {
      component.finish(true);

      expect(questServiceSpy.finishQuest).toHaveBeenCalledWith(1, true);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
    });

    it('should call finishQuest with isSuccess=false and navigate to /quests', () => {
      component.finish(false);

      expect(questServiceSpy.finishQuest).toHaveBeenCalledWith(1, false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/quests']);
    });
  });

  describe('valid status IDs', () => {
    [3, 4, 5, 6, 7].forEach(statusId => {
      it(`should not redirect for statusId ${statusId}`, () => {
        const questWithStatus = { ...mockQuest, statusId };
        questServiceSpy.getQuestById.and.returnValue(of(questWithStatus));

        fixture.detectChanges();

        expect(routerSpy.navigate).not.toHaveBeenCalledWith(['/quest/', 1]);
      });
    });
  });

  describe('invalid status IDs', () => {
    [1, 2, 8, 9, 10].forEach(statusId => {
      it(`should redirect to quest detail for statusId ${statusId}`, () => {
        const questWithStatus = { ...mockQuest, statusId };
        questServiceSpy.getQuestById.and.returnValue(of(questWithStatus));

        fixture.detectChanges();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/quest/', 1]);
      });
    });
  });
});
