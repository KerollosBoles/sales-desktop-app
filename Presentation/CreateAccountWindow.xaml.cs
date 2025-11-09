using System;
using System.Windows;
using Shop.Data;
using Shop.Core.Models;
using Shop.Core.Services;

namespace Shop.Presentation;

public partial class CreateAccountWindow : Window
{
    public CreateAccountWindow()
    {
        InitializeComponent();
        RoleCombo.SelectedIndex = 1; // default Employee
    }

    private void CancelBtn_Click(object sender, RoutedEventArgs e) => DialogResult = false;

    private void CreateBtn_Click(object sender, RoutedEventArgs e)
    {
        var username = UsernameBox.Text?.Trim();
        var pwd = PasswordBox.Password ?? string.Empty;
        var confirm = ConfirmPasswordBox.Password ?? string.Empty;
        var email = EmailBox.Text?.Trim() ?? string.Empty;

        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(pwd))
        {
            MessageBox.Show("ادخل اسم مستخدم وكلمة سر صحيحة.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (pwd != confirm)
        {
            MessageBox.Show("كلمتا السر غير متطابقتين.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (string.IsNullOrEmpty(email) || !email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase))
        {
            MessageBox.Show("الرجاء إدخال بريد إلكتروني من Gmail (مثال: you@gmail.com) لاستخدام استعادة كلمة المرور.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var role = Role.Employee;
        if (RoleCombo.SelectedItem is System.Windows.Controls.ComboBoxItem cbi)
        {
            var s = cbi.Content?.ToString();
            if (s == "Owner") role = Role.Owner;
            else if (s == "Partner") role = Role.Partner;
            else role = Role.Employee;
        }

        using var db = new AccountsDbContext();
        if (db.Users.Any(u => u.Username == username))
        {
            MessageBox.Show("اسم المستخدم موجود بالفعل.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var user = new User
        {
            Username = username,
            PasswordHash = AuthService.HashPassword(pwd),
            Role = role,
            Email = email
        };
    db.Users.Add(user);
    db.SaveChanges();
        MessageBox.Show("تم إنشاء الحساب بنجاح.", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);
        DialogResult = true;
    }
}
