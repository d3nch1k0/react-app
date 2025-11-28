"use client";

import Link from "next/link";
import { useState } from "react";
import { useSQLite } from "./hooks/useSQLite";
import { useRouter } from "next/navigation";
import './globals.css';

// Импортируем стили из отдельного файла
import {
  successContainerStyle,
  successCardStyle,
  successTitleStyle,
  successTextStyle,
  successSubTextStyle,
  redirectInfoStyle,
  spinnerStyle,
  linksContainerStyle,
  primaryLinkStyle,
  backLinkStyle,
  dashboardLinkStyle,
  formContainerStyle,
  formStyle,
  inputGroupStyle,
  inputStyle,
  submitButtonStyle,
  existingUsersStyle,
  dataContainerStyle,
  usersListStyle,
  userCardStyle,
  userInfoStyle,
  deleteButtonStyle
} from './styles';

export default function Home() {
  const { users, isLoading, addUser, deleteUser } = useSQLite();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      addUser(name, email);
      setRegisteredUser(name);
      setIsRegistered(true);
      setName('');
      setEmail('');
      
      // Автоматическое перенаправление через 2 секунды
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  // Если пользователь зарегистрирован, показываем сообщение и автоматически перенаправляем
  if (isRegistered) {
    return (
      <>
        <header className="header">
        </header>
        <main className="main">
          <div style={successContainerStyle}>
            <div style={successCardStyle}>
              <h1 style={successTitleStyle}>🎉 Регистрация успешна!</h1>
              <p style={successTextStyle}>
                Добро пожаловать, <strong>{registeredUser}</strong>!
              </p>
              <p style={successSubTextStyle}>
                Вы будете автоматически перенаправлены в личный кабинет через 2 секунды...
              </p>
              
              <div style={redirectInfoStyle}>
                <div style={spinnerStyle}>⏳</div>
                <p>Перенаправление...</p>
              </div>
              
              <div style={linksContainerStyle}>
                <Link href="/dashboard" style={primaryLinkStyle}>
                  📊 Перейти сейчас в личный кабинет
                </Link>
                <Link href="/" style={backLinkStyle}>
                  Выйти
                </Link>
              </div>
            </div>
          </div>
        </main>
        <footer className="footer">
          Регистрация завершена успешно
        </footer>
      </>
    );
  }

  // Обычная форма регистрации
  return (
    <>
      <header className="header">
      </header>
      <main className="main">
        
        {/* Форма для добавления пользователей */}
        <div style={formContainerStyle}>
          <h2 style={{ textAlign: 'center', color: '#08572f', marginBottom: '20px' }}>
            Регистрация нового пользователя
          </h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
              <input
                type="text"
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={inputGroupStyle}>
              <input
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" style={submitButtonStyle}>
              📝 Зарегистрироваться
            </button>
          </form>

          {/* Ссылка на Dashboard */}
          <div style={existingUsersStyle}>
            <p>Уже зарегистрированы?</p>
            <Link href="/dashboard" style={dashboardLinkStyle}>
              🎉 Перейти в личный кабинет
            </Link>
          </div>
        </div>

        {/* Отображение пользователей */}
        <div style={dataContainerStyle}>
          <h2 style={{ textAlign: 'center', color: '#08572f', marginBottom: '20px' }}>
            Пользователи в базе данных ({users.length})
          </h2>
          
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#08572f' }}>Загрузка данных...</p>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#08572f' }}>Нет пользователей в базе данных</p>
          ) : (
            <div style={usersListStyle}>
              {users.map(user => (
                <div key={user.id} style={userCardStyle}>
                  <div style={userInfoStyle}>
                    <strong style={{ color: '#08572f' }}>{user.name}</strong>
                    <span style={{ color: '#0b311f', fontSize: '14px' }}>{user.email}</span>
                  </div>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    style={deleteButtonStyle}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      <footer className="footer">
        Система регистрации пользователей
      </footer>
    </>
  );
}