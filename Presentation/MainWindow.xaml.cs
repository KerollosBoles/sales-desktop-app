using System.Windows;
using Shop.Data;
using Shop.Core.Services;
using Shop.Core.Models;
using System.Linq;

namespace Shop.Presentation;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        Logger.Log("MainWindow ctor start");
        InitializeComponent();
        Logger.Log("MainWindow ctor done");
    }

    private void ExitBtn_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }

    private void LoginBtn_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            var username = UsernameBox.Text.Trim();
            var password = PasswordBox.Password ?? string.Empty;

            using var db = new AccountsDbContext();
            var user = db.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                MessageBox.Show("المستخدم غير موجود", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (!AuthService.VerifyPassword(password, user.PasswordHash))
            {
                MessageBox.Show("كلمة السر خاطئة", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            // Role-based access: only Owner and Partner can open the inventory page
            if (user.Role == Role.Employee)
            {
                MessageBox.Show("حسابك لا يملك صلاحية الوصول لصفحة المخزن.", "صلاحية مرفوضة", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            // Open inventory window — hide the login window instead of closing it to avoid shutting down the app unexpectedly
            var inv = new InventoryWindow(user.Username, user.Role);
            inv.Owner = this;
            this.Hide();
            inv.Closed += (s, ev) => {
                try { this.Show(); } catch { }
            };
            inv.Show();
        }
        catch (Exception ex)
        {
            // Log and show a friendly message
            Logger.Log(ex);
            MessageBox.Show($"حدث خطأ أثناء محاولة تسجيل الدخول. تم حفظ التفاصيل في app-error.log.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            Application.Current.Shutdown();
        }
    }

    private void CreateAccountBtn_Click(object sender, RoutedEventArgs e)
    {
        var win = new CreateAccountWindow();
        win.Owner = this;
        win.ShowDialog();
    }

    private void ForgotBtn_Click(object sender, RoutedEventArgs e)
    {
        var win = new ResetPasswordWindow();
        win.Owner = this;
        win.ShowDialog();
    }
}
