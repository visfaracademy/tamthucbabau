$port = 8080
$prefix = "http://localhost:$port/"
$baseDir = "D:\sales-page-tam-thuc-bau"
$csvFile = Join-Path $baseDir "danh-sach-dang-ky.csv"

# Khởi tạo file CSV nếu chưa tồn tại
if (-not (Test-Path $csvFile)) {
    $header = "Thời gian,Họ và Tên,Số điện thoại,Email,Tuần thai,Gói đăng ký,Lời nhắn / Ghi chú"
    [System.IO.File]::WriteAllLines($csvFile, @($header), [System.Text.Encoding]::UTF8)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Server running at $prefix"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Thêm CORS headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $path = $request.Url.LocalPath.TrimStart('/')

        # Xử lý API đăng ký học viên (POST /api/register)
        if ($request.HttpMethod -eq "POST" -and $path -eq "api/register") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            
            try {
                $data = $body | ConvertFrom-Json
                $time = if ($data.timestamp) { $data.timestamp } else { (Get-Date -Format "dd/MM/yyyy HH:mm:ss") }
                $name = if ($data.fullName) { $data.fullName.Replace('"', '""') } else { "" }
                $phone = if ($data.phone) { $data.phone.Replace('"', '""') } else { "" }
                $email = if ($data.email) { $data.email.Replace('"', '""') } else { "" }
                $week = if ($data.pregnancyWeek) { $data.pregnancyWeek.Replace('"', '""') } else { "" }
                $plan = if ($data.planType) { $data.planType.Replace('"', '""') } else { "" }
                $notes = if ($data.notes) { $data.notes.Replace('"', '""') } else { "" }

                $csvLine = "`"$time`",`"$name`",`"'$phone`",`"$email`",`"$week`",`"$plan`",`"$notes`""
                Add-Content -LiteralPath $csvFile -Value $csvLine -Encoding UTF8
                Write-Host "[ĐĂNG KÝ MỚI]: $name - $phone - $plan" -ForegroundColor Green
            } catch {
                Write-Host "Error parsing registration body: $_" -ForegroundColor Red
            }

            $response.ContentType = "application/json; charset=utf-8"
            $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"result":"success","message":"Saved to local CSV"}')
            $response.ContentLength64 = $resBytes.Length
            $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            $response.Close()
            continue
        }

        if ([string]::IsNullOrWhiteSpace($path)) {
            $path = "index.html"
        }
        $filePath = Join-Path $baseDir $path

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".csv"  { "text/csv; charset=utf-8" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $msg.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        }
        $response.Close()
    } catch {
        # ignore client disconnect
    }
}
