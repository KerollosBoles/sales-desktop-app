using System;
using System.Linq;
using System.Windows;
using Shop.Core.Models;
using Shop.Data;

namespace Shop.Presentation;

public partial class InventoryWindow : Window
{
    private readonly string _username;
    private readonly Role _role;

    public InventoryWindow(string username, Role role)
    {
        _username = username;
        _role = role;
        InitializeComponent();
        LoadItems();

        if (_role != Role.Owner)
        {
            // disable add for non-owners (example)
            AddItemBtn.IsEnabled = false;
        }
        // Merchants page only for Owner and Partner
        if (!(_role == Role.Owner || _role == Role.Partner))
        {
            MerchantsBtn.IsEnabled = false;
            SalesBtn.IsEnabled = false;
        }
    }

    private void LoadItems()
    {
        using var db = new ShopDbContext();
        var items = db.Items.OrderBy(i => i.Name).ToList();
        ItemsGrid.ItemsSource = items;
    }

    private void RefreshBtn_Click(object sender, RoutedEventArgs e)
    {
        LoadItems();
    }

    private void AddItemBtn_Click(object sender, RoutedEventArgs e)
    {
        var w = new AddItemWindow();
        if (w.ShowDialog() == true)
        {
            LoadItems();
        }
    }

    private void SellBtn_Click(object sender, RoutedEventArgs e)
    {
        if (ItemsGrid.SelectedItem is Item sel)
        {
            var dlg = new SellWindow(sel.Id, _username);
            if (dlg.ShowDialog() == true)
            {
                LoadItems();
            }
        }
        else
        {
            MessageBox.Show("اختر صنفًا من القائمة", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void PrintBtn_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show("ميزة الطباعة ستتم إضافتها لاحقًا.", "معلومة", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void MerchantsBtn_Click(object sender, RoutedEventArgs e)
    {
        var w = new MerchantsWindow();
        w.Owner = this;
        w.ShowDialog();
    }

    private void SalesBtn_Click(object sender, RoutedEventArgs e)
    {
        var w = new SalesWindow();
        w.Owner = this;
        w.ShowDialog();
    }
}
