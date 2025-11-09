using Shop.Core.Models;
using System;
using System.Security.Cryptography;
using System.Text;

namespace Shop.Core.Services;

public static class AuthService
{
    public static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(password)));
    }

    public static bool VerifyPassword(string password, string hash)
    {
        return string.Equals(HashPassword(password), hash, StringComparison.OrdinalIgnoreCase);
    }
}
