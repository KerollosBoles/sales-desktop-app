using System;
using System.Windows;
using Shop.Data;
using Shop.Core.Models;

namespace Shop.Presentation;

public partial class AddItemWindow : Window
{
    public AddItemWindow()
    {
        InitializeComponent();
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e) => DialogResult = false;

    private void SaveBtn_Click(object sender, RoutedEventArgs e)
    {
        var name = NameBox.Text?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            MessageBox.Show("ادخل اسم الصنف", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (!int.TryParse(QuantityBox.Text, out var qty)) qty = 0;
        DateTime importDate = ImportDatePicker.SelectedDate ?? DateTime.UtcNow;

        using var db = new ShopDbContext();
        // try to find existing supplier by name; if not present, create it
        Supplier? supplier = null;
        var supplierName = SupplierBox.Text?.Trim() ?? string.Empty;
        if (!string.IsNullOrEmpty(supplierName)) supplier = db.Suppliers.FirstOrDefault(s => s.Name == supplierName);
        if (supplier == null && !string.IsNullOrEmpty(supplierName))
        {
            supplier = new Supplier { Name = supplierName, Phone = SupplierPhoneBox.Text?.Trim() ?? string.Empty };
            db.Suppliers.Add(supplier);
            db.SaveChanges();
        }

        var it = new Item
        {
            Name = name,
            Brand = BrandBox.Text?.Trim() ?? string.Empty,
            SupplierId = supplier?.Id,
            SupplierPhone = SupplierPhoneBox.Text?.Trim() ?? string.Empty,
            TireModel = TireModelBox.Text?.Trim() ?? string.Empty,
            Quantity = qty,
            PurchaseDate = importDate,
            LastPurchaseDate = importDate,
            LastPurchaseQuantity = qty,
            PurchasePrice = 0
        };
        db.Items.Add(it);
        db.SaveChanges();
        DialogResult = true;
    }
}
