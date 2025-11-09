using System;
using System.Collections.Generic;

namespace Shop.Core.Models;

public class Invoice
{
    public int Id { get; set; }
    // Invoice number should be set once at creation and not changed afterwards
    public string InvoiceNumber { get; private set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    // keep seller snapshot name and also seller id referencing Accounts DB user id (logical link)
    public string SellerName { get; set; } = string.Empty;
    public int? SellerId { get; set; }

    public int? MerchantId { get; set; }
    public Merchant? Merchant { get; set; }
    public string LocationSoldTo { get; set; } = string.Empty;

    public List<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();

    public Invoice() { }

    public Invoice(string invoiceNumber)
    {
        InvoiceNumber = invoiceNumber;
    }
}
