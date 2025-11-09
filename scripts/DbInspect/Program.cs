using System;
using Microsoft.Data.Sqlite;

var dbPath = Path.GetFullPath("..\\..\\shop.db");
Console.WriteLine($"Inspecting DB: {dbPath}");
if (!File.Exists(dbPath))
{
    Console.WriteLine("DB file not found.");
    return 1;
}

using var conn = new SqliteConnection($"Data Source={dbPath}");
conn.Open();

var tablesCmd = conn.CreateCommand();
tablesCmd.CommandText = "SELECT name FROM sqlite_master WHERE type='table'";
using var reader = tablesCmd.ExecuteReader();
Console.WriteLine("Tables:");
while (reader.Read()) Console.WriteLine(" - " + reader.GetString(0));

Console.WriteLine();
// List users
var cmd = conn.CreateCommand();
cmd.CommandText = "SELECT Id, Username, PasswordHash, Role, CreatedAt FROM Users";
try
{
    using var r2 = cmd.ExecuteReader();
    Console.WriteLine("Users:");
    while (r2.Read())
    {
        Console.WriteLine($"Id={r2.GetInt32(0)}, Username={r2.GetString(1)}, Role={r2.GetInt32(3)}, CreatedAt={r2.GetString(4)}");
    }
}
catch (Exception ex)
{
    Console.WriteLine("Could not read Users table: " + ex.Message);
}

// If username and password provided as args, attempt authentication
if (args.Length >= 2)
{
    var uname = args[0];
    var pwd = args[1];
    var q = conn.CreateCommand();
    q.CommandText = "SELECT PasswordHash FROM Users WHERE Username = $u";
    q.Parameters.AddWithValue("$u", uname);
    var ph = q.ExecuteScalar() as string;
    if (ph == null)
    {
        Console.WriteLine($"User '{uname}' not found.");
        return 0;
    }
    // compute sha256
    using var sha = System.Security.Cryptography.SHA256.Create();
    var hash = Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(pwd)));
    Console.WriteLine($"StoredHash={ph}");
    Console.WriteLine($"ComputedHash={hash}");
    Console.WriteLine(hash.Equals(ph, StringComparison.OrdinalIgnoreCase) ? "Password OK" : "Password MISMATCH");
}

return 0;
