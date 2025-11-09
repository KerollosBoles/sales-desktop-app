import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface PermissionGateProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ allowedRoles, children }) => {
    const userRole = useSelector((state: RootState) => state.auth.userRole);

    if (!allowedRoles.includes(userRole)) {
        return <div>Access Denied</div>;
    }

    return <>{children}</>;
};

export default PermissionGate;