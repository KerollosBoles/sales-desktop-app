export interface Transaction {
    id: number;
    itemId: number;
    buyerId: number;
    saleDate: Date;
    quantity: number;
    totalAmount: number;
    transactionType: 'sale' | 'purchase';
}