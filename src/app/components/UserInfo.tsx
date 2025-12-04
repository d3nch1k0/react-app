// src/app/components/UserInfo.tsx
"use client";

import { useState, useEffect } from 'react';
import { userNameService } from '../lib/user-name-service';
import { authService } from '../lib/auth-service';

interface UserInfoProps {
  onNameChange?: (newName: string) => void;
}

export default function UserInfo({ onNameChange }: UserInfoProps) {
  const [userName, setUserName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const authStatus = await userNameService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      if (authStatus) {
        const name = await userNameService.getCurrentUserName();
        setUserName(name);
      } else {
        const guestName = userNameService.getGuestName();
        setUserName(guestName);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации пользователя:', error);
      setUserName('Гость');
    }
    setLoading(false);
  };

  const handleChangeName = () => {
    setCustomName(userName);
    setShowNameModal(true);
  };

  const handleLogout = async () => {
    try {
      authService.logout();
      // Обновляем информацию
      await loadUserInfo();
      // Перезагружаем страницу
      window.location.reload();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const saveNewName = async () => {
    if (!customName.trim()) return;

    if (isAuthenticated) {
      // Для авторизованных пользователей можно сохранить имя
      // Пока просто меняем локально
      setUserName(customName.trim());
      if (onNameChange) onNameChange(customName.trim());
      setShowNameModal(false);
    } else {
      // Для гостей - сохраняем в localStorage
      userNameService.changeGuestName(customName);
      setUserName(customName.trim());
      if (onNameChange) onNameChange(customName.trim());
      setShowNameModal(false);
    }
  };

  const resetToRandomName = () => {
    const newName = userNameService.generateGuestName();
    userNameService.changeGuestName(newName);
    setUserName(newName);
    if (onNameChange) onNameChange(newName);
    setShowNameModal(false);
  };

  if (loading) {
    return <div className="user-info loading">Загрузка...</div>;
  }

  return (
    <>
      <div className="user-info">
        <div className="user-status">
          {isAuthenticated ? '✅' : '👤'}
        </div>
        <div className="user-details">
          <span className="user-name">{userName}</span>
          <span className="user-type">
            {isAuthenticated ? 'Авторизован' : 'Гость'}
          </span>
        </div>
        <div className="user-actions">
          <button onClick={handleChangeName} className="change-name-btn">
            Изменить имя
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-btn">
              Выйти
            </button>
          )}
        </div>
      </div>

      {showNameModal && (
        <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Изменить имя</h3>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Введите новое имя"
              className="form-input"
            />
            <div className="modal-buttons">
              <button onClick={saveNewName} className="submit-btn">
                Сохранить
              </button>
              {!isAuthenticated && (
                <button onClick={resetToRandomName} className="secondary-btn">
                  Случайное имя
                </button>
              )}
              <button 
                onClick={() => setShowNameModal(false)} 
                className="cancel-btn"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}