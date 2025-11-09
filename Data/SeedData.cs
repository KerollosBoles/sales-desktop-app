using Shop.Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Shop.Data;

public static class SeedData
{
    public static void EnsureSeedData(ShopDbContext db)
    {
        db.Database.EnsureCreated();

        // Ensure schema has new columns for Email and reset token (safe for SQLite: catch duplicate column errors)
        try
        {
            db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN Email TEXT");
        }
        catch { }
        try
        {
            db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN ResetToken TEXT");
        }
        catch { }
        try
        {
            db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN ResetTokenExpiry TEXT");
        }
        catch { }

        // Ensure accounts DB exists and has a seeded admin user (separate from shop.db)
        try
        {
            using var accounts = new AccountsDbContext();
            accounts.Database.EnsureCreated();
            if (!accounts.Users.Any())
            {
                var admin = new User
                {
                    Username = "admin",
                    PasswordHash = ComputeHash("1234"),
                    Role = Role.Owner,
                    CreatedAt = DateTime.UtcNow,
                    Email = "admin@example.com"
                };
                accounts.Users.Add(admin);
                accounts.SaveChanges();
            }
        }
        catch { }

        // Seed a sample merchant if none exist
        if (!db.Merchants.Any())
        {
            db.Merchants.Add(new Merchant { Name = "تاجر السيارات", Phone = "01000000000", Location = "القاهرة" });
            db.SaveChanges();
        }

        // Seed some suppliers (importers) if none exist
        try
        {
            if (!db.Suppliers.Any())
            {
                db.Suppliers.Add(new Supplier { Name = "مستورد 1", Phone = "01220000000", Location = "الإسكندرية", Address = "شارع الاستيراد 1" });
                db.Suppliers.Add(new Supplier { Name = "مستورد 2", Phone = "01221111111", Location = "القاهرة", Address = "شارع الواردات 2" });
                db.SaveChanges();
            }
        }
        catch { }

        // Migrate existing Transactions to new Invoice/InvoiceLine model if needed
        try
        {
            if (!db.Set<Invoice>().Any() && db.Transactions.Any())
            {
                // Group transactions by InvoiceNumber (or create per-transaction invoice if empty)
                var groups = db.Transactions.AsEnumerable().GroupBy(t => string.IsNullOrEmpty(t.InvoiceNumber) ? Guid.NewGuid().ToString() : t.InvoiceNumber);
                foreach (var g in groups)
                {
                    var first = g.First();
                    var inv = new Invoice
                    {
                        InvoiceNumber = g.Key,
                        Date = first.Date,
                        SellerName = first.SellerName,
                        MerchantId = first.MerchantId,
                        LocationSoldTo = first.LocationSoldTo
                    };
                    db.Invoices.Add(inv);
                    db.SaveChanges(); // ensure invoice id

                    foreach (var t in g)
                    {
                        var line = new InvoiceLine
                        {
                            InvoiceId = inv.Id,
                            ItemId = t.ItemId,
                            Quantity = t.Quantity,
                            Price = t.Price
                        };
                        db.InvoiceLines.Add(line);
                    }
                    db.SaveChanges();
                }
            }
        }
        catch { }
    }

    private static string ComputeHash(string input)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }
}
