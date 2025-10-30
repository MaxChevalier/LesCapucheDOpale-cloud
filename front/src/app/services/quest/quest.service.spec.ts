import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuestService } from './quest.service';
import { Quest, QuestForm } from '../../models/models';
import { provideHttpClient } from '@angular/common/http';

describe('QuestService', () => {
  let service: QuestService;
  let httpMock: HttpTestingController;

  const mockQuests: Quest[] = [
    { id: 1, name: 'Quest 1', description: 'Description 1' },
    { id: 2, name: 'Quest 2', description: 'Description 2' }
  ];

  const mockQuest: Quest = { id: 1, name: 'Quest 1', description: 'Description 1' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(QuestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête HTTP n’est restée en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all quests', () => {
    service.getAllQuests().subscribe((quests) => {
      expect(quests).toEqual(mockQuests);
    });

    const req = httpMock.expectOne('/api/quests');
    expect(req.request.method).toBe('GET');
    req.flush(mockQuests);
  });

  it('should get quest by id', () => {
    const id = 1;
    service.getQuestById(id).subscribe((quest) => {
      expect(quest).toEqual(mockQuest);
    });

    const req = httpMock.expectOne(`/api/quests/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockQuest);
  });

  it('should create a quest', () => {
    const newQuest: QuestForm = { name: 'New Quest', description: 'New Desc', finalDate: '2023-12-31', estimatedDuration: 60, reward: 100 };

    service.createQuest(newQuest).subscribe((createdQuest) => {
      expect(createdQuest).toEqual(mockQuest);
    });

    const req = httpMock.expectOne('/api/quests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newQuest);
    req.flush(mockQuest);
  });

  it('should update a quest', () => {
    const id = 1;
    const updatedQuest: QuestForm = { name: 'Updated', description: 'Updated Desc', finalDate: '2023-12-31', estimatedDuration: 60, reward: 100 };

    service.updateQuest(id, updatedQuest).subscribe((result) => {
      expect(result).toEqual(mockQuest);
    });

    const req = httpMock.expectOne(`/api/quests/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedQuest);
    req.flush(mockQuest);
  });
});
