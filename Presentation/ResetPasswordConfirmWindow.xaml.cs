using System;
using System.Windows;
using Shop.Data;
using Shop.Core.Services;

namespace Shop.Presentation;

public partial class ResetPasswordConfirmWindow : Window
{
    private readonly string _username;

    public ResetPasswordConfirmWindow(string username)
    {
        InitializeComponent();
        _username = username;
        UsernameBox.Text = username;
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e)
    {
        this.Close();
    }

    private void ConfirmBtn_Click(object sender, RoutedEventArgs e)
    {
        var token = TokenBox.Text?.Trim() ?? string.Empty;
        var newPassword = NewPasswordBox.Password ?? string.Empty;
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(newPassword))
        {
            MessageBox.Show("الرجاء إدخال الرمز وكلمة السر الجديدة.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            using var db = new AccountsDbContext();
            var user = db.Users.FirstOrDefault(u => u.Username == _username && u.ResetToken == token);
            if (user == null)
            {
                MessageBox.Show("الرمز غير صحيح أو المستخدم غير موجود.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }
            if (!user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry.Value < DateTime.UtcNow)
            {
                MessageBox.Show("انتهت صلاحية الرمز.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            user.PasswordHash = AuthService.HashPassword(newPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            db.SaveChanges();

            MessageBox.Show("تم تغيير كلمة السر بنجاح.", "تم", MessageBoxButton.OK, MessageBoxImage.Information);
            this.Close();
        }
        catch (Exception ex)
        {
            Logger.Log(ex);
            MessageBox.Show("حدث خطأ أثناء محاولة تغيير كلمة السر.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}
