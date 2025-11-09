using System;
using System.Windows;
using System.Threading.Tasks;
using Shop.Data;

namespace Shop.Presentation;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        Logger.Log("App.OnStartup start");
        // Global exception handlers
        this.DispatcherUnhandledException += App_DispatcherUnhandledException;
        AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
        TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;

        // Ensure DB and seed data
        try
        {
            Logger.Log("Ensuring seed data");
            using var db = new ShopDbContext();
            SeedData.EnsureSeedData(db);
            Logger.Log("Seed data ensured");
        }
        catch (Exception ex)
        {
            Logger.Log(ex);
        }

        Logger.Log("App.OnStartup finished");
    }

    private void App_DispatcherUnhandledException(object? sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
    {
        try
        {
            Logger.Log(e.Exception);
            MessageBox.Show($"حدث خطأ غير متوقع:\n{e.Exception.Message}\nتفاصيل محفوظة في app-error.log.", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch { }
        // prevent default unhandled exception processing
        e.Handled = true;
        Shutdown();
    }

    private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
    {
        try
        {
            if (e.ExceptionObject is Exception ex) Logger.Log(ex);
            else Logger.Log("Unhandled exception: " + e.ExceptionObject?.ToString());
        }
        catch { }
    }

    private void TaskScheduler_UnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
    {
        try
        {
            Logger.Log(e.Exception);
        }
        catch { }
    }
}

