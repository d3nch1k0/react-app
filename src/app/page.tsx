"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import './globals.css';
import { authService } from './lib/auth-service';
import { supabase } from './lib/supabase';

// Импортируем стили
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
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Данные формы регистрации
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Данные для входа
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Состояния
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUser, setRegisteredUser] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Проверяем авторизацию и загружаем пользователей
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadUsers();
  }, []);

  // Загрузить всех пользователей
  const loadUsers = async () => {
  setIsLoading(true);
  try {
    // Пробуем загрузить из Supabase
    const { data: supabaseUsers } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Загружаем из localStorage
    const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    
    // Объединяем оба источника (убираем дубли по email)
    const allUsers = [...(supabaseUsers || []), ...localUsers];
    const uniqueUsers = Array.from(
      new Map(allUsers.map(user => [user.email, user])).values()
    );
    
    setUsers(uniqueUsers);
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    // Fallback на localStorage
    const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
    setUsers(localUsers);
  }
  setIsLoading(false);
};

  // Регистрация
  // Регистрация
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Валидация
  if (!name.trim() || !email.trim() || !password.trim()) {
    alert('Заполните все поля');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Пароли не совпадают');
    return;
  }
  
  if (password.length < 6) {
    alert('Пароль должен быть не менее 6 символов');
    return;
  }

  console.log('Отправка регистрации...');
  const result = await authService.register(name, email, password);
  
  // ИСПРАВЛЕННЫЙ БЛОК - result теперь просто объект пользователя
  if (result && result.name) {
    console.log('Регистрация успешна:', result);
    setRegisteredUser(result.name);
    setIsRegistered(true);
    setCurrentUser(result);
    resetForm();
    loadUsers();
    
    alert(`Добро пожаловать, ${result.name}!`);
    
    // Опционально: редирект на dashboard
    // setTimeout(() => {
    //   router.push('/dashboard');
    // }, 2000);
  } else if (result === null) {
    // authService вернул null (пользователь уже существует и т.д.)
    console.log('Регистрация не удалась (вернулся null)');
  } else {
    // result undefined или без имени
    console.error('Неожиданный результат регистрации:', result);
    alert('Ошибка регистрации. Попробуйте еще раз.');
  }
};

  // Вход
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert('Введите email и пароль');
      return;
    }

    const user = await authService.login(loginEmail, loginPassword);
    if (user) {
      setRegisteredUser(user.name);
      setIsRegistered(true);
      setCurrentUser(user);
      setLoginEmail('');
      setLoginPassword('');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  };

  // Выход
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setRegisteredUser('');
    setIsRegistered(false);
    alert('Вы вышли из системы');
  };

  // Удалить пользователя
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Удалить пользователя?')) {
      // Удаляем из нашей системы
      const success = await authService.deleteAccount(userId);
      if (success) {
        loadUsers();
        if (currentUser?.id === userId) {
          setCurrentUser(null);
        }
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLoginEmail('');
    setLoginPassword('');
  };

  // Если успешная регистрация/вход
  // Если успешная регистрация/вход
if (isRegistered && currentUser) {
  return (
    <>
      <header className="header"></header>
      <main className="main">
        <div style={successContainerStyle}>
          <div style={successCardStyle}>
            <h1 style={successTitleStyle}>🎉 Добро пожаловать, {registeredUser}!</h1>
            <p style={successTextStyle}>
              Вы успешно {showLogin ? 'вошли в систему' : 'зарегистрированы'}!
            </p>
            
            {/* УДАЛИ ЭТИ СТРОКИ ИЛИ ЗАКОММЕНТИРУЙ:
            <div style={redirectInfoStyle}>
              <div style={spinnerStyle}>⏳</div>
              <p>Перенаправление...</p>
            </div>
            */}
            
            <div style={linksContainerStyle}>
              <Link href="/blog" style={primaryLinkStyle}>
                📝 Перейти в блог
              </Link>
              <button 
                onClick={() => {
                  setIsRegistered(false);
                  setCurrentUser(null);
                  setRegisteredUser('');
                }}
                style={{
                  ...backLinkStyle,
                  background: '#6c757d',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

  return (
    <>
      <header className="header"></header>
      <main className="main">
        
        {/* Информация о текущем пользователе */}
        {currentUser && (
          <div style={{
            maxWidth: '500px',
            margin: '0 auto 30px',
            padding: '20px',
            background: '#e8f5e8',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p>Вы вошли как: <strong>{currentUser.name}</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <Link href="/dashboard" style={{
                padding: '8px 16px',
                background: '#08572f',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px'
              }}>
                Личный кабинет
              </Link>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Выйти
              </button>
            </div>
          </div>
        )}

        {/* Форма регистрации/входа */}
        <div style={formContainerStyle}>
          <h2 style={{ textAlign: 'center', color: '#08572f', marginBottom: '20px' }}>
            {showLogin ? '🔐 Вход в систему' : '📝 Регистрация'}
          </h2>
          
          {showLogin ? (
            // Форма входа
            <form onSubmit={handleLogin} style={formStyle}>
              <div style={inputGroupStyle}>
                <input
                  type="email"
                  placeholder="Ваш email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Пароль"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" style={submitButtonStyle}>
                🔐 Войти
              </button>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowLogin(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#08572f',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Нет аккаунта? Зарегистрироваться
                </button>
              </div>
            </form>
          ) : (
            // Форма регистрации
            <form onSubmit={handleRegister} style={formStyle}>
              <div style={inputGroupStyle}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={inputGroupStyle}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Пароль (минимум 6 символов)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={inputGroupStyle}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <button type="submit" style={submitButtonStyle}>
                📝 Зарегистрироваться
              </button>
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowLogin(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#08572f',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Уже есть аккаунт? Войти
                </button>
              </div>
            </form>
          )}

          {/* Быстрые ссылки */}
          <div style={existingUsersStyle}>
            <p>Быстрый доступ:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/blog" style={{
                ...dashboardLinkStyle,
                backgroundColor: '#4a6fa5'
              }}>
                📝 Блог сообщества
              </Link>
              {currentUser && (
                <Link href="/dashboard" style={dashboardLinkStyle}>
                  🎉 Личный кабинет
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Список пользователей */}
        <div style={dataContainerStyle}>
          <h2 style={{ textAlign: 'center', color: '#08572f', marginBottom: '20px' }}>
            Зарегистрированные пользователи ({users.length})
          </h2>
          
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#08572f' }}>Загрузка...</p>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#08572f' }}>Пока нет пользователей</p>
          ) : (
            <div style={usersListStyle}>
              {users.map(user => (
                <div key={user.id} style={userCardStyle}>
                  <div style={userInfoStyle}>
                    <strong style={{ color: '#08572f' }}>{user.name}</strong>
                    <span style={{ color: '#0b311f', fontSize: '14px' }}>{user.email}</span>
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </small>
                  </div>
                  {currentUser?.id !== user.id && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      style={deleteButtonStyle}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Информация о безопасности */}
        <div style={{
          maxWidth: '500px',
          margin: '40px auto',
          padding: '20px',
          background: 'rgba(8, 87, 47, 0.1)',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#08572f' }}>🛡️ Безопасность</h3>
          <p>Пароли хранятся в отдельной таблице с хэшированием</p>
          <ul style={{ textAlign: 'left', display: 'inline-block', margin: '10px 0' }}>
            <li>Хэширование паролей</li>
            <li>Использование "соли"</li>
            <li>Отдельная таблица для учетных данных</li>
            <li>Сессии через localStorage</li>
          </ul>
        </div>

      </main>
      <footer className="footer">
        🔐 Кастомная система авторизации • Supabase
      </footer>
    </>
  );
}