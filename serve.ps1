param(
    [int]$Port = 3000
)

$Folder = $PSScriptRoot
if (-not $Folder) { $Folder = (Get-Location).Path }

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")

try {
    $Listener.Start()
} catch {
    Write-Host "Port $Port is busy, trying port $($Port + 1)..." -ForegroundColor Yellow
    $Port++
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add("http://localhost:$Port/")
    $Listener.Start()
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

$Url = "http://localhost:$Port/"
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  B2B DATA GLOBAL LLC — Local Server Active:             " -ForegroundColor Green
Write-Host "  $Url                                                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the local server." -ForegroundColor Gray
Write-Host ""

Start-Process $Url

while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $RawPath = $Request.Url.LocalPath
        if ($RawPath -eq "/" -or $RawPath -eq "") {
            $FilePath = Join-Path $Folder "index.html"
        } else {
            $RelativePath = $RawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            $FilePath = Join-Path $Folder $RelativePath
        }

        # Clean URL resolution: e.g. /about -> about.html
        if (-not (Test-Path -Path $FilePath -PathType Leaf)) {
            $Ext = [System.IO.Path]::GetExtension($FilePath)
            if (-not $Ext) {
                if (Test-Path -Path "$FilePath.html" -PathType Leaf) {
                    $FilePath = "$FilePath.html"
                } else {
                    $FilePath = Join-Path $Folder "index.html"
                }
            }
        }

        if (Test-Path -Path $FilePath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Ext]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }
            $Response.ContentType = $ContentType

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $NotFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $Response.OutputStream.Write($NotFound, 0, $NotFound.Length)
        }
        $Response.OutputStream.Close()
    } catch {
        # Catch and continue on client socket resets
    }
}
