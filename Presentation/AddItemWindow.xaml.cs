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
        var it = new Item
        {
            Name = name,
            Brand = BrandBox.Text?.Trim() ?? string.Empty,
            Supplier = SupplierBox.Text?.Trim() ?? string.Empty,
            SupplierPhone = SupplierPhoneBox.Text?.Trim() ?? string.Empty,
            TireModel = TireModelBox.Text?.Trim() ?? string.Empty,
            Quantity = qty,
            PurchaseDate = importDate,
            PurchasePrice = 0
        };
        db.Items.Add(it);
        db.SaveChanges();
        DialogResult = true;
    }
}
