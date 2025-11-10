import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoice';
import { TireEntity, TireSnapshot } from './tire';
import { ImporterSummary } from './importer';
import { MerchantSummary } from './merchant';

@Entity({ name: 'invoice_line_items' })
export class InvoiceLineItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InvoiceEntity, (invoice) => invoice.lineItems, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'invoice_id' })
    invoice!: InvoiceEntity;

    @ManyToOne(() => TireEntity, (tire) => tire.sales, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'tire_id' })
    tire?: TireEntity | null;

    @Column({ length: 255 })
    description!: string;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ name: 'unit_price', type: 'numeric', precision: 12, scale: 2 })
    unitPrice!: number;

    @Column({ name: 'line_total', type: 'numeric', precision: 12, scale: 2 })
    lineTotal!: number;

    @Column({ name: 'importer_snapshot', type: 'jsonb', nullable: true })
    importerSnapshot?: ImporterSummary;

    @Column({ name: 'buyer_snapshot', type: 'jsonb', nullable: true })
    buyerSnapshot?: MerchantSummary;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}

export interface InvoiceLineItemDetail {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    tire?: TireSnapshot;
    importer?: ImporterSummary;
}
