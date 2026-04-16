import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { MOCK_USERS } from '../mock_data/users';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;

  private isBrowser(): boolean {
    return typeof sessionStorage !== 'undefined';
  }

  constructor() {
    if (this.isBrowser()) {
      const storedUsers = sessionStorage.getItem('mockUsers');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        users.forEach((u: User) => {
          if (!MOCK_USERS.find(existing => existing.id === u.id)) {
            MOCK_USERS.push(u);
          }
        });
      }

      const stored = sessionStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
  }

  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      this.currentUser = user;
      if (this.isBrowser()) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
      return true;
    }
    return false;
  }

  register(user: User): void {
    user.id = MOCK_USERS.length + 1;
    MOCK_USERS.push(user);
    if (this.isBrowser()) {
      sessionStorage.setItem('mockUsers', JSON.stringify(MOCK_USERS));
    }
  }

  logout(): void {
    this.currentUser = null;
    if (this.isBrowser()) {
      sessionStorage.removeItem('currentUser');
    }
  }

  isLoggedIn(): boolean {
    if (this.isBrowser()) {
      return sessionStorage.getItem('currentUser') !== null;
    }
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
