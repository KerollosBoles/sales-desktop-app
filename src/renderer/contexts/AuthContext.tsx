import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
    AuthenticatedUser,
    AuthSession,
    RegisterEmployeeInput,
    RegisterPrimaryAccountInput,
    createEmployeeAccount,
    getActivityTrail,
    getTeamMembers,
    login as loginService,
    logout as logoutService,
    registerPrimaryAccount,
} from '../services/authService';
import { UserSummary } from '../../models/user';

export interface ActivityTrailItem {
    id: string;
    activityType: string;
    activityContext?: Record<string, unknown>;
    createdAt: string;
}

interface AuthContextValue {
    session?: AuthSession;
    user?: AuthenticatedUser;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (input: RegisterPrimaryAccountInput) => Promise<void>;
    logout: () => Promise<void>;
    teamMembers: UserSummary[];
    createEmployee: (input: RegisterEmployeeInput) => Promise<void>;
    refreshTeam: () => Promise<void>;
    activityTrail: ActivityTrailItem[];
    loadSecurityTrail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
    const [session, setSession] = useState<AuthSession | undefined>();
    const [teamMembers, setTeamMembers] = useState<UserSummary[]>([]);
    const [activityTrail, setActivityTrail] = useState<ActivityTrailItem[]>([]);

    const hydrateTeam = useCallback(
        async (currentUser?: AuthenticatedUser) => {
            if (!currentUser?.canManageTeam || !currentUser.id) {
                setTeamMembers([]);
                return;
            }

            const members = await getTeamMembers(currentUser.id);
            setTeamMembers(members);
        },
        []
    );

    const hydrateSecurityTrail = useCallback(
        async (currentUser?: AuthenticatedUser) => {
            if (!currentUser?.id) {
                setActivityTrail([]);
                return;
            }

            const items = await getActivityTrail(currentUser.id, 15);
            setActivityTrail(items);
        },
        []
    );

    const login = useCallback(
        async (username: string, password: string) => {
            const nextSession = await loginService(username, password);
            setSession(nextSession);
            await hydrateTeam(nextSession.user);
            await hydrateSecurityTrail(nextSession.user);
        },
        [hydrateSecurityTrail, hydrateTeam]
    );

    const register = useCallback(
        async (input: RegisterPrimaryAccountInput) => {
            const nextSession = await registerPrimaryAccount(input);
            setSession(nextSession);
            await hydrateTeam(nextSession.user);
            await hydrateSecurityTrail(nextSession.user);
        },
        [hydrateSecurityTrail, hydrateTeam]
    );

    const logout = useCallback(async () => {
        if (session?.user.id) {
            await logoutService(session.user.id);
        }
        setSession(undefined);
        setTeamMembers([]);
        setActivityTrail([]);
    }, [session]);

    const createEmployee = useCallback(
        async (input: RegisterEmployeeInput) => {
            if (!session?.user?.id) {
                throw new Error('auth.sessionMissing');
            }

            await createEmployeeAccount(session.user.id, input);
            await hydrateTeam(session.user);
            await hydrateSecurityTrail(session.user);
        },
        [hydrateSecurityTrail, hydrateTeam, session]
    );

    const refreshTeam = useCallback(async () => {
        await hydrateTeam(session?.user);
    }, [hydrateTeam, session]);

    const loadSecurityTrail = useCallback(async () => {
        await hydrateSecurityTrail(session?.user);
    }, [hydrateSecurityTrail, session]);

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user: session?.user,
            isAuthenticated: Boolean(session?.user),
            login,
            register,
            logout,
            teamMembers,
            createEmployee,
            refreshTeam,
            activityTrail,
            loadSecurityTrail,
        }),
        [
            session,
            login,
            register,
            logout,
            teamMembers,
            createEmployee,
            refreshTeam,
            activityTrail,
            loadSecurityTrail,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
};
