using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Shop.Data
{
    // Minimal DPAPI wrapper using CryptProtectData / CryptUnprotectData (Windows only)
    public static class DpapiProtector
    {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct DATA_BLOB
        {
            public int cbData;
            public IntPtr pbData;
        }

        [DllImport("crypt32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern bool CryptProtectData(ref DATA_BLOB pDataIn, string szDataDescr,
            IntPtr pOptionalEntropy, IntPtr pvReserved, IntPtr pPromptStruct, int dwFlags, out DATA_BLOB pDataOut);

        [DllImport("crypt32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern bool CryptUnprotectData(ref DATA_BLOB pDataIn, StringBuilder pszDataDescr,
            IntPtr pOptionalEntropy, IntPtr pvReserved, IntPtr pPromptStruct, int dwFlags, out DATA_BLOB pDataOut);

        private const int CRYPTPROTECT_UI_FORBIDDEN = 0x1;

        public static string Protect(string plain)
        {
            if (string.IsNullOrEmpty(plain)) return string.Empty;
            var bytes = Encoding.UTF8.GetBytes(plain);

            var inBlob = new DATA_BLOB();
            inBlob.cbData = bytes.Length;
            inBlob.pbData = Marshal.AllocHGlobal(bytes.Length);
            Marshal.Copy(bytes, 0, inBlob.pbData, bytes.Length);

            try
            {
                if (!CryptProtectData(ref inBlob, null, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, CRYPTPROTECT_UI_FORBIDDEN, out var outBlob))
                {
                    return string.Empty;
                }

                try
                {
                    var protectedBytes = new byte[outBlob.cbData];
                    Marshal.Copy(outBlob.pbData, protectedBytes, 0, outBlob.cbData);
                    return Convert.ToBase64String(protectedBytes);
                }
                finally
                {
                    if (outBlob.pbData != IntPtr.Zero) Marshal.FreeHGlobal(outBlob.pbData);
                }
            }
            finally
            {
                if (inBlob.pbData != IntPtr.Zero) Marshal.FreeHGlobal(inBlob.pbData);
            }
        }

        public static string Unprotect(string protectedBase64)
        {
            if (string.IsNullOrEmpty(protectedBase64)) return string.Empty;
            byte[] protectedBytes;
            try { protectedBytes = Convert.FromBase64String(protectedBase64); }
            catch { return string.Empty; }

            var inBlob = new DATA_BLOB();
            inBlob.cbData = protectedBytes.Length;
            inBlob.pbData = Marshal.AllocHGlobal(protectedBytes.Length);
            Marshal.Copy(protectedBytes, 0, inBlob.pbData, protectedBytes.Length);

            try
            {
                if (!CryptUnprotectData(ref inBlob, null, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, CRYPTPROTECT_UI_FORBIDDEN, out var outBlob))
                {
                    return string.Empty;
                }

                try
                {
                    var bytes = new byte[outBlob.cbData];
                    Marshal.Copy(outBlob.pbData, bytes, 0, outBlob.cbData);
                    return Encoding.UTF8.GetString(bytes);
                }
                finally
                {
                    if (outBlob.pbData != IntPtr.Zero) Marshal.FreeHGlobal(outBlob.pbData);
                }
            }
            finally
            {
                if (inBlob.pbData != IntPtr.Zero) Marshal.FreeHGlobal(inBlob.pbData);
            }
        }
    }
}
