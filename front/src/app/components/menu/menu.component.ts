import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-menu',
  imports: [
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  open = false;

  constructor(
    private readonly router: Router
  ){}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get username(): string | null {
    return localStorage.getItem('username');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}