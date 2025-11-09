import { Connection, createConnection } from 'typeorm';
import { ImporterEntity, ImporterSummary } from '../../models/importer';
import { MerchantEntity, MerchantSummary } from '../../models/merchant';
import { TireEntity, TireSnapshot } from '../../models/tire';
import { InvoiceEntity, InvoiceRecord, InvoiceSummary } from '../../models/invoice';
import { InvoiceLineItemEntity, InvoiceLineItemDetail } from '../../models/invoice-line-item';
import { UserEntity, UserSummary } from '../../models/user';
import { PurchaseOrderEntity, PurchaseSnapshot } from '../../models/purchase-order';

let connection: Connection | null = null;

export const ensureConnection = async (): Promise<Connection> => {
    if (connection?.isConnected) {
        return connection;
    }

    connection = await createConnection();
    return connection;
};

const toUserSummary = (user: UserEntity): UserSummary => ({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName ?? undefined,
    phone: user.phone ?? undefined,
    companyName: user.companyName ?? undefined,
    canIssueInvoices: Boolean(user.canIssueInvoices),
    canManageInventory: Boolean(user.canManageInventory),
    canManageTeam: Boolean(user.canManageTeam),
    managedById: user.managedBy?.id ?? undefined,
});

const toImporterSummary = (importer?: ImporterEntity | null): ImporterSummary | undefined => {
    if (!importer) {
        return undefined;
    }

    return {
        id: importer.id,
        importerCode: importer.importerCode,
        name: importer.name,
        phone: importer.phone ?? undefined,
        location: importer.location ?? undefined,
        address: importer.address ?? undefined,
        email: importer.email ?? undefined,
    };
};

const toMerchantSummary = (merchant: MerchantEntity): MerchantSummary => ({
    id: merchant.id,
    merchantCode: merchant.merchantCode,
    displayName: merchant.displayName,
    contactName: merchant.contactName ?? undefined,
    phone: merchant.phone ?? undefined,
    email: merchant.email ?? undefined,
    address: merchant.address ?? undefined,
    city: merchant.city ?? undefined,
});

const toInvoiceSummary = (invoice: InvoiceEntity): InvoiceSummary => ({
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    saleDate: invoice.invoiceDate.toISOString(),
    totalAmount: Number(invoice.totalAmount || 0),
});

const toTireSnapshot = (tire?: TireEntity | null): TireSnapshot | undefined => {
    if (!tire) {
        return undefined;
    }

    return {
        id: tire.id,
        sku: tire.sku,
        brand: tire.brand,
        model: tire.model ?? undefined,
        size: tire.size ?? undefined,
        importer: toImporterSummary(tire.importer ?? undefined),
        hasRemainingStock: Boolean(tire.hasRemainingStock),
        quantityOnHand: tire.quantityOnHand ?? 0,
        lastPurchaseAt: tire.lastPurchaseAt ? tire.lastPurchaseAt.toISOString() : undefined,
        lastSaleAt: tire.lastSaleAt ? tire.lastSaleAt.toISOString() : undefined,
        recentPurchases: (tire.purchaseOrders || [])
            .sort((a, b) => (b.purchaseDate?.getTime?.() || 0) - (a.purchaseDate?.getTime?.() || 0))
            .slice(0, 5)
            .map((order) => ({
                id: order.id,
                purchaseNumber: order.purchaseNumber,
                purchaseDate: order.purchaseDate.toISOString(),
                quantity: order.quantity,
                unitCost: Number(order.unitCost || 0),
            })),
    };
};

const toPurchaseSnapshot = (order: PurchaseOrderEntity): PurchaseSnapshot => ({
    id: order.id,
    purchaseNumber: order.purchaseNumber,
    purchaseDate: order.purchaseDate.toISOString(),
    quantity: order.quantity,
    unitCost: Number(order.unitCost || 0),
});

const toInvoiceLineItem = (line: InvoiceLineItemEntity): InvoiceLineItemDetail => ({
    id: line.id,
    description: line.description,
    quantity: line.quantity,
    unitPrice: Number(line.unitPrice || 0),
    lineTotal: Number(line.lineTotal || 0),
    tire: toTireSnapshot(line.tire ?? undefined),
    importer: line.importerSnapshot ?? toImporterSummary(line.tire?.importer ?? undefined),
});

const toInvoiceRecord = (invoice: InvoiceEntity): InvoiceRecord => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    saleDate: invoice.invoiceDate.toISOString(),
    buyer: {
        id: invoice.buyer.id,
        code: invoice.buyer.merchantCode,
        name: invoice.buyer.displayName,
        phone: invoice.buyer.phone ?? undefined,
        address: invoice.buyer.address ?? undefined,
        location: invoice.buyer.city ?? undefined,
        email: invoice.buyer.email ?? undefined,
        previousInvoices: (invoice.buyer.invoices || [])
            .filter((item) => item.id !== invoice.id)
            .map(toInvoiceSummary)
            .sort((a, b) => b.saleDate.localeCompare(a.saleDate))
            .slice(0, 10),
    },
    seller: toUserSummary(invoice.seller),
    lineItems: (invoice.lineItems || []).map(toInvoiceLineItem),
    totalAmount: Number(invoice.totalAmount || 0),
    notes: invoice.notes ?? undefined,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt?.toISOString(),
});

export const getImporters = async (): Promise<ImporterSummary[]> => {
    const conn = await ensureConnection();
    const repo = conn.getRepository(ImporterEntity);
    const importers = await repo.find({ order: { name: 'ASC' } });
    return importers.map(toImporterSummary).filter((value): value is ImporterSummary => Boolean(value));
};

export const getMerchantsWithHistory = async (): Promise<MerchantSummary[]> => {
    const conn = await ensureConnection();
    const repo = conn.getRepository(MerchantEntity);
    const merchants = await repo.find({ order: { displayName: 'ASC' }, relations: ['invoices'] });
    return merchants.map(toMerchantSummary);
};

export const getTireInventory = async (): Promise<TireSnapshot[]> => {
    const conn = await ensureConnection();
    const repo = conn.getRepository(TireEntity);
    const tires = await repo.find({
        relations: ['importer', 'purchaseOrders'],
        order: { brand: 'ASC', model: 'ASC' },
    });
    return tires.map((tire) => toTireSnapshot(tire)!).filter(Boolean);
};

export const getInvoiceNetwork = async (): Promise<InvoiceRecord[]> => {
    const conn = await ensureConnection();
    const repo = conn.getRepository(InvoiceEntity);
    const invoices = await repo.find({
        order: { invoiceDate: 'DESC' },
        relations: ['buyer', 'buyer.invoices', 'seller', 'lineItems', 'lineItems.tire', 'lineItems.tire.importer', 'lineItems.tire.purchaseOrders'],
    });
    return invoices.map(toInvoiceRecord);
};

export const getPurchaseOrders = async (): Promise<PurchaseSnapshot[]> => {
    const conn = await ensureConnection();
    const repo = conn.getRepository(PurchaseOrderEntity);
    const orders = await repo.find({
        relations: ['importer', 'tire'],
        order: { purchaseDate: 'DESC' },
    });
    return orders.map(toPurchaseSnapshot);
};

export interface NewPurchaseOrderInput {
    importerId: string;
    tireId: string;
    quantity: number;
    unitCost: number;
    purchaseDate: string;
    notes?: string;
    purchaseNumber?: string;
}

export const createPurchaseOrder = async (input: NewPurchaseOrderInput): Promise<PurchaseSnapshot> => {
    const conn = await ensureConnection();
    const purchaseRepo = conn.getRepository(PurchaseOrderEntity);
    const importerRepo = conn.getRepository(ImporterEntity);
    const tireRepo = conn.getRepository(TireEntity);

    const importer = await importerRepo.findOneOrFail(input.importerId);
    const tire = await tireRepo.findOneOrFail(input.tireId);

    const purchase = purchaseRepo.create({
        purchaseNumber: input.purchaseNumber ?? `PO-${Date.now()}`,
        importer,
        tire,
        purchaseDate: new Date(input.purchaseDate),
        quantity: input.quantity,
        unitCost: input.unitCost,
        totalCost: input.quantity * input.unitCost,
        notes: input.notes,
    });

    const saved = await purchaseRepo.save(purchase);

    tire.quantityOnHand = (tire.quantityOnHand ?? 0) + input.quantity;
    tire.lastPurchaseAt = new Date(input.purchaseDate);
    tire.hasRemainingStock = tire.quantityOnHand > 0;
    await tireRepo.save(tire);

    return toPurchaseSnapshot(saved);
};
