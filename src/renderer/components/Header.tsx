import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlobalSearch from './GlobalSearch';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const [searchOpen, setSearchOpen] = useState(false);
    const { user, logout } = useAuth();

    const toggleSearch = () => setSearchOpen(true);
    const closeSearch = () => setSearchOpen(false);

    const navItems = useMemo(
        () => [
            { to: '/dashboard', label: t('nav.dashboard'), icon: 'dashboard' as const },
            { to: '/sales', label: t('nav.sales'), icon: 'sales' as const, permission: 'sales' as const },
            { to: '/purchases', label: t('nav.purchases'), icon: 'purchases' as const, permission: 'inventory' as const },
        ],
        [t]
    );

    const visibleNav = useMemo(
        () =>
            navItems.filter((item) => {
                if (item.permission === 'inventory') {
                    return Boolean(user?.canManageInventory);
                }
                return true;
            }),
        [navItems, user]
    );

    return (
        <>
            <header className="app-header surface-card surface-card--glass">
                <div className="app-header__brand">
                    <div className="app-header__logo" aria-hidden="true">
                        <Icon name="file-text" size={26} />
                    </div>
                    <div className="app-header__brand-copy">
                        <span className="app-header__brand-title">{t('app.title')}</span>
                        <span className="app-header__brand-subtitle">{t('app.subtitle')}</span>
                    </div>
                </div>
                <nav className="app-header__nav" aria-label={t('app.navigation')}>
                    {visibleNav.map((item) => (
                        <NavLink key={item.to} to={item.to} activeClassName="is-active">
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="app-header__actions">
                    <button
                        type="button"
                        className="app-header__search-button app-header__search-button--mobile"
                        onClick={toggleSearch}
                        aria-label={t('globalSearch.openButton')}
                    >
                        <Icon name="search" size={20} />
                    </button>
                    <button
                        type="button"
                        className="app-header__search-button"
                        onClick={toggleSearch}
                        aria-label={t('globalSearch.openButton')}
                    >
                        <Icon name="search" size={20} />
                        <span>{t('globalSearch.openButton')}</span>
                    </button>
                    {user && (
                        <div className="app-header__user">
                            <div className="app-header__user-icon" aria-hidden="true">
                                <Icon name="user" size={18} />
                            </div>
                            <div className="app-header__user-copy">
                                <span>{user.fullName || user.username}</span>
                                <small>{t(`roles.${user.role}`)}</small>
                            </div>
                            <button type="button" className="button button--text" onClick={() => logout()}>
                                <Icon name="logout" size={14} />
                                {t('nav.logout')}
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <GlobalSearch open={searchOpen} onClose={closeSearch} />
        </>
    );
};

export default Header;
