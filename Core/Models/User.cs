using System;

namespace Shop.Core.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // store hash
    public Role Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Email { get; set; } = string.Empty;
    // Password reset token (GUID) and expiry stored as UTC
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }
}
