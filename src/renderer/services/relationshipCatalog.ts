import { ImporterSummary } from '../../models/importer';
import { MerchantSummary } from '../../models/merchant';
import { TireSnapshot } from '../../models/tire';
import { UserSummary } from '../../models/user';

const importerCatalog: ImporterSummary[] = [
    {
        id: 'imp-continental',
        importerCode: 'IMP-001',
        name: 'Continental Auto Imports',
        phone: '+20 100 555 1234',
        location: 'Alexandria Port',
        address: 'Dock 7, Alexandria Port Authority',
        email: 'operations@continental-imports.eg',
    },
    {
        id: 'imp-bridgestone',
        importerCode: 'IMP-002',
        name: 'Bridgestone Middle East',
        phone: '+20 122 777 2345',
        location: 'Port Said',
        address: 'Warehouse 12, Free Zone, Port Said',
        email: 'sales@bridgestone-mea.com',
    },
];

const sellerCatalog: UserSummary[] = [
    {
        id: 'seller-ahmed',
        username: 'ahmed.issa',
        role: 'owner',
        fullName: 'Ahmed Issa',
        phone: '+20 111 222 1111',
        companyName: 'Issa Auto Group',
        canIssueInvoices: true,
        canManageInventory: true,
        canManageTeam: true,
    },
    {
        id: 'seller-salma',
        username: 'salma.fouad',
        role: 'employee',
        fullName: 'Salma Fouad',
        phone: '+20 155 444 2020',
        companyName: 'Issa Auto Group',
        canIssueInvoices: true,
        canManageInventory: false,
        canManageTeam: false,
        managedById: 'seller-ahmed',
    },
];

const merchantCatalog: MerchantSummary[] = [
    {
        id: 'merchant-elmasry',
        merchantCode: 'MRC-450',
        displayName: 'El Masry Trading',
        contactName: 'Mostafa El Masry',
        phone: '+20 109 344 8899',
        email: 'mostafa@elmasry-trading.eg',
        address: '12 Talaat Harb St, Downtown Cairo',
        city: 'Cairo',
    },
    {
        id: 'merchant-alhassan',
        merchantCode: 'MRC-781',
        displayName: 'Al Hassan Automotive',
        contactName: 'Hassan Abdelrahman',
        phone: '+20 106 678 4411',
        email: 'hassan@alhassan-auto.com',
        address: 'Industrial Zone, 6th of October City',
        city: 'Giza',
    },
];

const tireCatalog: TireSnapshot[] = [
    {
        id: 'tire-sportcontact5',
        sku: 'CONT-SC5-2254517',
        brand: 'Continental SportContact 5',
        model: '225/45 R17',
        size: '17 inch',
        importer: importerCatalog[0],
        hasRemainingStock: true,
        quantityOnHand: 42,
        lastPurchaseAt: '2024-01-12T08:30:00.000Z',
        lastSaleAt: '2024-03-28T14:05:00.000Z',
        recentPurchases: [
            {
                id: 'po-1001',
                purchaseNumber: 'PO-1001',
                purchaseDate: '2024-01-12T08:30:00.000Z',
                quantity: 60,
                unitCost: 950,
            },
        ],
        suggestedSalePrice: 1650,
    },
    {
        id: 'tire-turanza',
        sku: 'BRDG-TRZA-2055516',
        brand: 'Bridgestone Turanza T005',
        model: '205/55 R16',
        size: '16 inch',
        importer: importerCatalog[1],
        hasRemainingStock: true,
        quantityOnHand: 65,
        lastPurchaseAt: '2024-02-05T10:00:00.000Z',
        lastSaleAt: '2024-03-20T16:15:00.000Z',
        recentPurchases: [
            {
                id: 'po-2002',
                purchaseNumber: 'PO-2002',
                purchaseDate: '2024-02-05T10:00:00.000Z',
                quantity: 80,
                unitCost: 870,
            },
        ],
        suggestedSalePrice: 1490,
    },
];

export const getImporterCatalog = (): ImporterSummary[] => importerCatalog;
export const getSellerCatalog = (): UserSummary[] => sellerCatalog;
export const getMerchantCatalog = (): MerchantSummary[] => merchantCatalog;
export const getTireCatalog = (): TireSnapshot[] => tireCatalog;

export const findImporterById = (importerId: string): ImporterSummary | undefined =>
    importerCatalog.find((importer) => importer.id === importerId);

export const findMerchantById = (merchantId: string): MerchantSummary | undefined =>
    merchantCatalog.find((merchant) => merchant.id === merchantId);

export const findSellerById = (sellerId: string): UserSummary | undefined =>
    sellerCatalog.find((seller) => seller.id === sellerId);

export const findTireById = (tireId: string): TireSnapshot | undefined =>
    tireCatalog.find((tire) => tire.id === tireId);
