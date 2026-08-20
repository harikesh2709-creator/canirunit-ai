# CanIRunIt.ai - Native Hardware Scanner (Windows)

$code = Get-Random -Minimum 100000 -Maximum 999999
$endpoint = "http://localhost:3000/api/sync"
$appUrl = "http://localhost:3000"

Write-Host "[*] Detecting hardware..." -ForegroundColor Cyan

$gpuName = "Unknown"
$vramGB = 8

# Try nvidia-smi first (relying on PATH)
try {
    $gpuInfo = & nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>$null
    if ($gpuInfo) {
        # If multiple GPUs (e.g. laptop), take the first one (usually dedicated)
        $firstGpu = ($gpuInfo -split "`n")[0]
        $parts = $firstGpu -split ", "
        if ($parts.Length -ge 2) {
            $gpuName = $parts[0]
            $vramMB = [int]$parts[1]
            $vramGB = [Math]::Round($vramMB / 1024)
        }
    }
} catch {
    # nvidia-smi not found on PATH, fallback to WMI
    $gpus = Get-CimInstance Win32_VideoController
    if ($gpus) {
        # Try to find a dedicated GPU (usually NVIDIA or AMD Radeon RX, ignoring basic "Graphics")
        $dedicated = $gpus | Where-Object { $_.Name -match "NVIDIA|RTX|GTX|RX \d" } | Select-Object -First 1
        $gpu = if ($dedicated) { $dedicated } else { $gpus[0] }
        
        $gpuName = $gpu.Name
        # AdapterRAM is sometimes inaccurate for >4GB on older WMI, but good for fallback
        $vramGB = [Math]::Round([uint64]$gpu.AdapterRAM / 1GB)
        if ($vramGB -le 0) { $vramGB = 8 }
    }
}

Write-Host "[+] Detected: $gpuName ($($vramGB)GB VRAM)" -ForegroundColor Green
Write-Host "[~] Syncing with web interface..." -ForegroundColor Cyan

$payload = @{
    code = [string]$code
    gpuName = $gpuName
    vramGB = $vramGB
}

$jsonPayload = $payload | ConvertTo-Json -Compress

Invoke-RestMethod -Uri $endpoint -Method Post -Body $jsonPayload -ContentType "application/json" | Out-Null

$syncUrl = "$appUrl/?sync=$code"
Write-Host "[>] Opening $syncUrl ..." -ForegroundColor Cyan

Start-Process $syncUrl
