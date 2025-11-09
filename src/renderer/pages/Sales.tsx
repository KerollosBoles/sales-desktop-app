import React, { useState, useEffect } from 'react';
import { fetchSales, createSale } from '../services/dbService';
import { Sale } from '../../models/transaction';
import { useTranslation } from 'react-i18next';

const Sales: React.FC = () => {
    const { t } = useTranslation();
    const [sales, setSales] = useState<Sale[]>([]);
    const [itemType, setItemType] = useState('');
    const [saleDate, setSaleDate] = useState('');
    const [buyer, setBuyer] = useState('');

    useEffect(() => {
        const loadSales = async () => {
            const salesData = await fetchSales();
            setSales(salesData);
        };
        loadSales();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newSale = { itemType, saleDate, buyer };
        await createSale(newSale);
        setSales([...sales, newSale]);
        setItemType('');
        setSaleDate('');
        setBuyer('');
    };

    return (
        <div>
            <h1>{t('sales.title')}</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={t('sales.itemType')}
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder={t('sales.buyer')}
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    required
                />
                <button type="submit">{t('sales.addSale')}</button>
            </form>
            <h2>{t('sales.salesList')}</h2>
            <ul>
                {sales.map((sale, index) => (
                    <li key={index}>
                        {t('sales.itemType')}: {sale.itemType}, {t('sales.saleDate')}: {sale.saleDate}, {t('sales.buyer')}: {sale.buyer}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sales;