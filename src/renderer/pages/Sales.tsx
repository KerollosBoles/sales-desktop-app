import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceRecord } from '../../models/invoice';
import { InvoiceLineItemDetail } from '../../models/invoice-line-item';
import { ImporterSummary } from '../../models/importer';
import { MerchantSummary } from '../../models/merchant';
import { TireSnapshot } from '../../models/tire';
import { UserSummary } from '../../models/user';
import { deleteInvoice, loadInvoices, saveInvoice } from '../services/invoiceStorage';
import {
    findMerchantById,
    findSellerById,
    findTireById,
    getImporterCatalog,
    getMerchantCatalog,
    getSellerCatalog,
    getTireCatalog,
} from '../services/relationshipCatalog';
import Icon from '../components/Icon';
import './Sales.css';

interface LineItemFormState {
    id: string;
    tireId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    remainingQuantity: number;
    hasRemainingStock: boolean;
    lastPurchaseAt?: string;
    lastSaleAt?: string;
}

interface InvoiceFormState {
    invoiceNumber: string;
    saleDate: string;
    sellerId: string;
    buyer: {
        id: string;
        code: string;
        name: string;
        phone?: string;
        address?: string;
        location?: string;
        email?: string;
    };
    notes: string;
    lineItems: LineItemFormState[];
}

interface InvoiceFilters {
    searchTerm: string;
    saleDate: string;
    startDate: string;
    endDate: string;
    buyerId: string;
    sellerId: string;
    importerId: string;
    tireId: string;
}

const generateInvoiceNumber = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate(),
    ).padStart(2, '0')}`;
    const timePart = `${now.getHours()}${String(now.getMinutes()).padStart(2, '0')}${String(
        now.getSeconds(),
    ).padStart(2, '0')}`;
    return `INV-${datePart}-${timePart}`;
};

const createLineItem = (defaultTire?: TireSnapshot): LineItemFormState => ({
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tireId: defaultTire?.id ?? '',
    description: defaultTire ? `${defaultTire.brand}${defaultTire.model ? ` ${defaultTire.model}` : ''}` : '',
    quantity: 1,
    unitPrice: defaultTire?.suggestedSalePrice ?? 0,
    remainingQuantity: defaultTire?.quantityOnHand ?? 0,
    hasRemainingStock: defaultTire?.hasRemainingStock ?? true,
    lastPurchaseAt: defaultTire?.lastPurchaseAt,
    lastSaleAt: defaultTire?.lastSaleAt,
});

const normalizeBuyer = (merchant?: MerchantSummary) =>
    merchant
        ? {
              id: merchant.id,
              code: merchant.merchantCode,
              name: merchant.displayName,
              phone: merchant.phone,
              address: merchant.address,
              location: merchant.city,
              email: merchant.email,
          }
        : {
              id: '',
              code: '',
              name: '',
          };

const currencyFormat = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Sales: React.FC = () => {
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const sellerCatalog = useMemo(() => getSellerCatalog(), []);
    const merchantCatalog = useMemo(() => getMerchantCatalog(), []);
    const importerCatalog = useMemo(() => getImporterCatalog(), []);
    const tireCatalog = useMemo(() => getTireCatalog(), []);

    const [formState, setFormState] = useState<InvoiceFormState>(() => ({
        invoiceNumber: generateInvoiceNumber(),
        saleDate: new Date().toISOString().slice(0, 10),
        sellerId: sellerCatalog[0]?.id ?? '',
        buyer: normalizeBuyer(merchantCatalog[0]),
        notes: '',
        lineItems: [createLineItem(tireCatalog[0])],
    }));

    const [filters, setFilters] = useState<InvoiceFilters>({
        searchTerm: '',
        saleDate: '',
        startDate: '',
        endDate: '',
        buyerId: '',
        sellerId: '',
        importerId: '',
        tireId: '',
    });

    useEffect(() => {
        const stored = loadInvoices();
        setInvoices(stored);
        setSelectedInvoiceId(stored[0]?.id ?? null);
    }, []);

    const handleBuyerChange = (buyerId: string) => {
        const merchant = findMerchantById(buyerId) ?? merchantCatalog.find((m) => m.id === buyerId);
        setFormState((prev) => ({
            ...prev,
            buyer: normalizeBuyer(merchant),
        }));
    };

    const handleBuyerFieldChange = (field: keyof InvoiceFormState['buyer']) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setFormState((prev) => ({
                ...prev,
                buyer: {
                    ...prev.buyer,
                    [field]: value,
                },
            }));
        };

    const handleSellerChange = (sellerId: string) => {
        setFormState((prev) => ({
            ...prev,
            sellerId,
        }));
    };

    const handleLineItemChange = <Field extends keyof LineItemFormState>(
        id: string,
        field: Field,
        value: LineItemFormState[Field],
    ) => {
        setFormState((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item,
            ),
        }));
    };

    const handleTireSelection = (id: string, tireId: string) => {
        const tire = findTireById(tireId) ?? tireCatalog.find((candidate) => candidate.id === tireId);
        setFormState((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          tireId,
                          description: tire
                              ? `${tire.brand}${tire.model ? ` ${tire.model}` : ''}`
                              : item.description,
                          unitPrice: tire?.suggestedSalePrice ?? item.unitPrice,
                          remainingQuantity: tire?.quantityOnHand ?? item.remainingQuantity,
                          hasRemainingStock: tire?.hasRemainingStock ?? item.hasRemainingStock,
                          lastPurchaseAt: tire?.lastPurchaseAt ?? item.lastPurchaseAt,
                          lastSaleAt: tire?.lastSaleAt ?? item.lastSaleAt,
                      }
                    : item,
            ),
        }));
    };

    const addLineItem = () => {
        setFormState((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, createLineItem(tireCatalog[0])],
        }));
    };

    const removeLineItem = (id: string) => {
        setFormState((prev) => ({
            ...prev,
            lineItems:
                prev.lineItems.length > 1 ? prev.lineItems.filter((item) => item.id !== id) : prev.lineItems,
        }));
    };

    const buildInvoiceLine = (line: LineItemFormState): InvoiceLineItemDetail | null => {
        if (!line.tireId || !line.description.trim() || !line.quantity || line.quantity <= 0) {
            return null;
        }

        const tire = findTireById(line.tireId) ?? tireCatalog.find((candidate) => candidate.id === line.tireId);
        const importer = tire?.importer ??
            (tire?.importer?.id ? importerCatalog.find((imp) => imp.id === tire.importer?.id) : undefined);

        const tireSnapshot: TireSnapshot | undefined = tire
            ? {
                  ...tire,
                  quantityOnHand: line.remainingQuantity,
                  hasRemainingStock: line.hasRemainingStock,
                  lastPurchaseAt: line.lastPurchaseAt ?? tire.lastPurchaseAt,
                  lastSaleAt: line.lastSaleAt ?? new Date().toISOString(),
              }
            : undefined;

        return {
            id: line.id,
            description: line.description.trim(),
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.quantity * line.unitPrice,
            tire: tireSnapshot,
            importer: importer,
        };
    };

    const resetForm = () => {
        setFormState({
            invoiceNumber: generateInvoiceNumber(),
            saleDate: new Date().toISOString().slice(0, 10),
            sellerId: sellerCatalog[0]?.id ?? '',
            buyer: normalizeBuyer(merchantCatalog[0]),
            notes: '',
            lineItems: [createLineItem(tireCatalog[0])],
        });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const seller = findSellerById(formState.sellerId) ?? sellerCatalog.find((candidate) => candidate.id === formState.sellerId);
        if (!seller) {
            return;
        }

        const preparedLineItems = formState.lineItems
            .map(buildInvoiceLine)
            .filter((item): item is InvoiceLineItemDetail => Boolean(item));

        if (!preparedLineItems.length) {
            return;
        }

        const totalAmount = preparedLineItems.reduce((sum, item) => sum + item.lineTotal, 0);

        const invoice: InvoiceRecord = {
            id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            invoiceNumber: formState.invoiceNumber.trim() || generateInvoiceNumber(),
            saleDate: formState.saleDate,
            buyer: {
                id: formState.buyer.id,
                code: formState.buyer.code,
                name: formState.buyer.name,
                phone: formState.buyer.phone,
                address: formState.buyer.address,
                location: formState.buyer.location,
                email: formState.buyer.email,
            },
            seller: seller,
            lineItems: preparedLineItems,
            totalAmount,
            notes: formState.notes.trim() || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const saved: Invoice = saveInvoice(invoice);
        setInvoices((prev) => {
            const without = prev.filter((existing) => existing.id !== saved.id);
            const next = [saved, ...without];
            return next.sort((a, b) => b.saleDate.localeCompare(a.saleDate));
        });
        setSelectedInvoiceId(saved.id);
        resetForm();
    };

    const handleDelete = (invoiceId: string) => {
        deleteInvoice(invoiceId);
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
        setSelectedInvoiceId((prev) => (prev === invoiceId ? null : prev));
    };

    const handlePrint = (invoice: InvoiceRecord) => {
        const printWindow = window.open('', '', 'width=900,height=650');
        if (!printWindow) {
            return;
        }

        const itemsRows = invoice.lineItems
            .map(
                (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${currencyFormat(item.unitPrice)}</td>
                        <td>${currencyFormat(item.lineTotal)}</td>
                    </tr>
                `,
            )
            .join('');

        const styles = `
            <style>
                @page {
                    size: A4;
                    margin: 16mm;
                }

                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #0f172a;
                    margin: 0;
                    padding: 0;
                }

                .invoice-print {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 24px 32px;
                    box-sizing: border-box;
                }

                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #1d4ed8;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #1d4ed8;
                }

                .invoice-meta {
                    text-align: right;
                    font-size: 14px;
                }

                .invoice-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                    font-size: 14px;
                }

                .invoice-details div {
                    background: #eff6ff;
                    padding: 12px;
                    border-radius: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 24px;
                }

                th, td {
                    border: 1px solid #cbd5f5;
                    padding: 8px 12px;
                    text-align: left;
                    font-size: 13px;
                }

                th {
                    background-color: #1d4ed8;
                    color: #fff;
                }

                .invoice-total {
                    text-align: right;
                    font-size: 18px;
                    font-weight: bold;
                    color: #1d4ed8;
                }

                .invoice-notes {
                    font-size: 13px;
                    color: #475569;
                }
            </style>
        `;

        const html = `
            <html>
                <head>
                    <title>${t('sales.printWindowTitle', { id: invoice.invoiceNumber })}</title>
                    ${styles}
                </head>
                <body>
                    <div class="invoice-print">
                        <header>
                            <div>
                                <h1>${t('sales.invoiceLabel')}</h1>
                                <p>${t('sales.sellerLabel')}: ${invoice.seller.fullName ?? invoice.seller.username}</p>
                            </div>
                            <div class="invoice-meta">
                                <div>${t('sales.invoiceNumberLabel')}: <strong>${invoice.invoiceNumber}</strong></div>
                                <div>${t('sales.saleDateLabel')}: <strong>${invoice.saleDate}</strong></div>
                                <div>${t('sales.buyerLabel')}: <strong>${invoice.buyer.name}</strong></div>
                            </div>
                        </header>
                        <section class="invoice-details">
                            <div>
                                <strong>${t('sales.sellerLabel')}:</strong>
                                <div>${invoice.seller.fullName ?? invoice.seller.username}</div>
                                ${invoice.seller.phone ? `<div>${invoice.seller.phone}</div>` : ''}
                            </div>
                            <div>
                                <strong>${t('sales.buyerLabel')}:</strong>
                                <div>${invoice.buyer.name}</div>
                                ${invoice.buyer.phone ? `<div>${invoice.buyer.phone}</div>` : ''}
                                ${invoice.buyer.address ? `<div>${invoice.buyer.address}</div>` : ''}
                            </div>
                        </section>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>${t('sales.lineItemDescription')}</th>
                                    <th>${t('sales.lineItemQuantity')}</th>
                                    <th>${t('sales.lineItemPrice')}</th>
                                    <th>${t('sales.lineItemTotal')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRows}
                            </tbody>
                        </table>
                        <div class="invoice-total">
                            ${t('sales.totalLabel')}: ${currencyFormat(invoice.totalAmount)}
                        </div>
                        ${invoice.notes ? `<div class="invoice-notes"><strong>${t('sales.notesLabel')}:</strong> ${invoice.notes}</div>` : ''}
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const filteredInvoices = useMemo(() => {
        const text = filters.searchTerm.trim().toLowerCase();
        return invoices.filter((invoice) => {
            const matchesText =
                !text ||
                invoice.invoiceNumber.toLowerCase().includes(text) ||
                invoice.buyer.name.toLowerCase().includes(text) ||
                (invoice.seller.fullName ?? invoice.seller.username).toLowerCase().includes(text) ||
                invoice.lineItems.some((item) =>
                    item.description.toLowerCase().includes(text) ||
                    item.importer?.name?.toLowerCase().includes(text) ||
                    item.tire?.brand.toLowerCase().includes(text),
                );

            const matchesBuyer = !filters.buyerId || invoice.buyer.id === filters.buyerId;
            const matchesSeller = !filters.sellerId || invoice.seller.id === filters.sellerId;
            const matchesImporter =
                !filters.importerId || invoice.lineItems.some((item) => item.importer?.id === filters.importerId);
            const matchesTire = !filters.tireId || invoice.lineItems.some((item) => item.tire?.id === filters.tireId);
            const matchesSpecificDate = !filters.saleDate || invoice.saleDate === filters.saleDate;
            const withinStart = !filters.startDate || invoice.saleDate >= filters.startDate;
            const withinEnd = !filters.endDate || invoice.saleDate <= filters.endDate;

            return (
                matchesText &&
                matchesBuyer &&
                matchesSeller &&
                matchesImporter &&
                matchesTire &&
                matchesSpecificDate &&
                withinStart &&
                withinEnd
            );
        });
    }, [filters, invoices]);

    const handleFilterChange = (field: keyof InvoiceFilters) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFilters((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            saleDate: '',
            startDate: '',
            endDate: '',
            buyerId: '',
            sellerId: '',
            importerId: '',
            tireId: '',
        });
    };

    const selectedInvoice = useMemo(() => {
        if (!filteredInvoices.length) {
            return null;
        }

        const explicit = filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId);
        return explicit ?? filteredInvoices[0];
    }, [filteredInvoices, selectedInvoiceId]);

    const selectedImporters = useMemo(() => {
        if (!selectedInvoice) {
            return [];
        }
        const map = new Map<string, ImporterSummary>();
        selectedInvoice.lineItems.forEach((item) => {
            if (item.importer?.id && !map.has(item.importer.id)) {
                map.set(item.importer.id, item.importer);
            }
        });
        return Array.from(map.values());
    }, [selectedInvoice]);

    return (
        <div className="sales-page app-grid">
            <section className="sales-hero surface-card surface-card--glass">
                <div className="sales-hero__copy">
                    <span className="badge">
                        <Icon name="file-text" size={16} />
                        {t('sales.title')}
                    </span>
                    <h1 className="section-heading">{t('sales.title')}</h1>
                    <p className="section-subtitle">{t('sales.subtitle')}</p>
                </div>
                <div className="sales-hero__search">
                    <Icon name="search" size={18} />
                    <input
                        type="search"
                        value={filters.searchTerm}
                        placeholder={t('sales.searchPlaceholder')}
                        onChange={handleFilterChange('searchTerm')}
                    />
                </div>
            </section>

            <section className="surface-card sales-form-card">
                <header className="sales-form-card__header">
                    <div>
                        <h2 className="section-heading">{t('sales.newInvoiceTitle')}</h2>
                        <p className="section-subtitle">{t('sales.newInvoiceSubtitle')}</p>
                    </div>
                    <div className="sales-form-card__meta">
                        <span className="badge badge--muted">{t('sales.invoiceNumberLabel')}: {formState.invoiceNumber}</span>
                    </div>
                </header>
                <form onSubmit={handleSubmit} className="invoice-form">
                    <div className="invoice-form__row">
                        <label>
                            <span>{t('sales.saleDateLabel')}</span>
                            <input
                                type="date"
                                value={formState.saleDate}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, saleDate: event.target.value }))
                                }
                                required
                            />
                        </label>
                        <label>
                            <span>{t('sales.sellerLabel')}</span>
                            <select
                                value={formState.sellerId}
                                onChange={(event) => handleSellerChange(event.target.value)}
                            >
                                {sellerCatalog.map((seller) => (
                                    <option key={seller.id} value={seller.id}>
                                        {seller.fullName ?? seller.username}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>{t('sales.buyerSelector')}</span>
                            <select
                                value={formState.buyer.id}
                                onChange={(event) => handleBuyerChange(event.target.value)}
                            >
                                <option value="">{t('sales.buyerSelectorPlaceholder')}</option>
                                {merchantCatalog.map((merchant) => (
                                    <option key={merchant.id} value={merchant.id}>
                                        {merchant.displayName}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="invoice-form__buyer-card">
                        <h3>{t('sales.buyerDetails')}</h3>
                        <div className="invoice-form__buyer-grid">
                            <label>
                                <span>{t('sales.buyerNameLabel')}</span>
                                <input
                                    type="text"
                                    value={formState.buyer.name}
                                    onChange={handleBuyerFieldChange('name')}
                                    required
                                />
                            </label>
                            <label>
                                <span>{t('sales.buyerCodeLabel')}</span>
                                <input
                                    type="text"
                                    value={formState.buyer.code}
                                    onChange={handleBuyerFieldChange('code')}
                                />
                            </label>
                            <label>
                                <span>{t('sales.buyerPhoneLabel')}</span>
                                <input
                                    type="tel"
                                    value={formState.buyer.phone ?? ''}
                                    onChange={handleBuyerFieldChange('phone')}
                                />
                            </label>
                            <label>
                                <span>{t('sales.buyerEmailLabel')}</span>
                                <input
                                    type="email"
                                    value={formState.buyer.email ?? ''}
                                    onChange={handleBuyerFieldChange('email')}
                                />
                            </label>
                            <label className="invoice-form__buyer-address">
                                <span>{t('sales.buyerAddressLabel')}</span>
                                <input
                                    type="text"
                                    value={formState.buyer.address ?? ''}
                                    onChange={handleBuyerFieldChange('address')}
                                />
                            </label>
                            <label>
                                <span>{t('sales.buyerLocationLabel')}</span>
                                <input
                                    type="text"
                                    value={formState.buyer.location ?? ''}
                                    onChange={handleBuyerFieldChange('location')}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="invoice-form__line-items">
                        <header className="invoice-form__line-items-header">
                            <h3>{t('sales.lineItemsTitle')}</h3>
                            <button type="button" className="button button--ghost" onClick={addLineItem}>
                                <Icon name="plus" size={16} />
                                {t('sales.addLineItem')}
                            </button>
                        </header>

                        <div className="invoice-form__line-items-grid">
                            {formState.lineItems.map((line) => {
                                const tire = line.tireId
                                    ? findTireById(line.tireId) ?? tireCatalog.find((candidate) => candidate.id === line.tireId)
                                    : undefined;
                                const importer = tire?.importer ??
                                    (tire?.importer?.id
                                        ? importerCatalog.find((imp) => imp.id === tire.importer?.id)
                                        : undefined);
                                return (
                                    <article className="line-item-card" key={line.id}>
                                        <header className="line-item-card__header">
                                            <div>
                                                <h4>{line.description || t('sales.lineItemPlaceholder')}</h4>
                                                {importer ? (
                                                    <span className="badge badge--muted">
                                                        {t('sales.importerLabel')}: {importer.name}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <button
                                                type="button"
                                                className="icon-button"
                                                onClick={() => removeLineItem(line.id)}
                                                disabled={formState.lineItems.length === 1}
                                                aria-label={t('sales.removeLineItem')}
                                            >
                                                <Icon name="trash" size={16} />
                                            </button>
                                        </header>
                                        <div className="line-item-card__grid">
                                            <label>
                                                <span>{t('sales.tireSelector')}</span>
                                                <select
                                                    value={line.tireId}
                                                    onChange={(event) => handleTireSelection(line.id, event.target.value)}
                                                >
                                                    <option value="">{t('sales.tireSelectorPlaceholder')}</option>
                                                    {tireCatalog.map((option) => (
                                                        <option key={option.id} value={option.id}>
                                                            {option.brand} {option.model}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label>
                                                <span>{t('sales.lineItemDescription')}</span>
                                                <input
                                                    type="text"
                                                    value={line.description}
                                                    onChange={(event) =>
                                                        handleLineItemChange(line.id, 'description', event.target.value)
                                                    }
                                                    required
                                                />
                                            </label>
                                            <label>
                                                <span>{t('sales.lineItemQuantity')}</span>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={line.quantity}
                                                    onChange={(event) =>
                                                        handleLineItemChange(line.id, 'quantity', Number(event.target.value) || 0)
                                                    }
                                                    required
                                                />
                                            </label>
                                            <label>
                                                <span>{t('sales.lineItemPrice')}</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={line.unitPrice}
                                                    onChange={(event) =>
                                                        handleLineItemChange(line.id, 'unitPrice', Number(event.target.value) || 0)
                                                    }
                                                    required
                                                />
                                            </label>
                                            <label>
                                                <span>{t('sales.remainingQuantityLabel')}</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={line.remainingQuantity}
                                                    onChange={(event) =>
                                                        handleLineItemChange(line.id, 'remainingQuantity', Number(event.target.value) || 0)
                                                    }
                                                />
                                            </label>
                                            <label>
                                                <span>{t('sales.lastPurchaseLabel')}</span>
                                                <input
                                                    type="date"
                                                    value={line.lastPurchaseAt?.slice(0, 10) ?? ''}
                                                    onChange={(event) =>
                                                        handleLineItemChange(
                                                            line.id,
                                                            'lastPurchaseAt',
                                                            event.target.value ? `${event.target.value}T00:00:00.000Z` : undefined,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label>
                                                <span>{t('sales.lastSaleLabel')}</span>
                                                <input
                                                    type="date"
                                                    value={line.lastSaleAt?.slice(0, 10) ?? ''}
                                                    onChange={(event) =>
                                                        handleLineItemChange(
                                                            line.id,
                                                            'lastSaleAt',
                                                            event.target.value ? `${event.target.value}T00:00:00.000Z` : undefined,
                                                        )
                                                    }
                                                />
                                            </label>
                                            <label className="line-item-card__stock-toggle">
                                                <span>{t('sales.hasStockLabel')}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={line.hasRemainingStock}
                                                    onChange={(event) =>
                                                        handleLineItemChange(line.id, 'hasRemainingStock', event.target.checked)
                                                    }
                                                />
                                            </label>
                                        </div>
                                        <footer className="line-item-card__footer">
                                            <span>{t('sales.lineItemTotal')}</span>
                                            <strong>{currencyFormat(line.quantity * line.unitPrice)}</strong>
                                        </footer>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    <label className="invoice-form__notes">
                        <span>{t('sales.notesLabel')}</span>
                        <textarea
                            value={formState.notes}
                            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                            rows={4}
                            placeholder={t('sales.notesPlaceholder')}
                        />
                    </label>

                    <div className="invoice-form__actions">
                        <button type="submit" className="button button--primary">
                            <Icon name="save" size={16} />
                            {t('sales.saveInvoiceButton')}
                        </button>
                        <button type="button" className="button button--ghost" onClick={resetForm}>
                            <Icon name="refresh" size={16} />
                            {t('sales.resetFormButton')}
                        </button>
                    </div>
                </form>
            </section>

            <section className="surface-card sales-filters-card">
                <header className="sales-filters-card__header">
                    <h2 className="section-heading">{t('sales.filterTitle')}</h2>
                    <button type="button" className="button button--ghost" onClick={resetFilters}>
                        <Icon name="refresh" size={16} />
                        {t('sales.clearFilters')}
                    </button>
                </header>
                <div className="sales-filters-grid">
                    <label>
                        <span>{t('sales.filterDate')}</span>
                        <input type="date" value={filters.saleDate} onChange={handleFilterChange('saleDate')} />
                    </label>
                    <label>
                        <span>{t('sales.filterStartDate')}</span>
                        <input type="date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
                    </label>
                    <label>
                        <span>{t('sales.filterEndDate')}</span>
                        <input type="date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
                    </label>
                    <label>
                        <span>{t('sales.filterBuyer')}</span>
                        <select value={filters.buyerId} onChange={handleFilterChange('buyerId')}>
                            <option value="">{t('sales.anyOption')}</option>
                            {merchantCatalog.map((merchant) => (
                                <option key={merchant.id} value={merchant.id}>
                                    {merchant.displayName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t('sales.filterSeller')}</span>
                        <select value={filters.sellerId} onChange={handleFilterChange('sellerId')}>
                            <option value="">{t('sales.anyOption')}</option>
                            {sellerCatalog.map((seller) => (
                                <option key={seller.id} value={seller.id}>
                                    {seller.fullName ?? seller.username}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t('sales.filterImporter')}</span>
                        <select value={filters.importerId} onChange={handleFilterChange('importerId')}>
                            <option value="">{t('sales.anyOption')}</option>
                            {importerCatalog.map((importer) => (
                                <option key={importer.id} value={importer.id}>
                                    {importer.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <span>{t('sales.filterTire')}</span>
                        <select value={filters.tireId} onChange={handleFilterChange('tireId')}>
                            <option value="">{t('sales.anyOption')}</option>
                            {tireCatalog.map((tire) => (
                                <option key={tire.id} value={tire.id}>
                                    {tire.brand} {tire.model}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>

            <section className="surface-card sales-list-card">
                <header className="sales-list-card__header">
                    <div>
                        <h2 className="section-heading">{t('sales.savedInvoices')}</h2>
                        <p className="section-subtitle">{t('sales.savedInvoicesSubtitle')}</p>
                    </div>
                    <span className="badge">
                        <Icon name="calendar" size={16} />
                        {filteredInvoices.length}
                    </span>
                </header>
                {filteredInvoices.length === 0 ? (
                    <p className="empty-state">{t('sales.noInvoicesMessage')}</p>
                ) : (
                    <div className="invoice-list">
                        {filteredInvoices.map((invoice) => (
                            <article
                                key={invoice.id}
                                className={`invoice-list__item${invoice.id === selectedInvoice?.id ? ' invoice-list__item--active' : ''}`}
                                onClick={() => setSelectedInvoiceId(invoice.id)}
                            >
                                <header className="invoice-list__item-header">
                                    <div>
                                        <h3>{invoice.invoiceNumber}</h3>
                                        <span className="invoice-list__item-date">{invoice.saleDate}</span>
                                    </div>
                                    <div className="invoice-list__item-total">{currencyFormat(invoice.totalAmount)}</div>
                                </header>
                                <div className="invoice-list__meta">
                                    <div>
                                        <strong>{t('sales.buyerLabel')}:</strong>
                                        <span>{invoice.buyer.name}</span>
                                    </div>
                                    <div>
                                        <strong>{t('sales.sellerLabel')}:</strong>
                                        <span>{invoice.seller.fullName ?? invoice.seller.username}</span>
                                    </div>
                                </div>
                                <ul className="invoice-list__line-items">
                                    {invoice.lineItems.map((item) => (
                                        <li key={item.id}>
                                            <span>{item.description}</span>
                                            {item.importer?.name ? (
                                                <span className="invoice-list__importer">{item.importer.name}</span>
                                            ) : null}
                                            <span>{item.quantity} × {currencyFormat(item.unitPrice)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <footer className="invoice-list__actions">
                                    <button type="button" className="button button--ghost" onClick={() => handlePrint(invoice)}>
                                        <Icon name="printer" size={14} />
                                        {t('sales.printInvoiceButton')}
                                    </button>
                                    <button
                                        type="button"
                                        className="button button--danger"
                                        onClick={() => handleDelete(invoice.id)}
                                    >
                                        <Icon name="trash" size={14} />
                                        {t('sales.deleteInvoiceButton')}
                                    </button>
                                </footer>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="surface-card sales-relations-card">
                <header className="sales-relations-card__header">
                    <div>
                        <h2 className="section-heading">{t('sales.relationshipsTitle')}</h2>
                        <p className="section-subtitle">{t('sales.relationshipsSubtitle')}</p>
                    </div>
                </header>
                {!selectedInvoice ? (
                    <p className="empty-state">{t('sales.noInvoiceSelected')}</p>
                ) : (
                    <div className="relationships-grid">
                        <div className="relationships-card">
                            <h3>{t('sales.buyerHistoryTitle')}</h3>
                            <div className="relationships-card__body">
                                <div className="relationships-card__party">
                                    <strong>{selectedInvoice.buyer.name}</strong>
                                    {selectedInvoice.buyer.phone ? (
                                        <span>{selectedInvoice.buyer.phone}</span>
                                    ) : null}
                                    {selectedInvoice.buyer.address ? (
                                        <span>{selectedInvoice.buyer.address}</span>
                                    ) : null}
                                </div>
                                <ul className="relationships-list">
                                    {(selectedInvoice.buyer.previousInvoices ?? []).length === 0 ? (
                                        <li className="relationships-list__empty">{t('sales.noPreviousInvoices')}</li>
                                    ) : (
                                        selectedInvoice.buyer.previousInvoices!.map((entry) => (
                                            <li key={entry.invoiceId}>
                                                <span>{entry.invoiceNumber}</span>
                                                <span>{entry.saleDate}</span>
                                                <span>{currencyFormat(entry.totalAmount)}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="relationships-card">
                            <h3>{t('sales.importerOverviewTitle')}</h3>
                            <div className="relationships-card__body">
                                {selectedImporters.length === 0 ? (
                                    <p className="relationships-list__empty">{t('sales.noImporterData')}</p>
                                ) : (
                                    <ul className="relationships-list relationships-list--vertical">
                                        {selectedImporters.map((importer) => (
                                            <li key={importer.id}>
                                                <div>
                                                    <strong>{importer.name}</strong>
                                                    {importer.importerCode ? (
                                                        <span>{importer.importerCode}</span>
                                                    ) : null}
                                                </div>
                                                <div>
                                                    {importer.phone ? <span>{importer.phone}</span> : null}
                                                    {importer.location ? <span>{importer.location}</span> : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="relationships-card relationships-card--wide">
                            <h3>{t('sales.tireMovementTitle')}</h3>
                            <div className="relationships-card__body relationships-card__body--tire">
                                {selectedInvoice.lineItems.map((item) => (
                                    <article key={item.id} className="tire-summary">
                                        <header>
                                            <div>
                                                <strong>{item.tire?.brand ?? item.description}</strong>
                                                {item.tire?.model ? <span>{item.tire.model}</span> : null}
                                            </div>
                                            <span className={`stock-chip${item.tire?.hasRemainingStock ? ' stock-chip--ok' : ' stock-chip--empty'}`}>
                                                {item.tire?.hasRemainingStock
                                                    ? t('sales.stockAvailable')
                                                    : t('sales.stockEmpty')}
                                            </span>
                                        </header>
                                        <dl>
                                            <div>
                                                <dt>{t('sales.quantityOnHandLabel')}</dt>
                                                <dd>{item.tire?.quantityOnHand ?? 0}</dd>
                                            </div>
                                            <div>
                                                <dt>{t('sales.lastPurchaseLabel')}</dt>
                                                <dd>{item.tire?.lastPurchaseAt?.slice(0, 10) ?? t('sales.unknownDate')}</dd>
                                            </div>
                                            <div>
                                                <dt>{t('sales.lastSaleLabel')}</dt>
                                                <dd>{item.tire?.lastSaleAt?.slice(0, 10) ?? t('sales.unknownDate')}</dd>
                                            </div>
                                            <div>
                                                <dt>{t('sales.lineItemQuantity')}</dt>
                                                <dd>{item.quantity}</dd>
                                            </div>
                                            <div>
                                                <dt>{t('sales.lineItemTotal')}</dt>
                                                <dd>{currencyFormat(item.lineTotal)}</dd>
                                            </div>
                                        </dl>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Sales;
