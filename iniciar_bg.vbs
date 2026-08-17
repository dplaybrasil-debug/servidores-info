Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\dimil\Downloads\Central-de-Servidores"
WshShell.Run """C:\Users\dimil\Downloads\Central-de-Servidores\php\php.exe"" -S 127.0.0.1:8000", 0, False
