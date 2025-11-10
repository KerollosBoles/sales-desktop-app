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
import { InvoiceEntity } from './invoice';
import { UserActivityLogEntity } from './user-activity-log';

export type UserRole = 'owner' | 'partner' | 'employee';

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 50 })
    username!: string;

    @Column()
    password!: string;

    @Column({ length: 20 })
    role!: UserRole;

    @ManyToOne(() => UserEntity, (user) => user.teamMembers, { nullable: true })
    @JoinColumn({ name: 'managed_by' })
    managedBy?: UserEntity | null;

    @Column({ name: 'full_name', length: 150, nullable: true })
    fullName?: string;

    @Column({ length: 30, nullable: true })
    phone?: string;

    @Column({ name: 'company_name', length: 180, nullable: true })
    companyName?: string;

    @Column({ name: 'can_issue_invoices', default: true })
    canIssueInvoices!: boolean;

    @Column({ name: 'can_manage_inventory', default: false })
    canManageInventory!: boolean;

    @Column({ name: 'can_manage_team', default: false })
    canManageTeam!: boolean;

    @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
    lastLoginAt?: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToMany(() => InvoiceEntity, (invoice) => invoice.seller)
    sales!: InvoiceEntity[];

    @OneToMany(() => UserEntity, (user) => user.managedBy)
    teamMembers!: UserEntity[];

    @OneToMany(() => UserActivityLogEntity, (log) => log.user)
    activityLogs!: UserActivityLogEntity[];
}

export interface UserSummary {
    id: string;
    username: string;
    role: UserRole;
    fullName?: string;
    phone?: string;
    companyName?: string;
    canIssueInvoices: boolean;
    canManageInventory: boolean;
    canManageTeam: boolean;
    managedById?: string;
}
