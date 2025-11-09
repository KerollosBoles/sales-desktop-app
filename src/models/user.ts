export interface User {
    id: number;
    username: string;
    password: string;
    role: 'owner' | 'employee';
    createdAt: Date;
    updatedAt: Date;
}

export class UserModel {
    constructor(public user: User) {}

    static createUser(username: string, password: string, role: 'owner' | 'employee'): User {
        return {
            id: Date.now(), // Simple ID generation for example purposes
            username,
            password,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static updateUser(user: User, updates: Partial<User>): User {
        return { ...user, ...updates, updatedAt: new Date() };
    }
}