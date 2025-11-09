using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text.Json;

namespace Shop.Presentation.Services;

public class SmtpConfig
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string From { get; set; } = "";
}

public static class EmailService
{
    private static SmtpConfig? _config;

    private static void LoadConfig()
    {
        if (_config != null) return;
        try
        {
            var path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory ?? ".", "smtp.config.json");
            if (!File.Exists(path)) return;
            var txt = File.ReadAllText(path);
            _config = JsonSerializer.Deserialize<SmtpConfig>(txt);
        }
        catch { }
    }

    public static bool CanSend()
    {
        LoadConfig();
        return _config != null && !string.IsNullOrWhiteSpace(_config.Host) && !string.IsNullOrWhiteSpace(_config.From);
    }

    public static void SendResetEmail(string toEmail, string token)
    {
        LoadConfig();
        if (_config == null) throw new InvalidOperationException("SMTP not configured. Create smtp.config.json in application folder.");

        using var client = new SmtpClient(_config.Host, _config.Port) { EnableSsl = _config.EnableSsl };
        if (!string.IsNullOrWhiteSpace(_config.Username)) client.Credentials = new NetworkCredential(_config.Username, _config.Password);

        var msg = new MailMessage();
        msg.From = new MailAddress(_config.From);
        msg.To.Add(toEmail);
        msg.Subject = "Password reset token";
        msg.Body = $"رمز استعادة كلمة المرور الخاص بك هو: {token}\nصالح لمدة ساعة واحدة.";

        client.Send(msg);
    }
}
