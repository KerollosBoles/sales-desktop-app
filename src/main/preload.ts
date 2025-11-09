import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    login: (username, password) => ipcRenderer.invoke('login', username, password),
    getSales: () => ipcRenderer.invoke('getSales'),
    getPurchases: () => ipcRenderer.invoke('getPurchases'),
    addItem: (item) => ipcRenderer.invoke('addItem', item),
    updateItem: (item) => ipcRenderer.invoke('updateItem', item),
    deleteItem: (itemId) => ipcRenderer.invoke('deleteItem', itemId),
    checkPermissions: (role) => ipcRenderer.invoke('checkPermissions', role),
});