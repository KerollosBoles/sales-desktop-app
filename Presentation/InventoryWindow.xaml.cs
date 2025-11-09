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
        // include supplier info and compute last sold date from invoice lines
        var items = db.Items
            .OrderBy(i => i.Name)
            .Select(i => new
            {
                Item = i,
                Supplier = db.Suppliers.FirstOrDefault(s => s.Id == i.SupplierId),
                LastSold = db.InvoiceLines.Where(l => l.ItemId == i.Id).Join(db.Invoices, l => l.InvoiceId, inv => inv.Id, (l, inv) => inv.Date).OrderByDescending(d => d).FirstOrDefault()
            }).ToList()
            .Select(x =>
            {
                // attach supplier name into a small view-model on the fly
                x.Item.Supplier = x.Supplier;
                x.Item.LastSoldAt = x.LastSold == default(DateTime) ? null : (DateTime?)x.LastSold;
                return x.Item;
            }).ToList();

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

    private void SuppliersBtn_Click(object sender, RoutedEventArgs e)
    {
        var w = new SuppliersWindow();
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
