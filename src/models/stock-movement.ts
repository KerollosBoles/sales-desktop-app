import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TireEntity } from './tire';
import { InvoiceLineItemEntity } from './invoice-line-item';
import { PurchaseOrderEntity } from './purchase-order';

@Entity({ name: 'stock_movements' })
export class StockMovementEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => TireEntity, (tire) => tire.sales, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'tire_id' })
    tire!: TireEntity;

    @Column({ name: 'movement_type', length: 20 })
    movementType!: 'purchase' | 'sale' | 'adjustment';

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ name: 'movement_date', type: 'timestamptz' })
    movementDate!: Date;

    @ManyToOne(() => InvoiceLineItemEntity, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'invoice_line_item_id' })
    invoiceLineItem?: InvoiceLineItemEntity | null;

    @ManyToOne(() => PurchaseOrderEntity, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder?: PurchaseOrderEntity | null;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
