Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\dimil\Downloads\Central-de-Servidores"
WshShell.Run """C:\Users\dimil\Downloads\Central-de-Servidores\php\php.exe"" -S 0.0.0.0:8000 router.php", 0, False
