$ProgressPreference = 'SilentlyContinue'
try {
    $r = Invoke-WebRequest -Uri 'http://central-servidores.com' -UseBasicParsing -MaximumRedirection 0
    Write-Output "Status: $($r.StatusCode)"
    Write-Output "Content Length: $($r.Content.Length)"
    $preview = $r.Content.Substring(0, [Math]::Min(500, $r.Content.Length))
    Write-Output $preview
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Output "Response Status: $($_.Exception.Response.StatusCode)"
        Write-Output "Response Headers:"
        foreach ($h in $_.Exception.Response.Headers) {
            Write-Output "  $h : $($_.Exception.Response.Headers[$h])"
        }
    }
}
