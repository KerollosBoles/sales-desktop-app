using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;
using Shop.Data;
using Shop.Core.Models;
using System.Globalization;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Shop.Presentation
{
    public partial class SalesWindow : Window
    {
        private int _year;
        private int _month;

        public SalesWindow()
        {
            InitializeComponent();
            InitMonthYear();
            LoadData();
        }

        private void InitMonthYear()
        {
            var now = DateTime.Now;
            _year = now.Year;
            _month = now.Month;

            // populate months and years
            var months = CultureInfo.CurrentCulture.DateTimeFormat.MonthNames.Take(12).Select((m, i) => new { Name = m, Value = i + 1 }).ToList();
            MonthCombo.ItemsSource = months;
            MonthCombo.DisplayMemberPath = "Name";
            MonthCombo.SelectedValuePath = "Value";
            MonthCombo.SelectedValue = _month;

            var years = Enumerable.Range(now.Year - 5, 8).ToList();
            YearCombo.ItemsSource = years;
            YearCombo.SelectedItem = _year;
        }

        private void PrevMonthBtn_Click(object sender, RoutedEventArgs e)
        {
            var dt = new DateTime(_year, _month, 1).AddMonths(-1);
            _year = dt.Year; _month = dt.Month;
            YearCombo.SelectedItem = _year;
            MonthCombo.SelectedValue = _month;
            LoadData();
        }

        private void NextMonthBtn_Click(object sender, RoutedEventArgs e)
        {
            var dt = new DateTime(_year, _month, 1).AddMonths(1);
            _year = dt.Year; _month = dt.Month;
            YearCombo.SelectedItem = _year;
            MonthCombo.SelectedValue = _month;
            LoadData();
        }

        private void SearchBtn_Click(object sender, RoutedEventArgs e) => LoadData();
        private void RefreshBtn_Click(object sender, RoutedEventArgs e) => LoadData();

        private void MonthCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (MonthCombo.SelectedValue is int v) { _month = v; LoadData(); }
        }

        private void YearCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (YearCombo.SelectedItem is int y) { _year = y; LoadData(); }
        }

        private void InvoicesGrid_MouseDoubleClick(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (InvoicesGrid.SelectedItem is InvoiceListDto dto)
            {
                // open invoice window for that invoice id
                var win = new InvoiceWindow(dto.InvoiceId);
                win.Owner = this;
                win.ShowDialog();
            }
        }

        private void LoadData()
        {
            try
            {
                using var db = new ShopDbContext();

                // parse search
                var q = (SearchBox.Text ?? string.Empty).Trim();

                var start = new DateTime(_year, _month, 1);
                var end = start.AddMonths(1);

                // invoices list (from Invoice model)
                var invoices = db.Invoices
                    .Where(inv => inv.Date >= start && inv.Date < end)
                    .Where(inv => string.IsNullOrEmpty(q) || inv.InvoiceNumber.Contains(q) || inv.SellerName.Contains(q))
                    .Select(inv => new InvoiceListDto
                    {
                        InvoiceId = inv.Id,
                        InvoiceNumber = inv.InvoiceNumber,
                        Date = inv.Date.ToLocalTime().ToString("yyyy-MM-dd HH:mm"),
                        MerchantName = db.Merchants.Where(m => m.Id == inv.MerchantId).Select(m => m.Name).FirstOrDefault(),
                        Total = inv.InvoiceLines.Sum(l => l.Price * l.Quantity),
                        SellerName = inv.SellerName
                    })
                    .OrderByDescending(x => x.Date)
                    .ToList();

                InvoicesGrid.ItemsSource = invoices;

                // aggregated per-item totals using InvoiceLines joined with Invoice date
                var totals = db.InvoiceLines
                    .Where(l => l.Invoice != null && l.Invoice.Date >= start && l.Invoice.Date < end)
                    .GroupBy(l => l.ItemId)
                    .Select(g => new ItemTotalDto
                    {
                        ItemId = g.Key,
                        TotalQuantity = g.Sum(x => x.Quantity),
                        TotalAmount = g.Sum(x => x.Quantity * x.Price),
                        ItemName = db.Items.Where(i => i.Id == g.Key).Select(i => i.Name).FirstOrDefault()
                    })
                    .OrderByDescending(x => x.TotalQuantity)
                    .ToList();

                ItemTotalsGrid.ItemsSource = totals;
            }
            catch (Exception ex)
            {
                Logger.Log(ex);
                MessageBox.Show("حدث خطأ أثناء تحميل البيانات.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExportPdfBtn_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var dlg = new SaveFileDialog { Filter = "PDF files|*.pdf", FileName = $"Sales-{_year}-{_month}.pdf" };
                if (dlg.ShowDialog() != true) return;
                var file = dlg.FileName;

                // prepare data
                using var db = new ShopDbContext();
                var start = new DateTime(_year, _month, 1);
                var end = start.AddMonths(1);

                var items = db.InvoiceLines
                    .Where(l => l.Invoice != null && l.Invoice.Date >= start && l.Invoice.Date < end)
                    .GroupBy(l => l.ItemId)
                    .Select(g => new
                    {
                        ItemName = db.Items.Where(i => i.Id == g.Key).Select(i => i.Name).FirstOrDefault(),
                        Quantity = g.Sum(x => x.Quantity),
                        Amount = g.Sum(x => x.Quantity * x.Price)
                    })
                    .OrderByDescending(x => x.Quantity)
                    .ToList();

                // generate PDF via QuestPDF
                Document.Create(doc =>
                {
                    doc.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(20);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header().AlignRight().Text($"تقرير مبيعات {_year}-{_month:00}").SemiBold().FontSize(16);

                        page.Content().Column(col =>
                        {
                            col.Spacing(5);
                            col.Item().Text($"تاريخ التقرير: {DateTime.Now:yyyy-MM-dd HH:mm}").AlignRight();

                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80);
                                    columns.RelativeColumn();
                                    columns.ConstantColumn(120);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).AlignRight().Text("المبلغ");
                                    header.Cell().Element(CellStyle).AlignRight().Text("الصنف");
                                    header.Cell().Element(CellStyle).AlignRight().Text("الكمية");
                                });

                                foreach (var it in items)
                                {
                                    table.Cell().Element(CellStyle).AlignRight().Text(it.Amount.ToString("N2"));
                                    table.Cell().Element(CellStyle).AlignRight().Text(it.ItemName ?? "-");
                                    table.Cell().Element(CellStyle).AlignRight().Text(it.Quantity.ToString());
                                }

                            });

                            var totalAmount = items.Sum(x => x.Amount);
                            col.Item().AlignRight().Text($"الإجمالي الكلي: {totalAmount:N2}").Bold();
                        });

                        page.Footer().AlignCenter().Text("تقرير مبيعات - ShopApp");
                    });
                }).GeneratePdf(file);

                MessageBox.Show($"تم تصدير تقرير المبيعات إلى: {file}", "تم", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                Logger.Log(ex);
                MessageBox.Show("حدث خطأ أثناء تصدير التقرير.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private static IContainer CellStyle(IContainer container) => container.Border(1).BorderColor(Colors.Grey.Lighten3).Padding(6);

        // DTOs
        private class InvoiceListDto
        {
            public int InvoiceId { get; set; }
            public string InvoiceNumber { get; set; } = string.Empty;
            public string Date { get; set; } = string.Empty;
            public string MerchantName { get; set; } = string.Empty;
            public decimal Total { get; set; }
            public string SellerName { get; set; } = string.Empty;
        }

        private class ItemTotalDto
        {
            public int ItemId { get; set; }
            public string? ItemName { get; set; }
            public int TotalQuantity { get; set; }
            public decimal TotalAmount { get; set; }
        }
    }
}
