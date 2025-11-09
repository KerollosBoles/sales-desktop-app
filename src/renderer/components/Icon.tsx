import React from 'react';

type IconName =
    | 'dashboard'
    | 'sales'
    | 'purchases'
    | 'search'
    | 'close'
    | 'plus'
    | 'minus'
    | 'printer'
    | 'trash'
    | 'calendar'
    | 'user'
    | 'file-text'
    | 'lock'
    | 'refresh'
    | 'save';

interface IconProps extends React.SVGAttributes<SVGElement> {
    name: IconName;
    size?: number;
}

const paths: Record<IconName, string> = {
    dashboard:
        'M4 3h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm10 0h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM4 15h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1zm10-2h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z',
    sales:
        'M5 5h14a1 1 0 0 1 1 1v4h-2V7H6v10h6v2H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm14.71 7.29-5.36 5.37-2.35-2.34a1 1 0 0 0-1.41 1.41l3.07 3.07a1 1 0 0 0 1.41 0l6.07-6.08a1 1 0 1 0-1.43-1.43z',
    purchases:
        'M5 3h14a2 2 0 0 1 2 2v3h-2V5H5v14h6v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm13 9h-3a2 2 0 0 0-2 2v6h9v-6a2 2 0 0 0-2-2h-1zm-3 6v-4h3v4h-3zm-6-7h4v2h-4v-2zm0-4h6v2h-6V7z',
    search:
        'M21 20.29 16.71 16a7.5 7.5 0 1 0-.71.71l4.33 4.29a1 1 0 0 0 1.41-1.41zM10.5 16a5.5 5.5 0 1 1 5.5-5.5 5.51 5.51 0 0 1-5.5 5.5z',
    close:
        'M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z',
    plus: 'M12 5a1 1 0 0 1 1 1v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5V6a1 1 0 0 1 1-1z',
    minus: 'M6 11h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2z',
    printer:
        'M6 3h12a2 2 0 0 1 2 2v4h-2V5H6v4H4V5a2 2 0 0 1 2-2zm12 10a2 2 0 1 1 0 4h-1v3H7v-3H6a2 2 0 1 1 0-4h12zm-3 7v-5H9v5h6zm-6-9h6v2H9v-2z',
    trash:
        'M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h5a1 1 0 0 1 0 2h-1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6H4a1 1 0 0 1 0-2h5zm7 2H8v13h8V6zm-6 3a1 1 0 0 1 2 0v7a1 1 0 0 1-2 0V9zm4 0a1 1 0 0 1 2 0v7a1 1 0 0 1-2 0V9z',
    calendar:
        'M7 2a1 1 0 0 1 2 0v1h6V2a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h1V2zm11 6H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zm-9 4h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2zm0 4h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2zm4-4h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2zm0 4h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2z',
    user:
        'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.69-8 6v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-3.31-3.58-6-8-6z',
    'file-text':
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm1 0 6 6h-6zM8 13h8v2H8zm0 4h8v2H8z',
    lock:
        'M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-6 8.73V18a1 1 0 0 1 2 0v-.27a1.5 1.5 0 1 0-2 0zM9 7a3 3 0 1 1 6 0v2H9z',
    refresh:
        'M20 11a1 1 0 0 1-1 1H7.41l2.3 2.29a1 1 0 0 1-1.42 1.42l-4-4a1 1 0 0 1 0-1.42l4-4a1 1 0 1 1 1.42 1.42L7.41 10H19a1 1 0 0 1 1 1zm-6.71 3.71 2.3 2.29H5a1 1 0 0 0 0 2h12.59l-2.3 2.29a1 1 0 0 0 1.42 1.42l4-4a1 1 0 0 0 0-1.42l-4-4a1 1 0 0 0-1.42 1.42z',
    save:
        'M5 5a2 2 0 0 1 2-2h9.59L21 7.41V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v12h10V8h-4a1 1 0 0 1-1-1V3H7zm5 14a3 3 0 1 0-3-3 3 3 0 0 0 3 3z',
};

const Icon: React.FC<IconProps> = ({ name, size = 20, className, ...props }) => {
    const path = paths[name];
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            focusable="false"
            className={className}
            {...props}
        >
            <path fill="currentColor" d={path} />
        </svg>
    );
};

export default Icon;
