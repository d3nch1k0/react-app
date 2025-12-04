import { supabase } from './supabase';

export const authService = {
  async register(name: string, email: string, password: string): Promise<any | null> {
    try {
      console.log('Попытка регистрации через Supabase...');
      
      // ПРОСТОЙ ТЕСТ - можем ли мы читать из таблицы?
      const test = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      console.log('Тест подключения:', test);
      
      if (test.error) {
        console.error('Ошибка подключения к Supabase:', test.error);
        // Используем localStorage как fallback
        return this.registerLocal(name, email, password);
      }
      
      // Проверяем, нет ли уже такого email
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single();
      
      if (existingUser) {
        alert('Пользователь с таким email уже существует!');
        return null;
      }
      
      // Вставляем нового пользователя
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name: name.trim(),
            email: email.trim()
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Ошибка вставки в Supabase:', error);
        // Fallback на localStorage
        return this.registerLocal(name, email, password);
      }
      
      console.log('Пользователь создан в Supabase:', data);
      
      // Сохраняем сессию
      localStorage.setItem('currentUser', JSON.stringify({
        ...data,
        token: 'demo_token_' + Date.now()
      }));
      
      return data;
      
    } catch (err) {
      console.error('Неожиданная ошибка:', err);
      return this.registerLocal(name, email, password);
    }
  },
  
  // Регистрация в localStorage (fallback)
  async registerLocal(name: string, email: string, password: string): Promise<any | null> {
    try {
      console.log('Используем localStorage для регистрации');
      
      const userId = 'user_' + Date.now();
      const userData = {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        created_at: new Date().toISOString()
      };
      
      // Сохраняем в localStorage
      const existingUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
      
      // Проверка дубликатов
      if (existingUsers.some((u: any) => u.email === email.trim())) {
        alert('Пользователь с таким email уже существует!');
        return null;
      }
      
      existingUsers.push(userData);
      localStorage.setItem('local_users', JSON.stringify(existingUsers));
      localStorage.setItem(`user_pass_${userId}`, password.trim());
      
      // Сессия
      localStorage.setItem('currentUser', JSON.stringify({
        ...userData,
        token: 'demo_token_' + Date.now()
      }));
      
      console.log('Пользователь создан в localStorage:', userData);
      return userData;
      
    } catch (err) {
      console.error('Ошибка localStorage регистрации:', err);
      return null;
    }
  },
  
  // Вход
  async login(email: string, password: string): Promise<any | null> {
    try {
      console.log('Попытка входа...');
      
      // Сначала пробуем Supabase
      const { data: supabaseUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single();
      
      if (supabaseUser) {
        console.log('Найден в Supabase:', supabaseUser);
        localStorage.setItem('currentUser', JSON.stringify({
          ...supabaseUser,
          token: 'demo_token_' + Date.now()
        }));
        return supabaseUser;
      }
      
      // Если нет в Supabase, ищем в localStorage
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
      const localUser = localUsers.find((u: any) => u.email === email.trim());
      
      if (localUser) {
        const storedPassword = localStorage.getItem(`user_pass_${localUser.id}`);
        if (storedPassword === password.trim()) {
          localStorage.setItem('currentUser', JSON.stringify({
            ...localUser,
            token: 'demo_token_' + Date.now()
          }));
          return localUser;
        }
      }
      
      alert('Неверный email или пароль');
      return null;
      
    } catch (err) {
      console.error('Ошибка входа:', err);
      return null;
    }
  },
  
  // Остальные методы остаются как были:
  logout(): void {
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser(): any | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      return null;
    }
  },
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  },
  
  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Пробуем удалить из Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      // Удаляем из localStorage
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
      const filteredUsers = localUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('local_users', JSON.stringify(filteredUsers));
      localStorage.removeItem(`user_pass_${userId}`);
      
      // Выходим
      this.logout();
      
      return true;
    } catch (err) {
      console.error('Ошибка удаления:', err);
      return false;
    }
  }
};