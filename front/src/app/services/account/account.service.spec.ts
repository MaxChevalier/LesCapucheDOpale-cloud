import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from './account.service';
import { provideHttpClient } from '@angular/common/http';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AccountService,
      ],
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'aucune requête n’est restée en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST quest when calling signUp', () => {
    const mockUser = {
      name: 'John',
      email: 'john@example.com',
      password: 'Password1!',
      roleId: 1,
    };

    const mockResponse = { message: 'User created' };

    service.signUp(mockUser).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    // On s’attend à une requête POST vers /api/users
    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);

    // On simule une réponse du backend
    req.flush(mockResponse);
  });

  it('should handle HTTP error correctly', () => {
    const mockUser = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Password1!',
      roleId: 2,
    };

    const mockError = { status: 400, statusText: 'Bad Quest' };

    service.signUp(mockUser).subscribe({
      next: () => fail('Expected an error, but got a success response'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Quest');
      },
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(null, mockError);
  });
});
