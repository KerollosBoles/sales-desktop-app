using System.Linq;
using System.Windows;
using Shop.Data;
using Shop.Core.Models;

namespace Shop.Presentation;

public partial class MerchantsWindow : Window
{
    public MerchantsWindow()
    {
        InitializeComponent();
        LoadMerchants();
    }

    private void LoadMerchants()
    {
        using var db = new ShopDbContext();
        MerchantsGrid.ItemsSource = db.Merchants.OrderBy(m => m.Name).ToList();
    }

    private void RefreshBtn_Click(object sender, RoutedEventArgs e)
    {
        LoadMerchants();
    }

    private void AddMerchantBtn_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new AddMerchantWindow();
        if (dlg.ShowDialog() == true)
        {
            LoadMerchants();
        }
    }
}
