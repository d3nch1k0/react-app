    "use client";

    import Link from "next/link";

    export default function Dashboard() {
    return (
        <>
        <header className="header">
            <div className="block1">
            <nav className="nav">
                <Link href="/blog" className="bottom">Лента новостей</Link>
            </nav>
            </div>
        </header>
        
        <main className="main">
            <div style={dashboardStyle}>
            <h1 style={{ color: '#08572f', textAlign: 'center', marginBottom: '30px' }}>
                🎉 Добро пожаловать в личный кабинет!
            </h1>
            
            <div style={welcomeCardStyle}>
                <h2>Личный кабинет пользователя</h2>
                <p>Вы успешно вошли в систему. Здесь вы можете управлять своим профилем.</p>
                
                <div style={featuresStyle}>
                <h3>Доступные функции:</h3>
                <ul style={featuresListStyle}>
                    <li>📊 Просмотр статистики</li>
                    <li>👤 Редактирование профиля</li>
                    <li>🔐 Настройки безопасности</li>
                    <li>📝 История активности</li>
                </ul>
                </div>
                
                <div style={actionsStyle}>
                <Link href="/" style={actionButtonSecondaryStyle}>
                    Выйти
                </Link>
                </div>
            </div>
            </div>
        </main>
        
        <footer className="footer">
            Личный кабинет пользователя
        </footer>
        </>
    );
    }

    const dashboardStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px'
    };

    const welcomeCardStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    border: '2px solid rgba(8, 87, 47, 0.3)',
    textAlign: 'center' as const
    };

    const featuresStyle = {
    margin: '30px 0',
    textAlign: 'left' as const
    };

    const featuresListStyle = {
    listStyle: 'none',
    padding: 0,
    fontSize: '16px',
    lineHeight: '2'
    };

    const actionsStyle = {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginTop: '30px'
    };

    const actionButtonStyle = {
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#08572f',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
    };

    const actionButtonSecondaryStyle = {
    display: 'inline-block',
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
    };