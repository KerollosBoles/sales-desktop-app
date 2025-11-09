using Microsoft.EntityFrameworkCore;
using Shop.Core.Models;
using System.IO;

namespace Shop.Data;

public class ShopDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Merchant> Merchants { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceLine> InvoiceLines { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }

    private string DbPath
    {
        get
        {
            // Store the DB next to the running application so published EXE has a predictable DB location
            var baseDir = AppDomain.CurrentDomain.BaseDirectory ?? Directory.GetCurrentDirectory();
            return Path.Combine(baseDir, "shop.db");
        }
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite($"Data Source={DbPath}");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Invoice>(b =>
        {
            b.HasKey(i => i.Id);
            b.HasIndex(i => i.InvoiceNumber).IsUnique(false);
            b.HasMany(i => i.InvoiceLines).WithOne(l => l.Invoice).HasForeignKey(l => l.InvoiceId).OnDelete(DeleteBehavior.Cascade);
            b.HasOne<Merchant>().WithMany(m => m.Invoices).HasForeignKey(i => i.MerchantId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<InvoiceLine>(b =>
        {
            b.HasKey(l => l.Id);
            b.HasOne(l => l.Item).WithMany().HasForeignKey(l => l.ItemId);
        });

        modelBuilder.Entity<Supplier>(b =>
        {
            b.HasKey(s => s.Id);
            b.HasMany(s => s.Items).WithOne(i => i.Supplier).HasForeignKey(i => i.SupplierId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
