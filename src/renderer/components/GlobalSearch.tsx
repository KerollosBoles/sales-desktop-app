import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceLineItem } from '../../models/invoice';
import { loadInvoices } from '../services/invoiceStorage';
import './GlobalSearch.css';

interface GlobalSearchProps {
    open: boolean;
    onClose: () => void;
}

interface SearchCriteria {
    searchTerm: string;
    invoiceNumber: string;
    sellerName: string;
    buyerName: string;
    saleDate: string;
    startDate: string;
    endDate: string;
}

interface InvoiceSearchResult {
    invoice: Invoice;
    matchedLineItems: InvoiceLineItem[];
    notesMatch: boolean;
}

const defaultCriteria: SearchCriteria = {
    searchTerm: '',
    invoiceNumber: '',
    sellerName: '',
    buyerName: '',
    saleDate: '',
    startDate: '',
    endDate: '',
};

const normalise = (value: string): string => value.toLowerCase().trim();

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
    const { t } = useTranslation();
    const [criteria, setCriteria] = useState<SearchCriteria>({ ...defaultCriteria });
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        setCriteria({ ...defaultCriteria });
        setInvoices(loadInvoices());
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    const handleCriteriaChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = event.target;
        setCriteria((prev) => ({ ...prev, [name]: value }));
    };

    const filteredInvoices = useMemo<InvoiceSearchResult[]>(() => {
        if (!open) {
            return [];
        }

        const term = normalise(criteria.searchTerm);
        const invoiceNumber = normalise(criteria.invoiceNumber);
        const sellerName = normalise(criteria.sellerName);
        const buyerName = normalise(criteria.buyerName);
        const saleDate = criteria.saleDate.trim();
        const startDate = criteria.startDate.trim();
        const endDate = criteria.endDate.trim();

        return invoices
            .filter((invoice) => {
                if (saleDate && invoice.saleDate !== saleDate) {
                    return false;
                }

                if (startDate && invoice.saleDate < startDate) {
                    return false;
                }

                if (endDate && invoice.saleDate > endDate) {
                    return false;
                }

                if (invoiceNumber && !normalise(invoice.invoiceNumber).includes(invoiceNumber)) {
                    return false;
                }

                if (sellerName && !normalise(invoice.sellerName).includes(sellerName)) {
                    return false;
                }

                if (buyerName && !normalise(invoice.buyerName).includes(buyerName)) {
                    return false;
                }

                if (!term) {
                    return true;
                }

                const fieldsToSearch = [
                    invoice.invoiceNumber,
                    invoice.sellerName,
                    invoice.buyerName,
                    invoice.notes ?? '',
                ]
                    .map(normalise)
                    .some((field) => field.includes(term));

                if (fieldsToSearch) {
                    return true;
                }

                return invoice.lineItems.some((item) => normalise(item.description).includes(term));
            })
            .map((invoice) => {
                const matchedLineItems = term
                    ? invoice.lineItems.filter((item) => normalise(item.description).includes(term))
                    : [];
                const notesMatch = Boolean(term && invoice.notes && normalise(invoice.notes).includes(term));
                return { invoice, matchedLineItems, notesMatch };
            });
    }, [criteria, invoices, open]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="global-search-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="global-search-panel">
                <div className="global-search-header">
                    <div>
                        <h2 id="global-search-title">{t('globalSearch.title')}</h2>
                        <p className="global-search-subtitle">{t('globalSearch.subtitle')}</p>
                    </div>
                    <button type="button" className="global-search-close" onClick={onClose}>
                        <span aria-hidden="true">&times;</span>
                        <span className="visually-hidden">{t('globalSearch.close')}</span>
                    </button>
                </div>
                <div className="global-search-content">
                    <form className="global-search-form" onSubmit={(event) => event.preventDefault()}>
                        <div className="global-search-form__group">
                            <label htmlFor="global-search-term">{t('globalSearch.fields.searchTerm')}</label>
                            <input
                                ref={searchInputRef}
                                id="global-search-term"
                                name="searchTerm"
                                type="search"
                                placeholder={t('globalSearch.placeholders.searchTerm')}
                                value={criteria.searchTerm}
                                onChange={handleCriteriaChange}
                            />
                        </div>
                        <div className="global-search-form__grid">
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-invoice">{t('globalSearch.fields.invoiceNumber')}</label>
                                <input
                                    id="global-search-invoice"
                                    name="invoiceNumber"
                                    type="search"
                                    value={criteria.invoiceNumber}
                                    placeholder={t('globalSearch.placeholders.invoiceNumber')}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-seller">{t('globalSearch.fields.sellerName')}</label>
                                <input
                                    id="global-search-seller"
                                    name="sellerName"
                                    type="search"
                                    value={criteria.sellerName}
                                    placeholder={t('globalSearch.placeholders.sellerName')}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-buyer">{t('globalSearch.fields.buyerName')}</label>
                                <input
                                    id="global-search-buyer"
                                    name="buyerName"
                                    type="search"
                                    value={criteria.buyerName}
                                    placeholder={t('globalSearch.placeholders.buyerName')}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                        </div>
                        <div className="global-search-form__grid">
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-date">{t('globalSearch.fields.saleDate')}</label>
                                <input
                                    id="global-search-date"
                                    name="saleDate"
                                    type="date"
                                    value={criteria.saleDate}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-start">{t('globalSearch.fields.startDate')}</label>
                                <input
                                    id="global-search-start"
                                    name="startDate"
                                    type="date"
                                    value={criteria.startDate}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                            <div className="global-search-form__group">
                                <label htmlFor="global-search-end">{t('globalSearch.fields.endDate')}</label>
                                <input
                                    id="global-search-end"
                                    name="endDate"
                                    type="date"
                                    value={criteria.endDate}
                                    onChange={handleCriteriaChange}
                                />
                            </div>
                        </div>
                    </form>
                    <div className="global-search-results">
                        <h3>{t('globalSearch.resultsHeading', { count: filteredInvoices.length })}</h3>
                        {filteredInvoices.length === 0 ? (
                            <p className="global-search-empty">{t('globalSearch.empty')}</p>
                        ) : (
                            <ul className="global-search-results__list">
                                {filteredInvoices.map(({ invoice, matchedLineItems, notesMatch }) => (
                                    <li key={invoice.id} className="global-search-result">
                                        <div className="global-search-result__summary">
                                            <div>
                                                <span className="global-search-result__label">{t('sales.invoiceNumberLabel')}:</span>{' '}
                                                <strong>{invoice.invoiceNumber}</strong>
                                            </div>
                                            <div>
                                                <span className="global-search-result__label">{t('sales.saleDateLabel')}:</span>{' '}
                                                <span>{invoice.saleDate}</span>
                                            </div>
                                            <div>
                                                <span className="global-search-result__label">{t('sales.sellerLabel')}:</span>{' '}
                                                <span>{invoice.sellerName}</span>
                                            </div>
                                            <div>
                                                <span className="global-search-result__label">{t('sales.buyerLabel')}:</span>{' '}
                                                <span>{invoice.buyerName}</span>
                                            </div>
                                            <div>
                                                <span className="global-search-result__label">{t('sales.totalLabel')}:</span>{' '}
                                                <span>{invoice.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {(matchedLineItems.length > 0 || notesMatch) && (
                                            <div className="global-search-result__matches">
                                                {matchedLineItems.length > 0 && (
                                                    <div>
                                                        <p className="global-search-result__matches-title">
                                                            {t('globalSearch.matches.lineItems')}
                                                        </p>
                                                        <ul>
                                                            {matchedLineItems.map((item) => (
                                                                <li key={item.id}>
                                                                    <span>{item.description}</span>
                                                                    <span className="global-search-result__matches-meta">
                                                                        ×{item.quantity} · {item.unitPrice.toLocaleString()}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {notesMatch && (
                                                    <p className="global-search-result__matches-note">
                                                        {t('globalSearch.matches.notes')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
