import React, { useState } from 'react';

const ItemForm = ({ onSubmit, initialItem }) => {
    const [itemName, setItemName] = useState(initialItem ? initialItem.name : '');
    const [itemType, setItemType] = useState(initialItem ? initialItem.type : '');
    const [saleDate, setSaleDate] = useState(initialItem ? initialItem.saleDate : '');
    const [buyer, setBuyer] = useState(initialItem ? initialItem.buyer : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            name: itemName,
            type: itemType,
            saleDate,
            buyer,
        };
        onSubmit(itemData);
        resetForm();
    };

    const resetForm = () => {
        setItemName('');
        setItemType('');
        setSaleDate('');
        setBuyer('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>اسم العنصر:</label>
                <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>نوع العنصر:</label>
                <input
                    type="text"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>تاريخ البيع:</label>
                <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>المشتري:</label>
                <input
                    type="text"
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    required
                />
            </div>
            <button type="submit">إرسال</button>
        </form>
    );
};

export default ItemForm;