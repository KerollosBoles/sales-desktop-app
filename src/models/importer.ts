import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TireEntity } from './tire';
import { PurchaseOrderEntity } from './purchase-order';

@Entity({ name: 'importers' })
export class ImporterEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'importer_code', unique: true, length: 40 })
    importerCode!: string;

    @Column({ length: 150 })
    name!: string;

    @Column({ length: 30, nullable: true })
    phone?: string;

    @Column({ length: 150, nullable: true })
    location?: string;

    @Column({ length: 255, nullable: true })
    address?: string;

    @Column({ length: 150, nullable: true })
    email?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => TireEntity, (tire) => tire.importer)
    tires!: TireEntity[];

    @OneToMany(() => PurchaseOrderEntity, (order) => order.importer)
    purchases!: PurchaseOrderEntity[];
}

export interface ImporterSummary {
    id: string;
    importerCode: string;
    name: string;
    phone?: string;
    location?: string;
    address?: string;
    email?: string;
}
