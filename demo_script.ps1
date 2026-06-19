[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
# demo_script.ps1 - Démo Asset Management System
Write-Host "`n Démo Asset Management System" -ForegroundColor Cyan
$login = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@test.com","password":"admin123"}'
$headers = @{"Authorization"="Bearer $($login.access_token)"; "Content-Type"="application/json"}
Write-Host "auth OK" -ForegroundColor Green
Write-Host "`n Catégories:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8000/categories" -Method Get -Headers $headers | Format-Table name
Write-Host "`n Actifs:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8000/assets" -Method Get -Headers $headers | Format-Table name, status
Write-Host "`n Health:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:8000/health" | Format-List
Write-Host "`n Démo terminée avec succès !" -ForegroundColor Green
