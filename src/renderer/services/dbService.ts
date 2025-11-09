import { createConnection, Connection } from 'typeorm';
import { User } from '../../models/user';
import { Item } from '../../models/item';
import { Transaction } from '../../models/transaction';

let connection: Connection;

export const connectToDatabase = async () => {
    connection = await createConnection();
};

export const getUsers = async () => {
    return await connection.getRepository(User).find();
};

export const getItems = async () => {
    return await connection.getRepository(Item).find();
};

export const getTransactions = async () => {
    return await connection.getRepository(Transaction).find();
};

export const addItem = async (itemData: Partial<Item>) => {
    const item = connection.getRepository(Item).create(itemData);
    return await connection.getRepository(Item).save(item);
};

export const addTransaction = async (transactionData: Partial<Transaction>) => {
    const transaction = connection.getRepository(Transaction).create(transactionData);
    return await connection.getRepository(Transaction).save(transaction);
};

export const updateItem = async (id: number, itemData: Partial<Item>) => {
    await connection.getRepository(Item).update(id, itemData);
};

export const deleteItem = async (id: number) => {
    await connection.getRepository(Item).delete(id);
};