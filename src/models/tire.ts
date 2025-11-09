import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ImporterEntity, ImporterSummary } from './importer';
import { InvoiceLineItemEntity } from './invoice-line-item';
import { PurchaseOrderEntity, PurchaseSnapshot } from './purchase-order';

@Entity({ name: 'tires' })
export class TireEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 60 })
    sku!: string;

    @Column({ length: 120 })
    brand!: string;

    @Column({ length: 120, nullable: true })
    model?: string;

    @Column({ length: 60, nullable: true })
    size?: string;

    @ManyToOne(() => ImporterEntity, (importer) => importer.tires, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'importer_id' })
    importer?: ImporterEntity | null;

    @Column({ name: 'purchase_reference', length: 60, nullable: true })
    purchaseReference?: string;

    @Column({ name: 'has_remaining_stock', type: 'boolean', default: true })
    hasRemainingStock!: boolean;

    @Column({ name: 'quantity_on_hand', type: 'int', default: 0 })
    quantityOnHand!: number;

    @Column({ name: 'last_purchase_at', type: 'timestamptz', nullable: true })
    lastPurchaseAt?: Date;

    @Column({ name: 'last_sale_at', type: 'timestamptz', nullable: true })
    lastSaleAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => InvoiceLineItemEntity, (line) => line.tire)
    sales!: InvoiceLineItemEntity[];

    @OneToMany(() => PurchaseOrderEntity, (order) => order.tire)
    purchaseOrders!: PurchaseOrderEntity[];
}

export interface TireSnapshot {
    id: string;
    sku: string;
    brand: string;
    model?: string;
    size?: string;
    importer?: ImporterSummary;
    hasRemainingStock: boolean;
    quantityOnHand: number;
    lastPurchaseAt?: string;
    lastSaleAt?: string;
    recentPurchases?: PurchaseSnapshot[];
    suggestedSalePrice?: number;
}
