using System.Linq;
using System.Windows;
using Shop.Data;

namespace Shop.Presentation;

public partial class SuppliersWindow : Window
{
    public SuppliersWindow()
    {
        InitializeComponent();
        LoadSuppliers();
    }

    private void LoadSuppliers()
    {
        using var db = new ShopDbContext();
        SuppliersGrid.ItemsSource = db.Suppliers.OrderBy(s => s.Name).ToList();
    }

    private void RefreshBtn_Click(object sender, RoutedEventArgs e)
    {
        LoadSuppliers();
    }

    private void AddSupplierBtn_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new AddSupplierWindow();
        dlg.Owner = this;
        if (dlg.ShowDialog() == true)
        {
            LoadSuppliers();
        }
    }

    private void CloseBtn_Click(object sender, RoutedEventArgs e) => Close();
}
