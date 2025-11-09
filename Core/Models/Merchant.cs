using System;
using System.Collections.Generic;

namespace Shop.Core.Models;

public class Merchant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    // Optional: keep track of invoice ids or transactions via navigation
    public List<Transaction> Transactions { get; set; } = new();
}
