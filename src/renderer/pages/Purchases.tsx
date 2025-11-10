import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImporterSummary } from '../../models/importer';
import { TireSnapshot } from '../../models/tire';
import {
    getImporterCatalog,
    getTireCatalog,
    findImporterById,
    findTireById,
} from '../services/relationshipCatalog';
import Icon from '../components/Icon';
import './Purchases.css';

interface PurchaseRecord {
    id: string;
    purchaseNumber: string;
    importer: ImporterSummary;
    tire: TireSnapshot;
    purchaseDate: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
}

interface PurchaseFormState {
    importerId: string;
    tireId: string;
    purchaseDate: string;
    quantity: number;
    unitCost: number;
}

const currencyFormat = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Purchases: React.FC = () => {
    const { t } = useTranslation();
    const importerCatalog = useMemo(() => getImporterCatalog(), []);
    const tireCatalog = useMemo(() => getTireCatalog(), []);

    const seedPurchases = useMemo<PurchaseRecord[]>(
        () =>
            tireCatalog.flatMap((tire) =>
                (tire.recentPurchases ?? []).map((purchase) => ({
                    id: purchase.id,
                    purchaseNumber: purchase.purchaseNumber,
                    importer: tire.importer!,
                    tire,
                    purchaseDate: purchase.purchaseDate.slice(0, 10),
                    quantity: purchase.quantity,
                    unitCost: purchase.unitCost,
                    totalCost: purchase.quantity * purchase.unitCost,
                })),
            ),
        [tireCatalog],
    );

    const [purchases, setPurchases] = useState<PurchaseRecord[]>(seedPurchases);
    const [formState, setFormState] = useState<PurchaseFormState>({
        importerId: importerCatalog[0]?.id ?? '',
        tireId: tireCatalog[0]?.id ?? '',
        purchaseDate: new Date().toISOString().slice(0, 10),
        quantity: 10,
        unitCost: tireCatalog[0]?.recentPurchases?.[0]?.unitCost ?? 0,
    });

    const handleFormChange = <Field extends keyof PurchaseFormState>(
        field: Field,
        value: PurchaseFormState[Field],
    ) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const importer = findImporterById(formState.importerId) ?? importerCatalog.find((imp) => imp.id === formState.importerId);
        const tire = findTireById(formState.tireId) ?? tireCatalog.find((item) => item.id === formState.tireId);

        if (!importer || !tire || formState.quantity <= 0 || formState.unitCost < 0) {
            return;
        }

        const purchaseNumber = `PO-${new Date(formState.purchaseDate).getFullYear()}${String(
            Math.floor(Math.random() * 900 + 100),
        )}`;

        const record: PurchaseRecord = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            purchaseNumber,
            importer,
            tire,
            purchaseDate: formState.purchaseDate,
            quantity: formState.quantity,
            unitCost: formState.unitCost,
            totalCost: formState.quantity * formState.unitCost,
        };

        setPurchases((prev) => [record, ...prev]);
        setFormState((prev) => ({
            ...prev,
            purchaseDate: new Date().toISOString().slice(0, 10),
            quantity: 10,
        }));
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
                        <span>{t('purchases.supplier')}</span>
                        <select
                            value={formState.importerId}
                            onChange={(event) => handleFormChange('importerId', event.target.value)}
                        >
                            {importerCatalog.map((importer) => (
                                <option key={importer.id} value={importer.id}>
                                    {importer.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t('purchases.itemType')}</span>
                        <select
                            value={formState.tireId}
                            onChange={(event) => handleFormChange('tireId', event.target.value)}
                        >
                            {tireCatalog.map((tire) => (
                                <option key={tire.id} value={tire.id}>
                                    {tire.brand} {tire.model}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t('purchases.purchaseDate')}</span>
                        <input
                            type="date"
                            value={formState.purchaseDate}
                            onChange={(event) => handleFormChange('purchaseDate', event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        <span>{t('purchases.quantityLabel', { defaultValue: 'Quantity' })}</span>
                        <input
                            type="number"
                            min={1}
                            value={formState.quantity}
                            onChange={(event) => handleFormChange('quantity', Number(event.target.value) || 0)}
                            required
                        />
                    </label>
                    <label>
                        <span>{t('purchases.unitCostLabel', { defaultValue: 'Unit cost' })}</span>
                        <input
                            type="number"
                            min={0}
                            value={formState.unitCost}
                            onChange={(event) => handleFormChange('unitCost', Number(event.target.value) || 0)}
                            required
                        />
                    </label>
                    <button type="submit" className="button button--primary">
                        <Icon name="save" size={16} />
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
                                <th>{t('purchases.purchaseNumberLabel', { defaultValue: 'Purchase #' })}</th>
                                <th>{t('purchases.purchaseDate')}</th>
                                <th>{t('purchases.supplier')}</th>
                                <th>{t('purchases.itemType')}</th>
                                <th>{t('purchases.quantityLabel', { defaultValue: 'Quantity' })}</th>
                                <th>{t('purchases.unitCostLabel', { defaultValue: 'Unit cost' })}</th>
                                <th>{t('purchases.totalCostLabel', { defaultValue: 'Total' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                    <td>{purchase.purchaseNumber}</td>
                                    <td>{purchase.purchaseDate}</td>
                                    <td>
                                        <div className="purchases-supplier">
                                            <strong>{purchase.importer.name}</strong>
                                            <span>{purchase.importer.phone ?? ''}</span>
                                        </div>
                                    </td>
                                    <td>{purchase.tire.brand}</td>
                                    <td>{purchase.quantity}</td>
                                    <td>{currencyFormat(purchase.unitCost)}</td>
                                    <td>{currencyFormat(purchase.totalCost)}</td>
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
