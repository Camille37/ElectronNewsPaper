import { LoginService } from './services/login.service';
import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: LoginService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: LoginService, useValue: { isLoggedIn: jasmine.createSpy() } }
      ]
    });

    // Inject the guard and other dependencies
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(LoginService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if user is logged in', () => {
    // Mock the AuthService to simulate a logged-in user
    authService.isLogged() == true;

    expect(guard.canActivate()).toBe(true);
  });

  it('should navigate to login if user is not logged in', () => {
    spyOn(router, 'navigate');

    // Mock the AuthService to simulate a logged-out user
    authService.isLogged() == false;

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
