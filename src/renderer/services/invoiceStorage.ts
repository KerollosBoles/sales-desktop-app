import { Invoice, InvoiceRecord, InvoiceSummary } from '../../models/invoice';
import { InvoiceLineItemDetail } from '../../models/invoice-line-item';
import { getMerchantCatalog, getSellerCatalog, getTireCatalog } from './relationshipCatalog';

const STORAGE_KEY = 'sales-desktop-app/invoices/v2';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

const calculateLineTotal = (line: InvoiceLineItemDetail): InvoiceLineItemDetail => ({
    ...line,
    lineTotal: Math.round((line.quantity * line.unitPrice + Number.EPSILON) * 100) / 100,
});

const ensureBuyerHistory = (invoices: InvoiceRecord[]): InvoiceRecord[] => {
    const sorted = [...invoices].sort((a, b) => a.saleDate.localeCompare(b.saleDate));
    const history = new Map<string, InvoiceSummary[]>();

    const withHistory = sorted.map((invoice) => {
        const buyerHistory = history.get(invoice.buyer.id) ?? [];
        const enriched: InvoiceRecord = {
            ...invoice,
            buyer: {
                ...invoice.buyer,
                previousInvoices: buyerHistory.slice(-10).reverse(),
            },
        };

        const nextEntry: InvoiceSummary = {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            saleDate: invoice.saleDate,
            totalAmount: invoice.totalAmount,
        };
        history.set(invoice.buyer.id, [...buyerHistory, nextEntry]);
        return enriched;
    });

    return withHistory.sort((a, b) => b.saleDate.localeCompare(a.saleDate));
};

const readStorage = (): InvoiceRecord[] => {
    if (!isBrowser) {
        return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as InvoiceRecord[];
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map((invoice) => ({
            ...invoice,
            lineItems: invoice.lineItems.map(calculateLineTotal),
        }));
    } catch (error) {
        console.error('Failed to parse invoices from storage', error);
        return [];
    }
};

const writeStorage = (invoices: InvoiceRecord[]): void => {
    if (!isBrowser) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
};

const buildSeedInvoices = (): InvoiceRecord[] => {
    const merchants = getMerchantCatalog();
    const sellers = getSellerCatalog();
    const tires = getTireCatalog();

    const firstInvoice: InvoiceRecord = {
        id: 'inv-seed-001',
        invoiceNumber: 'INV-2024-0001',
        saleDate: '2024-03-28',
        buyer: {
            id: merchants[0].id,
            code: merchants[0].merchantCode,
            name: merchants[0].displayName,
            phone: merchants[0].phone,
            address: merchants[0].address,
            location: merchants[0].city,
            email: merchants[0].email,
        },
        seller: sellers[0],
        lineItems: [
            calculateLineTotal({
                id: 'inv-seed-001-line-1',
                description: `${tires[0].brand} ${tires[0].model}`,
                quantity: 12,
                unitPrice: 1450,
                lineTotal: 0,
                tire: tires[0],
                importer: tires[0].importer,
            }),
        ],
        totalAmount: 12 * 1450,
        notes: 'Regular restock for taxi fleet.',
        createdAt: new Date('2024-03-28T14:05:00.000Z').toISOString(),
        updatedAt: new Date('2024-03-28T14:06:00.000Z').toISOString(),
    };

    const secondInvoice: InvoiceRecord = {
        id: 'inv-seed-002',
        invoiceNumber: 'INV-2024-0002',
        saleDate: '2024-03-20',
        buyer: {
            id: merchants[1].id,
            code: merchants[1].merchantCode,
            name: merchants[1].displayName,
            phone: merchants[1].phone,
            address: merchants[1].address,
            location: merchants[1].city,
            email: merchants[1].email,
        },
        seller: sellers[1],
        lineItems: [
            calculateLineTotal({
                id: 'inv-seed-002-line-1',
                description: `${tires[1].brand} ${tires[1].model}`,
                quantity: 20,
                unitPrice: 1325,
                lineTotal: 0,
                tire: tires[1],
                importer: tires[1].importer,
            }),
        ],
        totalAmount: 20 * 1325,
        notes: 'High demand order for dealership showroom.',
        createdAt: new Date('2024-03-20T16:16:00.000Z').toISOString(),
        updatedAt: new Date('2024-03-21T08:00:00.000Z').toISOString(),
    };

    return ensureBuyerHistory([firstInvoice, secondInvoice]);
};

export const loadInvoices = (): InvoiceRecord[] => {
    const invoices = readStorage();
    if (!invoices.length) {
        const seeded = buildSeedInvoices();
        writeStorage(seeded);
        return seeded;
    }

    return ensureBuyerHistory(invoices);
};

export const saveInvoice = (invoice: InvoiceRecord): Invoice => {
    const existing = readStorage();
    const normalizedLineItems = invoice.lineItems.map(calculateLineTotal);
    const normalizedInvoice: InvoiceRecord = {
        ...invoice,
        lineItems: normalizedLineItems,
        totalAmount: normalizedLineItems.reduce((acc, item) => acc + item.lineTotal, 0),
    };

    const updated = [...existing.filter((inv) => inv.id !== invoice.id), normalizedInvoice];
    writeStorage(updated);
    return ensureBuyerHistory(updated).find((inv) => inv.id === invoice.id)!;
};

export const deleteInvoice = (invoiceId: string): void => {
    const existing = readStorage();
    const updated = existing.filter((invoice) => invoice.id !== invoiceId);
    writeStorage(updated);
};

export const replaceInvoices = (invoices: InvoiceRecord[]): void => {
    writeStorage(invoices.map((invoice) => ({
        ...invoice,
        lineItems: invoice.lineItems.map(calculateLineTotal),
    })));
};
