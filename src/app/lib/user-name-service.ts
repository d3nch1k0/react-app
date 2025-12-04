// src/app/lib/user-name-service.ts
import { authService } from './auth-service';

export const userNameService = {
  async getCurrentUserName(): Promise<string> {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('Нет активной сессии, используем гостевой режим');
        return this.getGuestName();
      }

      // Используем имя из текущего пользователя
      if (currentUser.name) {
        return currentUser.name;
      }

      // Если нет имени, используем email
      if (currentUser.email) {
        return currentUser.email.split('@')[0];
      }

      return this.getGuestName();
      
    } catch (error) {
      console.error('Ошибка получения имени пользователя:', error);
      return this.getGuestName();
    }
  },

  getGuestName(): string {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('blog_guest_name');
      if (savedName) {
        return savedName;
      }
      
      const newName = this.generateGuestName();
      localStorage.setItem('blog_guest_name', newName);
      return newName;
    }
    return 'Гость';
  },

  generateGuestName(): string {
    const adjectives = ['Веселый', 'Серьезный', 'Любопытный', 'Творческий', 'Умный', 'Добрый', 'Странный', 'Отважный', 'Спокойный', 'Энергичный'];
    const nouns = ['Читатель', 'Писатель', 'Путешественник', 'Мыслитель', 'Исследователь', 'Наблюдатель', 'Мечтатель', 'Критик', 'Фантазер', 'Советчик'];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    
    return `${randomAdj} ${randomNoun} ${randomNum}`;
  },

  changeGuestName(newName: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog_guest_name', newName.trim());
    }
  },

  async isAuthenticated(): Promise<boolean> {
    return authService.isAuthenticated();
  }
};