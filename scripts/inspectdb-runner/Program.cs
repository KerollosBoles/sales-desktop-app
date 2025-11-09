using Microsoft.Data.Sqlite;
using System;

var dbPath = "C:\\Users\\Kerollos\\Desktop\\sales-desktop-app\\shop.db";
if (!System.IO.File.Exists(dbPath))
{
    Console.WriteLine($"DB not found at: {dbPath}");
    return 1;
}

var cs = $"Data Source={dbPath}";
using var cnn = new SqliteConnection(cs);
cnn.Open();
using var cmd = cnn.CreateCommand();
cmd.CommandText = "SELECT Id, Username, Role, CreatedAt FROM Users";
using var reader = cmd.ExecuteReader();
var any = false;
while (reader.Read())
{
    any = true;
    var id = reader.GetInt64(0);
    var username = reader.IsDBNull(1) ? "(null)" : reader.GetString(1);
    var role = reader.IsDBNull(2) ? -1 : reader.GetInt32(2);
    var created = reader.IsDBNull(3) ? "(null)" : reader.GetString(3);
    Console.WriteLine($"{id} | {username} | Role={role} | {created}");
}
if (!any) Console.WriteLine("No users found in Users table.");
return 0;
