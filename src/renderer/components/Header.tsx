import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const { t } = useTranslation();

    return (
        <header>
            <h1>{t('app.title')}</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/dashboard">{t('nav.dashboard')}</Link>
                    </li>
                    <li>
                        <Link to="/sales">{t('nav.sales')}</Link>
                    </li>
                    <li>
                        <Link to="/purchases">{t('nav.purchases')}</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;