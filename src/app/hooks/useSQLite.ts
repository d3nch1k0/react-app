"use client";

import { useState, useEffect, useCallback } from 'react';

export interface User {
id: number;
name: string;
email: string;
}

export const useSQLite = () => {
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Загрузка данных из localStorage при инициализации
useEffect(() => {
    const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem('sqlite_users');
        if (stored) {
        setUsers(JSON.parse(stored));
        } else {
        // Начальные данные
        const initialUsers: User[] = [
            { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
            { id: 2, name: 'Мария Сидорова', email: 'maria@example.com' }
        ];
        setUsers(initialUsers);
        localStorage.setItem('sqlite_users', JSON.stringify(initialUsers));
        }
    } catch (error) {
        console.error('Error loading users:', error);
    } finally {
        setIsLoading(false);
    }
    };

    loadFromStorage();
}, []);

// Сохранение в localStorage
const saveToStorage = useCallback((newUsers: User[]) => {
    try {
    localStorage.setItem('sqlite_users', JSON.stringify(newUsers));
    } catch (error) {
    console.error('Error saving users:', error);
    }
}, []);

// Добавление пользователя
const addUser = useCallback((name: string, email: string) => {
    const newUser: User = {
    id: Date.now(),
    name,
    email
    };
    
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    saveToStorage(newUsers);
}, [users, saveToStorage]);

// Удаление пользователя
const deleteUser = useCallback((id: number) => {
    const newUsers = users.filter(user => user.id !== id);
    setUsers(newUsers);
    saveToStorage(newUsers);
}, [users, saveToStorage]);

return {
    users,
    isLoading,
    addUser,
    deleteUser
};
};