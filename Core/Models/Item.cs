using System;

namespace Shop.Core.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    // link to Supplier entity (importer)
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public string TireModel { get; set; } = string.Empty; // اسم الكاوتش
    public int Quantity { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    // رقم هاتف المورد
    // last time this item was restocked
    public DateTime? LastPurchaseDate { get; set; }
    // last quantity added or last stock in amount (optional)
    public int LastPurchaseQuantity { get; set; }
    // supplier phone is stored on Supplier entity; kept for legacy compatibility
    public string SupplierPhone { get; set; } = string.Empty;

    // track when this item was last sold (computed from InvoiceLines, but keep cached for quick display)
    public DateTime? LastSoldAt { get; set; }
}
