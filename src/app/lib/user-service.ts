import { supabase } from '../lib/supabase';

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export const userService = {
  async register(name: string, email: string, password: string): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim()
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        alert(authError.message || 'Ошибка регистрации');
        return null;
      }

      if (!authData.user) {
        alert('Не удалось создать пользователя');
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name: name.trim(),
            email: email.trim()
          }
        ])
        .select()
        .single();

      if (userError) {
        console.error('User table error:', userError);
        await supabase.auth.admin.deleteUser(authData.user.id);
        return null;
      }

      return userData as User;
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  },

  async login(email: string, password: string): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        console.error('Login error:', authError);
        alert(authError.message || 'Неверный email или пароль');
        return null;
      }

      if (!authData.user) {
        alert('Пользователь не найден');
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Fetch user error:', userError);
        return null;
      }

      return userData as User;
    } catch (err) {
      console.error('Unexpected error:', err);
      return null;
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return userData as User;
    } catch (err) {
      console.error('Error getting current user:', err);
      return null;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data as User[];
    } catch (err) {
      console.error('Unexpected error:', err);
      return [];
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error: tableError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (tableError) {
        console.error('Error deleting from users table:', tableError);
        return false;
      }

      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) {
        console.error('Error deleting from auth:', authError);
      }

      return true;
    } catch (err) {
      console.error('Unexpected error:', err);
      return false;
    }
  },

  async checkAuth(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }
};