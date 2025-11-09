import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { InvoiceEntity } from './invoice';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 50 })
    username!: string;

    @Column()
    password!: string;

    @Column({ length: 20 })
    role!: 'owner' | 'employee';

    @Column({ name: 'full_name', length: 150, nullable: true })
    fullName?: string;

    @Column({ length: 30, nullable: true })
    phone?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => InvoiceEntity, (invoice) => invoice.seller)
    sales!: InvoiceEntity[];
}

export interface UserSummary {
    id: string;
    username: string;
    role: 'owner' | 'employee';
    fullName?: string;
    phone?: string;
}
