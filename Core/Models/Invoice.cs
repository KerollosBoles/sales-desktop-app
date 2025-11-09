using System;
using System.Collections.Generic;

namespace Shop.Core.Models;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string SellerName { get; set; } = string.Empty;
    public int? MerchantId { get; set; }
    public Merchant? Merchant { get; set; }
    public string LocationSoldTo { get; set; } = string.Empty;

    public List<InvoiceLine> InvoiceLines { get; set; } = new List<InvoiceLine>();
}
