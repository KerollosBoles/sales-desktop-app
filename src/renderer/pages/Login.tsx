import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import './Login.css';

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const history = useHistory();
    const { t } = useTranslation();

    useEffect(() => {
        if (isAuthenticated) {
            history.replace('/dashboard');
        }
    }, [history, isAuthenticated]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await login(username, password);
            history.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'auth.genericError';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <section className="login-panel surface-card surface-card--glass">
                <header className="login-panel__header">
                    <div className="login-panel__icon" aria-hidden="true">
                        <Icon name="shield" size={28} />
                    </div>
                    <div>
                        <h1>{t('login.title')}</h1>
                        <p>{t('login.subtitle')}</p>
                    </div>
                </header>
                {error && <p className="login-panel__error">{t(error)}</p>}
                <form onSubmit={handleLogin} className="login-form">
                    <label>
                        <span>{t('login.username')}</span>
                        <div className="input-with-icon">
                            <Icon name="user" size={16} />
                            <input
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </label>
                    <label>
                        <span>{t('login.password')}</span>
                        <div className="input-with-icon">
                            <Icon name="key" size={16} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="current-password"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                className="input-with-icon__toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                            >
                                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
                            </button>
                        </div>
                    </label>
                    <div className="login-form__actions">
                        <button type="submit" className="button button--primary" disabled={isSubmitting}>
                            <Icon name="lock" size={18} />
                            {isSubmitting ? t('login.authenticating') : t('login.submit')}
                        </button>
                        <Link to="/register" className="button button--ghost">
                            <Icon name="spark" size={16} />
                            {t('login.createAccount')}
                        </Link>
                    </div>
                    <div className="login-form__meta">
                        <span>
                            <Icon name="clock" size={16} />
                            {t('login.sessionSecurity')}
                        </span>
                        <button type="button" className="button button--text">
                            <Icon name="help" size={16} />
                            {t('login.support')}
                        </button>
                    </div>
                </form>
            </section>
            <aside className="login-security surface-card">
                <h2>{t('login.securityTitle')}</h2>
                <p>{t('login.securitySubtitle')}</p>
                <ul>
                    <li>
                        <Icon name="audit" size={18} />
                        <div>
                            <span className="login-security__title">{t('login.security.audit')}</span>
                            <span className="login-security__description">{t('login.security.auditDescription')}</span>
                        </div>
                    </li>
                    <li>
                        <Icon name="shield-check" size={18} />
                        <div>
                            <span className="login-security__title">{t('login.security.roles')}</span>
                            <span className="login-security__description">{t('login.security.rolesDescription')}</span>
                        </div>
                    </li>
                    <li>
                        <Icon name="handshake" size={18} />
                        <div>
                            <span className="login-security__title">{t('login.security.team')}</span>
                            <span className="login-security__description">{t('login.security.teamDescription')}</span>
                        </div>
                    </li>
                </ul>
            </aside>
        </div>
    );
};

export default Login;
