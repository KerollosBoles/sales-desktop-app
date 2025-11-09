using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Shop.Core.Models;
using System;
using System.IO;

namespace Shop.Data
{
    public class AccountsDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }

        private string DbPath
        {
            get
            {
                // Keep accounts DB in LocalAppData\ShopApp for separation from app folder
                var baseDir = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                var folder = Path.Combine(baseDir, "ShopApp");
                Directory.CreateDirectory(folder);
                return Path.Combine(folder, "accounts.db");
            }
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite($"Data Source={DbPath}");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Use DPAPI value converters for sensitive string fields
            var protector = new ValueConverter<string, string>(
                v => string.IsNullOrEmpty(v) ? v : DpapiProtector.Protect(v),
                v => string.IsNullOrEmpty(v) ? v : DpapiProtector.Unprotect(v)
            );

            modelBuilder.Entity<User>(b =>
            {
                b.HasKey(u => u.Id);
                b.Property(u => u.Email).HasConversion(protector);
                b.Property(u => u.ResetToken).HasConversion(protector);
                // ResetTokenExpiry stored as text or datetime by EF - no conversion needed
            });
        }
    }
}
