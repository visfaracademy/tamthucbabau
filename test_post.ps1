$data = @{
    timestamp     = (Get-Date -Format "dd/MM/yyyy HH:mm:ss")
    fullName      = "Nguyễn Thị Phương"
    phone         = "0347875229"
    email         = "phuong.nguyen@gmail.com"
    pregnancyWeek = "3 tháng giữa (Tuần 14 - 27)"
    planType      = "Gieo Hạt Tùy Tâm"
    notes         = "Mong muốn kiến tạo thai kỳ bình an"
}
$json = $data | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/register" -Method Post -Body $json -ContentType "application/json"
$response | ConvertTo-Json
