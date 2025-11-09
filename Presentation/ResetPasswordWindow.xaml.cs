using System;
using System.Windows;
using Shop.Data;
using Shop.Presentation.Services;
using Shop.Core.Services;

namespace Shop.Presentation;

public partial class ResetPasswordWindow : Window
{
    public ResetPasswordWindow()
    {
        InitializeComponent();
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e)
    {
        this.Close();
    }

    private void SendBtn_Click(object sender, RoutedEventArgs e)
    {
        var username = UsernameBox.Text?.Trim() ?? string.Empty;
        var email = EmailBox.Text?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(email))
        {
            MessageBox.Show("الرجاء إدخال اسم المستخدم والبريد الإلكتروني.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            using var db = new AccountsDbContext();
            var user = db.Users.FirstOrDefault(u => u.Username == username && u.Email == email);
            if (user == null)
            {
                MessageBox.Show("لم يتم العثور على مستخدم بهذا الاسم والبريد الإلكتروني.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            var token = Guid.NewGuid().ToString();
            user.ResetToken = token;
            user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            db.SaveChanges();

            if (EmailService.CanSend())
            {
                EmailService.SendResetEmail(email, token);
                MessageBox.Show("أرسلنا الرمز إلى بريدك الإلكتروني. تحقق من صندوق الرسائل.", "تم", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            else
            {
                // If SMTP not configured, show the token so the admin can copy it (fallback)
                MessageBox.Show($"SMTP غير مكوّن. رمز الاستعادة هو:\n{token}", "تم - رمز مؤقت", MessageBoxButton.OK, MessageBoxImage.Information);
            }

            // Open confirm window to allow entering token and new password
            var confirm = new ResetPasswordConfirmWindow(user.Username);
            confirm.Owner = this.Owner ?? this;
            confirm.ShowDialog();
            this.Close();
        }
        catch (Exception ex)
        {
            Logger.Log(ex);
            MessageBox.Show("حدث خطأ أثناء محاولة إرسال رمز الاستعادة.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}
