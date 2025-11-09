using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using Shop.Core.Models;
using Shop.Data;

namespace Shop.Presentation;

public partial class SellWindow : Window
{
    private readonly int? _initialItemId;
    private readonly string _seller;

    private ObservableCollection<InvoiceLineEdit> Lines { get; } = new ObservableCollection<InvoiceLineEdit>();

    public SellWindow(int itemId, string seller)
    {
        _initialItemId = itemId;
        _seller = seller;
        InitializeComponent();
        InitializeData();
    }

    private void InitializeData()
    {
        // generate invoice number
        InvoiceLabel.Text = DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + new Random().Next(100, 999).ToString();

        using var db = new ShopDbContext();
        var merchants = db.Merchants.OrderBy(m => m.Name).ToList();
        MerchantBox.ItemsSource = merchants;

        // prepare lines
        LinesGrid.ItemsSource = Lines;

        // if window was opened with an item preselected, add an initial line
        if (_initialItemId.HasValue)
        {
            var item = db.Items.FirstOrDefault(i => i.Id == _initialItemId.Value);
            if (item != null)
            {
                Lines.Add(new InvoiceLineEdit { ItemId = item.Id, ItemName = item.Name, Quantity = 1, Price = item.PurchasePrice });
            }
        }
    }

    private void AddLineBtn_Click(object sender, RoutedEventArgs e)
    {
        using var db = new ShopDbContext();
        var firstItem = db.Items.OrderBy(i => i.Name).FirstOrDefault();
        var il = new InvoiceLineEdit { ItemId = firstItem?.Id ?? 0, ItemName = firstItem?.Name ?? "-", Quantity = 1, Price = firstItem?.PurchasePrice ?? 0 };
        Lines.Add(il);
    }

    private void RemoveLineBtn_Click(object sender, RoutedEventArgs e)
    {
        if (LinesGrid.SelectedItem is InvoiceLineEdit sel)
        {
            Lines.Remove(sel);
        }
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e) => DialogResult = false;

    private void SellBtn_Click(object sender, RoutedEventArgs e)
    {
        if (!Lines.Any())
        {
            MessageBox.Show("أضف بند واحد على الأقل قبل الحفظ.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        using var db = new ShopDbContext();
        using var tx = db.Database.BeginTransaction();
        try
        {
            // validate stock
            foreach (var l in Lines)
            {
                var item = db.Items.FirstOrDefault(i => i.Id == l.ItemId);
                if (item == null)
                {
                    MessageBox.Show($"الصنف غير موجود: {l.ItemName}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }
                if (item.Quantity < l.Quantity)
                {
                    MessageBox.Show($"الكمية للعنصر {item.Name} غير كافية.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }
            }

            // create invoice
            var invoice = new Invoice(InvoiceLabel.Text)
            {
                Date = DateTime.UtcNow,
                SellerName = _seller,
                LocationSoldTo = LocationBox.Text ?? string.Empty,
                MerchantId = (MerchantBox.SelectedItem as Merchant)?.Id
            };
            // try to set SellerId by resolving username from accounts DB (logical link)
            try
            {
                using var adb = new AccountsDbContext();
                var sellerUser = adb.Users.FirstOrDefault(u => u.Username == _seller);
                if (sellerUser != null) invoice.SellerId = sellerUser.Id;
            }
            catch { }
            db.Invoices.Add(invoice);
            db.SaveChanges();

            // create lines and decrement stock
            foreach (var l in Lines)
            {
                var line = new InvoiceLine
                {
                    InvoiceId = invoice.Id,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    Price = l.Price
                };
                db.InvoiceLines.Add(line);

                var item = db.Items.First(i => i.Id == l.ItemId);
                item.Quantity -= l.Quantity;
                // update last sold timestamp for this item
                item.LastSoldAt = DateTime.UtcNow;
            }

            db.SaveChanges();
            tx.Commit();

            // open invoice preview
            try
            {
                var invWin = new InvoiceWindow(invoice.Id);
                invWin.Owner = this.Owner ?? this;
                invWin.ShowDialog();
            }
            catch (Exception ex)
            {
                Logger.Log(ex);
            }

            DialogResult = true;
        }
        catch (Exception ex)
        {
            tx.Rollback();
            Logger.Log(ex);
            MessageBox.Show("حدث خطأ أثناء حفظ الفاتورة.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // helper edit class for UI binding
    private class InvoiceLineEdit
    {
        public int ItemId { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string? Note { get; set; }
    }
}
