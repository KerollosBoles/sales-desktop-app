using System;
using System.IO;

namespace Shop.Presentation;

public static class Logger
{
    private static readonly string LogFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory ?? ".", "app-error.log");

    public static void Log(string message)
    {
        try
        {
            File.AppendAllText(LogFile, $"[{DateTime.UtcNow:O}] {message}{Environment.NewLine}");
        }
        catch { }
    }

    public static void Log(Exception ex)
    {
        try
        {
            var msg = ex.ToString();
            File.AppendAllText(LogFile, $"[{DateTime.UtcNow:O}] Exception: {msg}{Environment.NewLine}");
        }
        catch { }
    }
}
