import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalSearch from './GlobalSearch';
import './Header.css';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const [searchOpen, setSearchOpen] = useState(false);

    const toggleSearch = () => setSearchOpen(true);
    const closeSearch = () => setSearchOpen(false);

    return (
        <>
            <header className="app-header">
                <div className="app-header__brand">
                    <button
                        type="button"
                        className="app-header__search-button app-header__search-button--mobile"
                        onClick={toggleSearch}
                        aria-label={t('globalSearch.openButton')}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                                d="M21 20.3 16.7 16a7 7 0 1 0-.7.7l4.4 4.3a.5.5 0 0 0 .7-.7ZM11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    <h1>{t('app.title')}</h1>
                </div>
                <nav className="app-header__nav" aria-label={t('app.navigation')}>
                    <NavLink to="/dashboard" activeClassName="is-active">
                        {t('nav.dashboard')}
                    </NavLink>
                    <NavLink to="/sales" activeClassName="is-active">
                        {t('nav.sales')}
                    </NavLink>
                    <NavLink to="/purchases" activeClassName="is-active">
                        {t('nav.purchases')}
                    </NavLink>
                </nav>
                <button
                    type="button"
                    className="app-header__search-button"
                    onClick={toggleSearch}
                    aria-label={t('globalSearch.openButton')}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                            d="M21 20.3 16.7 16a7 7 0 1 0-.7.7l4.4 4.3a.5.5 0 0 0 .7-.7ZM11 17a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
                            fill="currentColor"
                        />
                    </svg>
                    <span>{t('globalSearch.openButton')}</span>
                </button>
            </header>
            <GlobalSearch open={searchOpen} onClose={closeSearch} />
        </>
    );
};

export default Header;
