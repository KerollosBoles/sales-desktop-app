import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user';

@Entity({ name: 'user_activity_logs' })
export class UserActivityLogEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.activityLogs, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user?: UserEntity | null;

    @Column({ name: 'activity_type', length: 40 })
    activityType!: string;

    @Column({ name: 'activity_context', type: 'jsonb', nullable: true })
    activityContext?: Record<string, unknown> | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}

export interface UserActivityLog {
    id: string;
    userId?: string;
    activityType: string;
    activityContext?: Record<string, unknown>;
    createdAt: string;
}
