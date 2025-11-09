using System.Windows;
using Shop.Data;
using Shop.Core.Models;

namespace Shop.Presentation;

public partial class AddMerchantWindow : Window
{
    public AddMerchantWindow()
    {
        InitializeComponent();
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e) => DialogResult = false;

    private void SaveBtn_Click(object sender, RoutedEventArgs e)
    {
        var name = NameBox.Text?.Trim();
        var phone = PhoneBox.Text?.Trim() ?? string.Empty;
        var location = LocationBox.Text?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(name))
        {
            MessageBox.Show("أدخل اسم التاجر.", "تحذير", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        using var db = new ShopDbContext();
        db.Merchants.Add(new Merchant { Name = name, Phone = phone, Location = location });
        db.SaveChanges();
        DialogResult = true;
    }
}
