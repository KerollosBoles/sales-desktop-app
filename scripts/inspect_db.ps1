Add-Type -Path "$PSScriptRoot\..\publish\ShopApp\Microsoft.Data.Sqlite.dll"
$cs = "Data Source=C:\Users\Kerollos\Desktop\sales-desktop-app\shop.db"
$cnn = [Microsoft.Data.Sqlite.SqliteConnection]::new($cs)
$cnn.Open()
$cmd = $cnn.CreateCommand()
$cmd.CommandText = "SELECT Id, Username, Role, CreatedAt FROM Users"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Output ("{0} | {1} | Role={2} | {3}" -f $reader.GetInt64(0), $reader.GetString(1), $reader.GetInt32(2), $reader.GetString(3))
}
$cnn.Close()
