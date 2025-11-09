using System;
using System.Security.Cryptography;
using System.Text;

namespace Shop.Data
{
    public static class DpapiProtector
    {
        // Protect a UTF8 string and return base64
        public static string Protect(string plain)
        {
            if (plain == null) return string.Empty;
            var bytes = Encoding.UTF8.GetBytes(plain);
            var protectedBytes = System.Security.Cryptography.ProtectedData.Protect(bytes, null, System.Security.Cryptography.DataProtectionScope.CurrentUser);
            return Convert.ToBase64String(protectedBytes);
        }

        // Unprotect base64 to UTF8 string
        public static string Unprotect(string protectedBase64)
        {
            if (string.IsNullOrEmpty(protectedBase64)) return string.Empty;
            try
            {
                var bytes = Convert.FromBase64String(protectedBase64);
                var plain = System.Security.Cryptography.ProtectedData.Unprotect(bytes, null, System.Security.Cryptography.DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(plain);
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
