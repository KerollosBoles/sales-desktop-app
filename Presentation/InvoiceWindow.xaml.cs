using System;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using Microsoft.Win32;
using Shop.Data;
using Shop.Core.Models;

// QuestPDF will be used for PDF export
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Shop.Presentation;

public partial class InvoiceWindow : Window
{
    private readonly int _invoiceId;
    private Invoice? _invoice;

    public InvoiceWindow(int invoiceId)
    {
        InitializeComponent();
        _invoiceId = invoiceId;
        LoadInvoice();
    }

    private void LoadInvoice()
    {
        using var db = new ShopDbContext();
        _invoice = db.Invoices.Where(i => i.Id == _invoiceId)
            .Select(i => new Invoice
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                Date = i.Date,
                SellerName = i.SellerName,
                LocationSoldTo = i.LocationSoldTo,
                Merchant = db.Merchants.FirstOrDefault(m => m.Id == i.MerchantId),
                InvoiceLines = db.InvoiceLines.Where(l => l.InvoiceId == i.Id).Select(l => new InvoiceLine {
                    Id = l.Id,
                    InvoiceId = l.InvoiceId,
                    ItemId = l.ItemId,
                    Quantity = l.Quantity,
                    Price = l.Price
                }).ToList()
            }).FirstOrDefault();

        if (_invoice == null)
        {
            MessageBox.Show("تعذر العثور على الفاتورة.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            Close();
            return;
        }

        var doc = BuildFlowDocument(_invoice);
        DocViewer.Document = doc;
    }

    private FlowDocument BuildFlowDocument(Invoice inv)
    {
        var doc = new FlowDocument();
        doc.PagePadding = new Thickness(40);
        // Render the preview in Right-to-Left for Arabic
        doc.FlowDirection = FlowDirection.RightToLeft;
        doc.FontFamily = new System.Windows.Media.FontFamily("Segoe UI");

        var header = new Paragraph(new Run("فاتورة بيع")) { FontSize = 22, FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Right };
        doc.Blocks.Add(header);

        var meta = new Paragraph();
        meta.TextAlignment = TextAlignment.Right;
        meta.Inlines.Add(new Run($"رقم الفاتورة: {inv.InvoiceNumber}\n"));
        meta.Inlines.Add(new Run($"التاريخ: {inv.Date.ToLocalTime():yyyy-MM-dd HH:mm}\n"));
        if (inv.Merchant != null) meta.Inlines.Add(new Run($"التاجر: {inv.Merchant.Name} - {inv.Merchant.Phone} - {inv.Merchant.Location}\n"));
        meta.Inlines.Add(new Run($"البائع: {inv.SellerName}\n"));
        meta.Inlines.Add(new Run($"المشتري/المكان: {inv.LocationSoldTo}\n"));
        doc.Blocks.Add(meta);

        // Table of items (for now single item)
        var table = new Table();
        table.CellSpacing = 0;
        // For RTL display, show: السعر | الصنف | الكمية
        table.Columns.Add(new TableColumn { Width = new GridLength(100) }); // price
        table.Columns.Add(new TableColumn { Width = new GridLength(1, GridUnitType.Star) }); // name
        table.Columns.Add(new TableColumn { Width = new GridLength(60) }); // qty

        var headerRow = new TableRow();
        headerRow.Cells.Add(new TableCell(new Paragraph(new Run("السعر"))) { FontWeight = FontWeights.Bold });
        headerRow.Cells.Add(new TableCell(new Paragraph(new Run("الصنف"))) { FontWeight = FontWeights.Bold });
        headerRow.Cells.Add(new TableCell(new Paragraph(new Run("الكمية"))) { FontWeight = FontWeights.Bold });

        var rowGroup = new TableRowGroup();
        rowGroup.Rows.Add(headerRow);

        // Load invoice lines
        using (var db = new ShopDbContext())
        {
            foreach (var line in inv.InvoiceLines)
            {
                var item = db.Items.FirstOrDefault(i => i.Id == line.ItemId);
                var itemRow = new TableRow();
                itemRow.Cells.Add(new TableCell(new Paragraph(new Run(line.Price.ToString("N2")))));
                itemRow.Cells.Add(new TableCell(new Paragraph(new Run(item?.Name ?? "-"))));
                itemRow.Cells.Add(new TableCell(new Paragraph(new Run(line.Quantity.ToString()))));
                rowGroup.Rows.Add(itemRow);
            }
        }

        table.RowGroups.Add(rowGroup);
        doc.Blocks.Add(table);

        // compute totals
        decimal totalValue = 0;
        foreach (var l in inv.InvoiceLines) totalValue += l.Price * l.Quantity;
        var total = new Paragraph(new Run($"الإجمالي: {totalValue:N2}")) { FontWeight = FontWeights.Bold, TextAlignment = TextAlignment.Right };
        doc.Blocks.Add(total);

        return doc;
    }

    private void PrintBtn_Click(object sender, RoutedEventArgs e)
    {
        if (DocViewer.Document == null) return;
        var dlg = new PrintDialog();
        if (dlg.ShowDialog() == true)
        {
            // set to A4
            try
            {
                dlg.PrintTicket.PageMediaSize = new System.Printing.PageMediaSize(System.Printing.PageMediaSizeName.ISOA4);
            }
            catch { }
            IDocumentPaginatorSource idp = DocViewer.Document as IDocumentPaginatorSource;
            dlg.PrintDocument(idp.DocumentPaginator, "Invoice Print");
        }
    }

    private void ExportPdfBtn_Click(object sender, RoutedEventArgs e)
    {
        if (_invoice == null)
            return;

        var dlg = new SaveFileDialog { Filter = "PDF files|*.pdf", FileName = $"Invoice-{_invoice.InvoiceNumber}.pdf" };
        if (dlg.ShowDialog() != true)
            return;

        try
        {
            var inv = _invoice; // capture
            var file = dlg.FileName;

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontColor(Colors.Black));

                    // Header aligned to the right for Arabic
                    page.Header().AlignRight().Text("فاتورة بيع").SemiBold().FontSize(20);

                    page.Content().PaddingVertical(10).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            // Right-aligned meta block
                            row.RelativeColumn().Column(c =>
                            {
                                c.Item().Text($"رقم الفاتورة: {inv.InvoiceNumber}").AlignRight();
                                c.Item().Text($"التاريخ: {inv.Date.ToLocalTime():yyyy-MM-dd HH:mm}").AlignRight();
                                c.Item().Text($"البائع: {inv.SellerName}").AlignRight();
                                c.Item().Text($"المشتري/المكان: {inv.LocationSoldTo}").AlignRight();
                            });
                        });

                        col.Item().Table(table =>
                        {
                            // Columns: price | name | qty (RTL-friendly)
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(100);
                                columns.RelativeColumn();
                                columns.ConstantColumn(60);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).AlignRight().Text("السعر");
                                header.Cell().Element(CellStyle).AlignRight().Text("الصنف");
                                header.Cell().Element(CellStyle).AlignRight().Text("الكمية");
                            });

                            using (var db = new ShopDbContext())
                            {
                                foreach (var line in inv.InvoiceLines)
                                {
                                    var itemName = db.Items.FirstOrDefault(i => i.Id == line.ItemId)?.Name ?? "-";
                                    table.Cell().Element(CellStyle).AlignRight().Text(line.Price.ToString("N2"));
                                    table.Cell().Element(CellStyle).AlignRight().Text(itemName);
                                    table.Cell().Element(CellStyle).AlignRight().Text(line.Quantity.ToString());
                                }
                            }
                        });

                        var totalAmount = 0m;
                        foreach (var l in inv.InvoiceLines) totalAmount += l.Price * l.Quantity;
                        col.Item().AlignRight().Text($"الإجمالي: {totalAmount:N2}").Bold();
                    });

                    page.Footer().AlignCenter().Text("شكراً لتعاملكم معنا");
                });
            }).GeneratePdf(file);

            MessageBox.Show("تم تصدير الفاتورة كـ PDF.", "تم", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            Logger.Log(ex);
            MessageBox.Show("حدث خطأ أثناء تصدير PDF.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void CloseBtn_Click(object sender, RoutedEventArgs e) => Close();

    private static IContainer CellStyle(IContainer container) => container.Border(1).BorderColor(Colors.Grey.Lighten3).Padding(5);
}
