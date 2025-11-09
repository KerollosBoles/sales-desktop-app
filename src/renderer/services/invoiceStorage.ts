import { Invoice } from '../../models/invoice';

const STORAGE_KEY = 'sales-desktop-app/invoices';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

const readStorage = (): Invoice[] => {
    if (!isBrowser) {
        return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as Invoice[];
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed;
    } catch (error) {
        console.error('Failed to parse invoices from storage', error);
        return [];
    }
};

const writeStorage = (invoices: Invoice[]): void => {
    if (!isBrowser) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

export const loadInvoices = (): Invoice[] => {
    const invoices = readStorage();
    return invoices.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const saveInvoice = (invoice: Invoice): Invoice => {
    const existing = readStorage();
    const updated = [...existing.filter((inv) => inv.id !== invoice.id), invoice];
    writeStorage(updated);
    return invoice;
};

export const deleteInvoice = (invoiceId: string): void => {
    const existing = readStorage();
    writeStorage(existing.filter((invoice) => invoice.id !== invoiceId));
};

export const replaceInvoices = (invoices: Invoice[]): void => {
    writeStorage(invoices);
};
