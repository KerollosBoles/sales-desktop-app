import { User } from '../../models/user';

const users: User[] = [];

export const registerUser = (user: User): boolean => {
    if (users.find(u => u.username === user.username)) {
        return false; // User already exists
    }
    users.push(user);
    return true;
};

export const loginUser = (username: string, password: string): User | null => {
    const user = users.find(u => u.username === username && u.password === password);
    return user || null; // Return user if found, otherwise null
};

export const logoutUser = (username: string): void => {
    // Logic for logging out the user can be implemented here
};

export const getUserPermissions = (username: string): string[] => {
    const user = users.find(u => u.username === username);
    return user ? user.permissions : []; // Return user permissions if found
};