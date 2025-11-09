import React, { useEffect, useState } from 'react';
import { fetchPurchases, createPurchase } from '../services/dbService';
import { Purchase } from '../../models/transaction';
import { useTranslation } from 'react-i18next';

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPurchase({ ...newPurchase, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createPurchase(newPurchase);
        setNewPurchase({ itemType: '', saleDate: '', buyer: '' });
        const updatedPurchases = await fetchPurchases();
        setPurchases(updatedPurchases);
    };

    return (
        <div>
            <h1>{t('purchases.title')}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="itemType"
                    value={newPurchase.itemType}
                    onChange={handleInputChange}
                    placeholder={t('purchases.itemType')}
                    required
                />
                <input
                    type="date"
                    name="saleDate"
                    value={newPurchase.saleDate}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    name="buyer"
                    value={newPurchase.buyer}
                    onChange={handleInputChange}
                    placeholder={t('purchases.buyer')}
                    required
                />
                <button type="submit">{t('purchases.add')}</button>
            </form>
            <ul>
                {purchases.map((purchase) => (
                    <li key={purchase.id}>
                        {purchase.itemType} - {purchase.saleDate} - {purchase.buyer}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Purchases;