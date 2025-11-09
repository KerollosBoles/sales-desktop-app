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
import { MerchantEntity, MerchantSummary } from './merchant';
import { UserEntity, UserSummary } from './user';
import { InvoiceLineItemEntity, InvoiceLineItemDetail } from './invoice-line-item';

@Entity({ name: 'invoices' })
export class InvoiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'invoice_number', unique: true, length: 60 })
    invoiceNumber!: string;

    @ManyToOne(() => MerchantEntity, (merchant) => merchant.invoices, {
        onDelete: 'RESTRICT',
        nullable: false,
    })
    @JoinColumn({ name: 'buyer_id' })
    buyer!: MerchantEntity;

    @ManyToOne(() => UserEntity, (user) => user.sales, {
        onDelete: 'RESTRICT',
        nullable: false,
    })
    @JoinColumn({ name: 'seller_id' })
    seller!: UserEntity;

    @Column({ name: 'invoice_date', type: 'timestamptz' })
    invoiceDate!: Date;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
    totalAmount!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => InvoiceLineItemEntity, (line) => line.invoice, {
        cascade: true,
    })
    lineItems!: InvoiceLineItemEntity[];
}

export interface InvoicePartyDetails {
    id: string;
    code: string;
    name: string;
    phone?: string;
    address?: string;
    location?: string;
    email?: string;
    previousInvoices?: InvoiceSummary[];
}

export interface InvoiceSummary {
    invoiceId: string;
    invoiceNumber: string;
    saleDate: string;
    totalAmount: number;
}

export interface InvoiceRecord {
    id: string;
    invoiceNumber: string;
    saleDate: string;
    buyer: InvoicePartyDetails;
    seller: UserSummary;
    lineItems: InvoiceLineItemDetail[];
    totalAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

export type Invoice = InvoiceRecord;
