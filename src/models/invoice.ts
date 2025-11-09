export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    saleDate: string; // ISO date string (yyyy-mm-dd)
    sellerName: string;
    buyerName: string;
    lineItems: InvoiceLineItem[];
    notes?: string;
    totalAmount: number;
    createdAt: string; // ISO timestamp when invoice was saved
}

export interface InvoiceSearchCriteria {
    searchTerm?: string;
    saleDate?: string;
    startDate?: string;
    endDate?: string;
    sellerName?: string;
    buyerName?: string;
    invoiceNumber?: string;
}
