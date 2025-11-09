import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ImporterEntity } from './importer';
import { TireEntity } from './tire';

@Entity({ name: 'purchase_orders' })
export class PurchaseOrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'purchase_number', unique: true, length: 60 })
    purchaseNumber!: string;

    @ManyToOne(() => ImporterEntity, (importer) => importer.purchases, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'importer_id' })
    importer!: ImporterEntity;

    @ManyToOne(() => TireEntity, (tire) => tire.purchaseOrders, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tire_id' })
    tire!: TireEntity;

    @Column({ name: 'purchase_date', type: 'timestamptz' })
    purchaseDate!: Date;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2 })
    unitCost!: number;

    @Column({ name: 'total_cost', type: 'numeric', precision: 12, scale: 2 })
    totalCost!: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}

export interface PurchaseSnapshot {
    id: string;
    purchaseNumber: string;
    purchaseDate: string;
    quantity: number;
    unitCost: number;
}
