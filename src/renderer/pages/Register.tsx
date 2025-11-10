import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { RegisterPrimaryAccountInput } from '../services/authService';
import './Register.css';

type AccountRole = RegisterPrimaryAccountInput['role'];

const Register: React.FC = () => {
    const { register: registerAccount, isAuthenticated } = useAuth();
    const history = useHistory();
    const { t } = useTranslation();

    const [form, setForm] = useState<RegisterPrimaryAccountInput>({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'owner',
        fullName: '',
        phone: '',
        companyName: '',
    });
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            history.replace('/dashboard');
        }
    }, [history, isAuthenticated]);

    const roleOptions = useMemo(
        () => [
            {
                value: 'owner' as AccountRole,
                title: t('register.roles.owner.title'),
                description: t('register.roles.owner.description'),
                icon: 'shield-check' as const,
            },
            {
                value: 'partner' as AccountRole,
                title: t('register.roles.partner.title'),
                description: t('register.roles.partner.description'),
                icon: 'handshake' as const,
            },
        ],
        [t]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRoleChange = (role: AccountRole) => {
        setForm((prev) => ({ ...prev, role }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await registerAccount(form);
            history.push('/dashboard');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'auth.genericError';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <section className="register-card surface-card surface-card--glass">
                <header className="register-card__header">
                    <div className="register-card__icon" aria-hidden="true">
                        <Icon name="spark" size={30} />
                    </div>
                    <div>
                        <h1>{t('register.title')}</h1>
                        <p>{t('register.subtitle')}</p>
                    </div>
                </header>
                <div className="register-card__roles" role="radiogroup" aria-label={t('register.roleLabel')}>
                    {roleOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={form.role === option.value}
                            onClick={() => handleRoleChange(option.value)}
                            className={`register-role ${form.role === option.value ? 'is-selected' : ''}`}
                        >
                            <span className="register-role__icon" aria-hidden="true">
                                <Icon name={option.icon} size={24} />
                            </span>
                            <span className="register-role__content">
                                <span className="register-role__title">{option.title}</span>
                                <span className="register-role__description">{option.description}</span>
                            </span>
                            <span className="register-role__check" aria-hidden="true">
                                <Icon name="check" size={16} />
                            </span>
                        </button>
                    ))}
                </div>
                {error && <div className="register-card__error">{t(error)}</div>}
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-form__grid">
                        <label>
                            <span>{t('register.fullName')}</span>
                            <input
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                placeholder={t('register.fullNamePlaceholder') || ''}
                                value={form.fullName}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            <span>{t('register.companyName')}</span>
                            <input
                                name="companyName"
                                type="text"
                                autoComplete="organization"
                                placeholder={t('register.companyPlaceholder') || ''}
                                value={form.companyName}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="register-form__grid">
                        <label>
                            <span>{t('register.phone')}</span>
                            <input
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder={t('register.phonePlaceholder') || ''}
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            <span>{t('register.username')}</span>
                            <input
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={form.username}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                    <div className="register-form__grid">
                        <label>
                            <span>{t('register.password')}</span>
                            <input
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                minLength={8}
                            />
                        </label>
                        <label>
                            <span>{t('register.confirmPassword')}</span>
                            <input
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={form.confirmPassword}
                                onChange={handleChange}
                                minLength={8}
                            />
                        </label>
                    </div>
                    <button type="submit" className="button button--primary" disabled={isSubmitting}>
                        <Icon name="spark" size={18} />
                        {isSubmitting ? t('register.submitting') : t('register.submit')}
                    </button>
                    <p className="register-form__hint">
                        <Icon name="shield" size={16} />
                        {t('register.securityHint')}
                    </p>
                </form>
                <footer className="register-card__footer">
                    <span>{t('register.haveAccount')}</span>
                    <Link to="/login" className="register-card__link">
                        <Icon name="arrow-left" size={14} />
                        {t('register.backToLogin')}
                    </Link>
                </footer>
            </section>
            <aside className="register-security surface-card">
                <h2>{t('register.securityTitle')}</h2>
                <ul>
                    <li>
                        <Icon name="lock" size={18} />
                        <div>
                            <span className="register-security__title">{t('register.security.passwords')}</span>
                            <span className="register-security__description">{t('register.security.passwordsDescription')}</span>
                        </div>
                    </li>
                    <li>
                        <Icon name="audit" size={18} />
                        <div>
                            <span className="register-security__title">{t('register.security.audit')}</span>
                            <span className="register-security__description">{t('register.security.auditDescription')}</span>
                        </div>
                    </li>
                    <li>
                        <Icon name="users" size={18} />
                        <div>
                            <span className="register-security__title">{t('register.security.team')}</span>
                            <span className="register-security__description">{t('register.security.teamDescription')}</span>
                        </div>
                    </li>
                </ul>
            </aside>
        </div>
    );
};

export default Register;
