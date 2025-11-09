using System;
using System.Windows;
using Shop.Data;
using Shop.Core.Models;

namespace Shop.Presentation;

public partial class AddSupplierWindow : Window
{
    public AddSupplierWindow()
    {
        InitializeComponent();
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e) => DialogResult = false;

    private void SaveBtn_Click(object sender, RoutedEventArgs e)
    {
        var name = NameBox.Text?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(name))
        {
            MessageBox.Show("ادخل اسم المورد", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        using var db = new ShopDbContext();
        var s = new Supplier
        {
            Name = name,
            Phone = PhoneBox.Text?.Trim() ?? string.Empty,
            Location = LocationBox.Text?.Trim() ?? string.Empty,
            Address = AddressBox.Text?.Trim() ?? string.Empty
        };
        db.Suppliers.Add(s);
        db.SaveChanges();
        DialogResult = true;
    }
}
