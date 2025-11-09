import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import TeamPanel from '../components/TeamPanel';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();

    const shortcuts = [
        {
            to: '/sales',
            title: t('dashboard.sales'),
            description: t('dashboard.salesDescription'),
            icon: 'sales' as const,
        },
        {
            to: '/purchases',
            title: t('dashboard.purchases'),
            description: t('dashboard.purchasesDescription'),
            icon: 'purchases' as const,
        },
    ];

    return (
        <div className="dashboard-page app-grid">
            <section className="dashboard-hero surface-card surface-card--glass">
                <div className="dashboard-hero__copy">
                    <span className="badge">
                        <Icon name="dashboard" size={16} />
                        {t('dashboard.title')}
                    </span>
                    <h1 className="section-heading">{t('dashboard.welcome')}</h1>
                    <p className="section-subtitle">{t('dashboard.subtitle')}</p>
                </div>
                <div className="dashboard-hero__illustration" aria-hidden="true">
                    <Icon name="file-text" size={64} />
                </div>
            </section>
            <section className="dashboard-links">
                {shortcuts.map((shortcut) => (
                    <Link key={shortcut.to} to={shortcut.to} className="dashboard-card surface-card">
                        <div className="dashboard-card__icon">
                            <Icon name={shortcut.icon} size={26} />
                        </div>
                        <div className="dashboard-card__copy">
                            <h2>{shortcut.title}</h2>
                            <p>{shortcut.description}</p>
                        </div>
                        <span className="dashboard-card__cta">{t('dashboard.open')}</span>
                    </Link>
                ))}
            </section>
            <TeamPanel />
        </div>
    );
};

export default Dashboard;
