import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceLineItem } from '../../models/invoice';
import { deleteInvoice, loadInvoices, saveInvoice } from '../services/invoiceStorage';
import Icon from '../components/Icon';
import './Sales.css';

interface InvoiceFormState {
    invoiceNumber: string;
    saleDate: string;
    sellerName: string;
    buyerName: string;
    notes: string;
    lineItems: InvoiceLineItem[];
}

interface InvoiceFilters {
    searchTerm: string;
    saleDate: string;
    startDate: string;
    endDate: string;
    sellerName: string;
    buyerName: string;
    invoiceNumber: string;
}

const createLineItem = (): InvoiceLineItem => ({
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: '',
    quantity: 1,
    unitPrice: 0,
});

const generateInvoiceNumber = () => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
    ).padStart(2, '0')}`;
    const timePart = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    return `INV-${datePart}-${timePart}`;
};

const calculateTotalAmount = (items: InvoiceLineItem[]) =>
    items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

const Sales: React.FC = () => {
    const { t } = useTranslation();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [formState, setFormState] = useState<InvoiceFormState>({
        invoiceNumber: generateInvoiceNumber(),
        saleDate: new Date().toISOString().slice(0, 10),
        sellerName: '',
        buyerName: '',
        notes: '',
        lineItems: [createLineItem()],
    });
    const [filters, setFilters] = useState<InvoiceFilters>({
        searchTerm: '',
        saleDate: '',
        startDate: '',
        endDate: '',
        sellerName: '',
        buyerName: '',
        invoiceNumber: '',
    });

    useEffect(() => {
        setInvoices(loadInvoices());
    }, []);

    const resetForm = () => {
        setFormState({
            invoiceNumber: generateInvoiceNumber(),
            saleDate: new Date().toISOString().slice(0, 10),
            sellerName: '',
            buyerName: '',
            notes: '',
            lineItems: [createLineItem()],
        });
    };

    const handleLineItemChange = (id: string, field: keyof InvoiceLineItem, value: string) => {
        setFormState((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: field === 'description' ? value : Number(value) || 0,
                      }
                    : item
            ),
        }));
    };

    const handleAddLineItem = () => {
        setFormState((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, createLineItem()],
        }));
    };

    const handleRemoveLineItem = (id: string) => {
        setFormState((prev) => ({
            ...prev,
            lineItems:
                prev.lineItems.length > 1 ? prev.lineItems.filter((item) => item.id !== id) : prev.lineItems,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!formState.sellerName.trim() || !formState.buyerName.trim()) {
            return;
        }

        const cleanedItems = formState.lineItems
            .filter((item) => item.description.trim())
            .map((item) => ({
                ...item,
                description: item.description.trim(),
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unitPrice) || 0,
            }));

        if (cleanedItems.length === 0) {
            return;
        }

        const totalAmount = calculateTotalAmount(cleanedItems);
        const notes = formState.notes.trim();

        const invoice: Invoice = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            invoiceNumber: formState.invoiceNumber.trim() || generateInvoiceNumber(),
            saleDate: formState.saleDate,
            sellerName: formState.sellerName.trim(),
            buyerName: formState.buyerName.trim(),
            notes: notes.length ? notes : undefined,
            lineItems: cleanedItems,
            totalAmount,
            createdAt: new Date().toISOString(),
        };

        saveInvoice(invoice);
        setInvoices((prev) => [invoice, ...prev.filter((existing) => existing.id !== invoice.id)]);
        resetForm();
    };

    const handleDelete = (invoiceId: string) => {
        deleteInvoice(invoiceId);
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
    };

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '', 'width=900,height=650');
        if (!printWindow) {
            return;
        }

        const formatCurrency = (value: number) =>
            value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const itemsRows = invoice.lineItems
            .map(
                (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                `
            )
            .join('');

        const styles = `
            <style>
                @page {
                    size: A4;
                    margin: 20mm;
                }

                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
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

                .invoice-print header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #1d4ed8;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }

                .invoice-print h1 {
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
                    background: #f1f5f9;
                    padding: 12px;
                    border-radius: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 24px;
                }

                th, td {
                    border: 1px solid #dee2e6;
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
                    color: #495057;
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
                                <p>${t('sales.sellerLabel')}: ${invoice.sellerName}</p>
                            </div>
                            <div class="invoice-meta">
                                <div>${t('sales.invoiceNumberLabel')}: <strong>${invoice.invoiceNumber}</strong></div>
                                <div>${t('sales.saleDateLabel')}: <strong>${invoice.saleDate}</strong></div>
                                <div>${t('sales.buyerLabel')}: <strong>${invoice.buyerName}</strong></div>
                            </div>
                        </header>
                        <section class="invoice-details">
                            <div>
                                <strong>${t('sales.sellerLabel')}:</strong>
                                <div>${invoice.sellerName}</div>
                            </div>
                            <div>
                                <strong>${t('sales.buyerLabel')}:</strong>
                                <div>${invoice.buyerName}</div>
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
                            ${t('sales.totalLabel')}: ${formatCurrency(invoice.totalAmount)}
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
        const sellerFilter = filters.sellerName.trim().toLowerCase();
        const buyerFilter = filters.buyerName.trim().toLowerCase();
        const invoiceNumberFilter = filters.invoiceNumber.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const saleDate = invoice.saleDate;
            const matchesText =
                !text ||
                invoice.invoiceNumber.toLowerCase().includes(text) ||
                invoice.sellerName.toLowerCase().includes(text) ||
                invoice.buyerName.toLowerCase().includes(text);

            const matchesSeller = !sellerFilter || invoice.sellerName.toLowerCase().includes(sellerFilter);
            const matchesBuyer = !buyerFilter || invoice.buyerName.toLowerCase().includes(buyerFilter);
            const matchesInvoiceNumber =
                !invoiceNumberFilter || invoice.invoiceNumber.toLowerCase().includes(invoiceNumberFilter);

            const matchesSpecificDate = !filters.saleDate || saleDate === filters.saleDate;

            const withinStart = !filters.startDate || saleDate >= filters.startDate;
            const withinEnd = !filters.endDate || saleDate <= filters.endDate;

            return (
                matchesText &&
                matchesSeller &&
                matchesBuyer &&
                matchesInvoiceNumber &&
                matchesSpecificDate &&
                withinStart &&
                withinEnd
            );
        });
    }, [filters, invoices]);

    const handleFilterChange = (field: keyof InvoiceFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
            sellerName: '',
            buyerName: '',
            invoiceNumber: '',
        });
    };

    const currencyFormat = (value: number) =>
        value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                        aria-label={t('sales.searchPlaceholder')}
                    />
                </div>
            </section>

            <section className="sales-panel surface-card">
                <div className="sales-panel__header">
                    <h2 className="section-heading">{t('sales.filterSectionTitle')}</h2>
                    <button type="button" className="button button--ghost" onClick={resetFilters}>
                        <Icon name="minus" size={16} />
                        {t('sales.resetFilters')}
                    </button>
                </div>
                <div className="filters-grid">
                    <label>
                        <span>{t('sales.filter.invoiceNumber')}</span>
                        <input
                            type="text"
                            value={filters.invoiceNumber}
                            onChange={handleFilterChange('invoiceNumber')}
                        />
                    </label>
                    <label>
                        <span>{t('sales.filter.seller')}</span>
                        <input type="text" value={filters.sellerName} onChange={handleFilterChange('sellerName')} />
                    </label>
                    <label>
                        <span>{t('sales.filter.buyer')}</span>
                        <input type="text" value={filters.buyerName} onChange={handleFilterChange('buyerName')} />
                    </label>
                    <label>
                        <span>{t('sales.filter.exactDate')}</span>
                        <input type="date" value={filters.saleDate} onChange={handleFilterChange('saleDate')} />
                    </label>
                    <label>
                        <span>{t('sales.filter.startDate')}</span>
                        <input type="date" value={filters.startDate} onChange={handleFilterChange('startDate')} />
                    </label>
                    <label>
                        <span>{t('sales.filter.endDate')}</span>
                        <input type="date" value={filters.endDate} onChange={handleFilterChange('endDate')} />
                    </label>
                </div>
            </section>

            <section className="sales-panel surface-card">
                <div className="sales-panel__header">
                    <h2 className="section-heading">{t('sales.form.title')}</h2>
                </div>
                <form onSubmit={handleSubmit} className="sales-form">
                    <div className="form-grid">
                        <label>
                            <span>{t('sales.form.invoiceNumber')}</span>
                            <input
                                type="text"
                                value={formState.invoiceNumber}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, invoiceNumber: event.target.value }))
                                }
                                required
                            />
                        </label>
                        <label>
                            <span>{t('sales.form.saleDate')}</span>
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
                            <span>{t('sales.form.sellerName')}</span>
                            <input
                                type="text"
                                value={formState.sellerName}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, sellerName: event.target.value }))
                                }
                                required
                            />
                        </label>
                        <label>
                            <span>{t('sales.form.buyerName')}</span>
                            <input
                                type="text"
                                value={formState.buyerName}
                                onChange={(event) =>
                                    setFormState((prev) => ({ ...prev, buyerName: event.target.value }))
                                }
                                required
                            />
                        </label>
                    </div>

                    <div className="line-items">
                        <div className="line-items__header">
                            <h3>{t('sales.form.lineItemsTitle')}</h3>
                            <button type="button" className="button button--ghost" onClick={handleAddLineItem}>
                                <Icon name="plus" size={16} />
                                {t('sales.form.addLineItem')}
                            </button>
                        </div>
                        {formState.lineItems.map((item) => (
                            <div key={item.id} className="line-item-row">
                                <input
                                    type="text"
                                    value={item.description}
                                    placeholder={t('sales.form.itemDescription')}
                                    onChange={(event) => handleLineItemChange(item.id, 'description', event.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.quantity}
                                    placeholder={t('sales.form.quantityPlaceholder')}
                                    onChange={(event) => handleLineItemChange(item.id, 'quantity', event.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    placeholder={t('sales.form.unitPricePlaceholder')}
                                    onChange={(event) => handleLineItemChange(item.id, 'unitPrice', event.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="icon-button icon-button--danger"
                                    onClick={() => handleRemoveLineItem(item.id)}
                                    aria-label={t('sales.form.removeLineItem')}
                                >
                                    <Icon name="trash" size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <label className="notes-field">
                        <span>{t('sales.form.notes')}</span>
                        <textarea
                            value={formState.notes}
                            onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                            rows={3}
                        />
                    </label>

                    <div className="form-actions">
                        <button type="submit" className="button button--primary">
                            <Icon name="sales" size={16} />
                            {t('sales.form.saveInvoice')}
                        </button>
                        <button type="button" className="button button--ghost" onClick={resetForm}>
                            <Icon name="minus" size={16} />
                            {t('sales.form.resetForm')}
                        </button>
                    </div>
                </form>
            </section>

            <section className="sales-panel surface-card">
                <div className="sales-panel__header">
                    <h2 className="section-heading">{t('sales.savedInvoicesTitle')}</h2>
                    <span className="badge">
                        <Icon name="calendar" size={16} />
                        {filteredInvoices.length}
                    </span>
                </div>
                {filteredInvoices.length === 0 ? (
                    <p className="empty-state">{t('sales.emptyState')}</p>
                ) : (
                    <ul className="invoice-list">
                        {filteredInvoices.map((invoice) => (
                            <li key={invoice.id} className="invoice-card">
                                <div className="invoice-card__header">
                                    <div className="invoice-card__meta">
                                        <h3>{invoice.invoiceNumber}</h3>
                                        <div className="invoice-card__meta-row">
                                            <Icon name="calendar" size={16} />
                                            <span>
                                                {t('sales.saleDateLabel')}: <strong>{invoice.saleDate}</strong>
                                            </span>
                                        </div>
                                        <div className="invoice-card__meta-row">
                                            <Icon name="sales" size={16} />
                                            <span>
                                                {t('sales.sellerLabel')}: <strong>{invoice.sellerName}</strong>
                                            </span>
                                        </div>
                                        <div className="invoice-card__meta-row">
                                            <Icon name="purchases" size={16} />
                                            <span>
                                                {t('sales.buyerLabel')}: <strong>{invoice.buyerName}</strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="invoice-card__actions">
                                        <button type="button" className="button button--ghost" onClick={() => handlePrint(invoice)}>
                                            <Icon name="printer" size={16} />
                                            {t('sales.printInvoice')}
                                        </button>
                                        <button
                                            type="button"
                                            className="button button--danger"
                                            onClick={() => handleDelete(invoice.id)}
                                        >
                                            <Icon name="trash" size={16} />
                                            {t('sales.deleteInvoice')}
                                        </button>
                                    </div>
                                </div>
                                <table className="invoice-items-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{t('sales.lineItemDescription')}</th>
                                            <th>{t('sales.lineItemQuantity')}</th>
                                            <th>{t('sales.lineItemPrice')}</th>
                                            <th>{t('sales.lineItemTotal')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lineItems.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.description}</td>
                                                <td>{item.quantity}</td>
                                                <td>{currencyFormat(item.unitPrice)}</td>
                                                <td>{currencyFormat(item.quantity * item.unitPrice)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {invoice.notes && (
                                    <p className="invoice-notes">
                                        <strong>{t('sales.notesLabel')}:</strong> {invoice.notes}
                                    </p>
                                )}
                                <div className="invoice-summary">
                                    <span>{t('sales.totalLabel')}:</span>
                                    <strong>{currencyFormat(invoice.totalAmount)}</strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Sales;
