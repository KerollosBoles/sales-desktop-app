import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPurchases, createPurchase } from '../services/dbService';
import { Purchase } from '../../models/transaction';
import Icon from '../components/Icon';
import './Purchases.css';

const Purchases: React.FC = () => {
    const { t } = useTranslation();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [newPurchase, setNewPurchase] = useState<Purchase>({
        itemType: '',
        saleDate: '',
        buyer: '',
    });

    useEffect(() => {
        const loadPurchases = async () => {
            const fetchedPurchases = await fetchPurchases();
            setPurchases(fetchedPurchases);
        };
        loadPurchases();
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewPurchase((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await createPurchase(newPurchase);
        setNewPurchase({ itemType: '', saleDate: '', buyer: '' });
        const updatedPurchases = await fetchPurchases();
        setPurchases(updatedPurchases);
    };

    return (
        <div className="purchases-page app-grid">
            <section className="surface-card surface-card--glass purchases-hero">
                <div className="purchases-hero__copy">
                    <span className="badge">
                        <Icon name="purchases" size={16} />
                        {t('purchases.title')}
                    </span>
                    <h1 className="section-heading">{t('purchases.title')}</h1>
                    <p className="section-subtitle">{t('purchases.subtitle')}</p>
                </div>
            </section>

            <section className="surface-card purchases-form-card">
                <div className="purchases-form-card__header">
                    <h2 className="section-heading">{t('purchases.recordPurchase')}</h2>
                </div>
                <form onSubmit={handleSubmit} className="purchases-form">
                    <label>
                        <span>{t('purchases.itemType')}</span>
                        <input
                            type="text"
                            name="itemType"
                            value={newPurchase.itemType}
                            onChange={handleInputChange}
                            placeholder={t('purchases.itemType')}
                            required
                        />
                    </label>
                    <label>
                        <span>{t('purchases.purchaseDate')}</span>
                        <input
                            type="date"
                            name="saleDate"
                            value={newPurchase.saleDate}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        <span>{t('purchases.buyer')}</span>
                        <input
                            type="text"
                            name="buyer"
                            value={newPurchase.buyer}
                            onChange={handleInputChange}
                            placeholder={t('purchases.buyer')}
                            required
                        />
                    </label>
                    <button type="submit" className="button button--primary">
                        <Icon name="purchases" size={16} />
                        {t('purchases.add')}
                    </button>
                </form>
            </section>

            <section className="surface-card purchases-list-card">
                <div className="purchases-form-card__header">
                    <h2 className="section-heading">{t('purchases.recent')}</h2>
                    <span className="badge">
                        <Icon name="calendar" size={16} />
                        {purchases.length}
                    </span>
                </div>
                {purchases.length === 0 ? (
                    <p className="empty-state">{t('purchases.emptyState')}</p>
                ) : (
                    <table className="purchases-table">
                        <thead>
                            <tr>
                                <th>{t('purchases.itemType')}</th>
                                <th>{t('purchases.purchaseDate')}</th>
                                <th>{t('purchases.buyer')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>{purchase.itemType}</td>
                                    <td>{purchase.saleDate}</td>
                                    <td>{purchase.buyer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default Purchases;
