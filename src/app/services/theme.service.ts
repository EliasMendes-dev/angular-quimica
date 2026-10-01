import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('tema');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'escuro' : prefersDark;
    this.setDarkMode(isDark);
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  private setDarkMode(dark: boolean): void {
    this.isDarkMode.set(dark);
    if (dark) {
      document.body.classList.add('escuro');
      localStorage.setItem('tema', 'escuro');
    } else {
      document.body.classList.remove('escuro');
      localStorage.setItem('tema', 'claro');
    }
  }
}
