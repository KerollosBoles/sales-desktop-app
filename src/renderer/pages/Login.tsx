import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { login } from '../services/authService';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();
    const { t } = useTranslation();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            history.push('/dashboard');
        } catch (err) {
            setError(t('login.error'));
        }
    };

    return (
        <div className="login-container">
            <h2>{t('login.title')}</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>{t('login.username')}</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>{t('login.password')}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{t('login.submit')}</button>
            </form>
        </div>
    );
};

export default Login;