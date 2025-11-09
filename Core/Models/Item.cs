using System;

namespace Shop.Core.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string TireModel { get; set; } = string.Empty; // اسم الكاوتش
    public int Quantity { get; set; }
    public DateTime PurchaseDate { get; set; }
    public decimal PurchasePrice { get; set; }
    // رقم هاتف المورد
    public string SupplierPhone { get; set; } = string.Empty;
}
