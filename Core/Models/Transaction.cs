using System;

namespace Shop.Core.Models;

public enum TransactionType { Purchase = 0, Sale = 1 }

public class Transaction
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public Item? Item { get; set; }
    public int Quantity { get; set; }
    public string BuyerName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public decimal Price { get; set; }
    public TransactionType Type { get; set; }

    // New fields for invoice tracking
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? MerchantId { get; set; }
    public Merchant? Merchant { get; set; }
    public string LocationSoldTo { get; set; } = string.Empty;
}
