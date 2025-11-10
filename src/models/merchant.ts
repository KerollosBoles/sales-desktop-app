import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoice';

@Entity({ name: 'merchants' })
export class MerchantEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'merchant_code', unique: true, length: 40 })
    merchantCode!: string;

    @Column({ name: 'display_name', length: 150 })
    displayName!: string;

    @Column({ name: 'contact_name', length: 150, nullable: true })
    contactName?: string;

    @Column({ length: 30, nullable: true })
    phone?: string;

    @Column({ length: 150, nullable: true })
    email?: string;

    @Column({ length: 255, nullable: true })
    address?: string;

    @Column({ length: 150, nullable: true })
    city?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => InvoiceEntity, (invoice) => invoice.buyer)
    invoices!: InvoiceEntity[];
}

export interface MerchantSummary {
    id: string;
    merchantCode: string;
    displayName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
}
