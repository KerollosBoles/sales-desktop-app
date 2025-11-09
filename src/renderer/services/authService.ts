import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { UserActivityLogEntity } from '../../models/user-activity-log';
import { UserEntity, UserRole, UserSummary } from '../../models/user';
import { ensureConnection } from './dbService';

const SALT_ROUNDS = 10;

export interface AuthenticatedUser extends UserSummary {
    lastLoginAt?: string;
}

export interface AuthSession {
    token: string;
    user: AuthenticatedUser;
}

export interface RegisterPrimaryAccountInput {
    username: string;
    password: string;
    confirmPassword: string;
    role: Exclude<UserRole, 'employee'>;
    fullName?: string;
    phone?: string;
    companyName?: string;
}

export interface RegisterEmployeeInput {
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    canIssueInvoices?: boolean;
}

const toAuthenticatedUser = (user: UserEntity): AuthenticatedUser => ({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName ?? undefined,
    phone: user.phone ?? undefined,
    companyName: user.companyName ?? undefined,
    canIssueInvoices: Boolean(user.canIssueInvoices),
    canManageInventory: Boolean(user.canManageInventory),
    canManageTeam: Boolean(user.canManageTeam),
    managedById: user.managedBy?.id ?? undefined,
    lastLoginAt: user.lastLoginAt?.toISOString(),
});

const recordActivity = async (
    user: UserEntity | null,
    activityType: string,
    activityContext?: Record<string, unknown>
): Promise<void> => {
    const conn = await ensureConnection();
    const logRepo = conn.getRepository(UserActivityLogEntity);

    const log = logRepo.create({
        user: user ?? undefined,
        activityType,
        activityContext,
    });

    await logRepo.save(log);
};

export const registerPrimaryAccount = async (
    input: RegisterPrimaryAccountInput
): Promise<AuthSession> => {
    if (input.password !== input.confirmPassword) {
        throw new Error('auth.passwordsDoNotMatch');
    }

    const conn = await ensureConnection();
    const userRepo = conn.getRepository(UserEntity);

    const existing = await userRepo.findOne({ where: { username: input.username } });
    if (existing) {
        throw new Error('auth.usernameTaken');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const isOwner = input.role === 'owner';
    const isPartner = input.role === 'partner';

    const user = userRepo.create({
        username: input.username,
        password: hashedPassword,
        role: input.role,
        fullName: input.fullName,
        phone: input.phone,
        companyName: input.companyName,
        canIssueInvoices: true,
        canManageInventory: isOwner || isPartner,
        canManageTeam: true,
    });

    const saved = await userRepo.save(user);
    await recordActivity(saved, 'account.registered', {
        role: input.role,
        companyName: input.companyName,
    });

    const token = uuid();
    return {
        token,
        user: toAuthenticatedUser(saved),
    };
};

export const login = async (username: string, password: string): Promise<AuthSession> => {
    const conn = await ensureConnection();
    const userRepo = conn.getRepository(UserEntity);

    const user = await userRepo.findOne({ where: { username }, relations: ['managedBy'] });
    if (!user) {
        throw new Error('auth.invalidCredentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        await recordActivity(user, 'security.failed_login', { username });
        throw new Error('auth.invalidCredentials');
    }

    user.lastLoginAt = new Date();
    await userRepo.save(user);

    await recordActivity(user, 'auth.login', { username });

    const token = uuid();
    return {
        token,
        user: toAuthenticatedUser(user),
    };
};

export const logout = async (userId: string): Promise<void> => {
    const conn = await ensureConnection();
    const userRepo = conn.getRepository(UserEntity);
    const user = await userRepo.findOne(userId);

    await recordActivity(user ?? null, 'auth.logout', { userId });
};

export const createEmployeeAccount = async (
    managerId: string,
    input: RegisterEmployeeInput
): Promise<UserSummary> => {
    const conn = await ensureConnection();
    const userRepo = conn.getRepository(UserEntity);

    const manager = await userRepo.findOne(managerId);
    if (!manager) {
        throw new Error('auth.managerNotFound');
    }

    if (manager.role === 'employee') {
        throw new Error('auth.managerPrivilegesRequired');
    }

    if (!manager.canManageTeam) {
        throw new Error('auth.managerPrivilegesRequired');
    }

    const existing = await userRepo.findOne({ where: { username: input.username } });
    if (existing) {
        throw new Error('auth.usernameTaken');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const employee = userRepo.create({
        username: input.username,
        password: hashedPassword,
        role: 'employee',
        fullName: input.fullName,
        phone: input.phone,
        managedBy: manager,
        canIssueInvoices: input.canIssueInvoices ?? true,
        canManageInventory: false,
        canManageTeam: false,
    });

    const saved = await userRepo.save(employee);
    await recordActivity(manager, 'team.create_employee', {
        employeeId: saved.id,
        employeeUsername: saved.username,
    });

    return {
        id: saved.id,
        username: saved.username,
        role: saved.role,
        fullName: saved.fullName ?? undefined,
        phone: saved.phone ?? undefined,
        companyName: saved.companyName ?? undefined,
        canIssueInvoices: Boolean(saved.canIssueInvoices),
        canManageInventory: Boolean(saved.canManageInventory),
        canManageTeam: Boolean(saved.canManageTeam),
        managedById: manager.id,
    };
};

export const getTeamMembers = async (managerId: string): Promise<UserSummary[]> => {
    const conn = await ensureConnection();
    const userRepo = conn.getRepository(UserEntity);

    const team = await userRepo.find({
        where: { managedBy: managerId },
        relations: ['managedBy'],
        order: { createdAt: 'DESC' },
    });

    return team.map((member) => ({
        id: member.id,
        username: member.username,
        role: member.role,
        fullName: member.fullName ?? undefined,
        phone: member.phone ?? undefined,
        companyName: member.companyName ?? undefined,
        canIssueInvoices: Boolean(member.canIssueInvoices),
        canManageInventory: Boolean(member.canManageInventory),
        canManageTeam: Boolean(member.canManageTeam),
        managedById: member.managedBy?.id ?? undefined,
    }));
};

export const getActivityTrail = async (userId: string, limit = 10) => {
    const conn = await ensureConnection();
    const logRepo = conn.getRepository(UserActivityLogEntity);

    const logs = await logRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: limit,
    });

    return logs.map((log) => ({
        id: log.id,
        activityType: log.activityType,
        activityContext: log.activityContext ?? undefined,
        createdAt: log.createdAt.toISOString(),
    }));
};
