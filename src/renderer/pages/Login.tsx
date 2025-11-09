import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../services/authService';
import Icon from '../components/Icon';
import './Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const { t } = useTranslation();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            await login(username, password);
            history.push('/dashboard');
        } catch (err) {
            setError(t('login.error'));
        }
    };

    return (
        <div className="login-page">
            <div className="login-card surface-card surface-card--glass">
                <div className="login-card__header">
                    <div className="login-card__icon" aria-hidden="true">
                        <Icon name="lock" size={28} />
                    </div>
                    <div>
                        <h1>{t('login.title')}</h1>
                        <p>{t('login.subtitle')}</p>
                    </div>
                </div>
                {error && <p className="login-card__error">{error}</p>}
                <form onSubmit={handleLogin} className="login-form">
                    <label>
                        <span>{t('login.username')}</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        <span>{t('login.password')}</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" className="button button--primary">
                        <Icon name="user" size={18} />
                        {t('login.submit')}
                    </button>
                    <button type="button" className="button button--ghost login-form__secondary">
                        <Icon name="search" size={16} />
                        {t('login.forgotPassword')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
