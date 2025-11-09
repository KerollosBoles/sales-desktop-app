import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import { RegisterEmployeeInput } from '../services/authService';
import './TeamPanel.css';

const initialForm: RegisterEmployeeInput = {
    username: '',
    password: '',
    fullName: '',
    phone: '',
    canIssueInvoices: true,
};

const TeamPanel: React.FC = () => {
    const { t } = useTranslation();
    const { user, teamMembers, createEmployee, refreshTeam, activityTrail, loadSecurityTrail } = useAuth();
    const [form, setForm] = useState<RegisterEmployeeInput>(initialForm);
    const [isSubmitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canManageTeam = Boolean(user?.canManageTeam);

    useEffect(() => {
        if (canManageTeam) {
            refreshTeam();
            loadSecurityTrail();
        }
    }, [canManageTeam, refreshTeam, loadSecurityTrail]);

    const memberCount = useMemo(() => teamMembers.length, [teamMembers]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await createEmployee(form);
            setForm(initialForm);
            setSuccess('team.success');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'auth.genericError';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!canManageTeam) {
        return null;
    }

    return (
        <section className="team-panel surface-card">
            <header className="team-panel__header">
                <div className="team-panel__badge">
                    <Icon name="users" size={20} />
                    <span>{t('team.heading')}</span>
                </div>
                <div className="team-panel__stats">
                    <Icon name="spark" size={16} />
                    <span>{t('team.membersCount', { count: memberCount })}</span>
                </div>
            </header>
            <div className="team-panel__layout">
                <div className="team-panel__form-wrapper">
                    <h3>{t('team.inviteTitle')}</h3>
                    <p>{t('team.inviteSubtitle')}</p>
                    {error && <div className="team-panel__alert team-panel__alert--error">{t(error)}</div>}
                    {success && <div className="team-panel__alert team-panel__alert--success">{t(success)}</div>}
                    <form className="team-panel__form" onSubmit={handleSubmit}>
                        <label>
                            <span>{t('team.fullName')}</span>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName ?? ''}
                                onChange={handleChange}
                                placeholder={t('team.fullNamePlaceholder') || ''}
                            />
                        </label>
                        <label>
                            <span>{t('team.username')}</span>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            <span>{t('team.phone')}</span>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone ?? ''}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            <span>{t('team.password')}</span>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                            />
                        </label>
                        <button type="submit" className="button button--primary" disabled={isSubmitting}>
                            <Icon name="plus" size={16} />
                            {isSubmitting ? t('team.creating') : t('team.create')}
                        </button>
                    </form>
                    <div className="team-panel__hint">
                        <Icon name="shield" size={16} />
                        <span>{t('team.permissionHint')}</span>
                    </div>
                </div>
                <div className="team-panel__list-wrapper">
                    <h3>{t('team.membersTitle')}</h3>
                    <ul className="team-panel__list">
                        {teamMembers.map((member) => (
                            <li key={member.id} className="team-panel__list-item">
                                <div className="team-panel__avatar" aria-hidden="true">
                                    <Icon name="user" size={20} />
                                </div>
                                <div className="team-panel__member-copy">
                                    <span className="team-panel__member-name">{member.fullName || member.username}</span>
                                    <span className="team-panel__member-meta">
                                        {member.username} • {t('team.invoiceAccess')}
                                    </span>
                                </div>
                                <span className="team-panel__badge--muted">
                                    <Icon name="lock" size={14} />
                                    {t('team.restrictedInventory')}
                                </span>
                            </li>
                        ))}
                        {teamMembers.length === 0 && (
                            <li className="team-panel__empty">{t('team.empty')}</li>
                        )}
                    </ul>
                    <div className="team-panel__activity">
                        <div className="team-panel__activity-header">
                            <Icon name="audit" size={16} />
                            <span>{t('team.activityTitle')}</span>
                            <button type="button" className="icon-button" onClick={loadSecurityTrail} aria-label={t('team.refreshActivity')}>
                                <Icon name="refresh" size={16} />
                            </button>
                        </div>
                        <ul>
                            {activityTrail.length > 0 ? (
                                activityTrail.map((item) => (
                                    <li key={item.id}>
                                        <Icon name="clock" size={14} />
                                        <span>{t(`team.activity.${item.activityType}`, item.activityContext)}</span>
                                        <time>{new Date(item.createdAt).toLocaleString()}</time>
                                    </li>
                                ))
                            ) : (
                                <li className="team-panel__empty">{t('team.activityEmpty')}</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TeamPanel;
