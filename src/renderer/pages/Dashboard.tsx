import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="dashboard">
            <h1>{t('dashboard.title')}</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/sales">{t('dashboard.sales')}</Link>
                    </li>
                    <li>
                        <Link to="/purchases">{t('dashboard.purchases')}</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Dashboard;