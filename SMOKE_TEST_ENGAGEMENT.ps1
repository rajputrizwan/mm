param(
  [string]$FrontendUrl = "http://localhost:5173",
  [string]$BackendUrl = "http://localhost:5000",
  [string]$PythonUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"
$failures = New-Object System.Collections.Generic.List[string]

function Assert-HttpOk {
  param(
    [string]$Name,
    [string]$Url
  )

  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 300) {
      Write-Output ("PASS | {0} | {1} | {2}" -f $Name, $resp.StatusCode, $Url)
      return $resp
    }

    $msg = ("FAIL | {0} | HTTP {1} | {2}" -f $Name, $resp.StatusCode, $Url)
    Write-Output $msg
    $failures.Add($msg)
    return $null
  } catch {
    $msg = ("FAIL | {0} | {1} | {2}" -f $Name, $_.Exception.Message, $Url)
    Write-Output $msg
    $failures.Add($msg)
    return $null
  }
}

Write-Output "=== Reachability checks ==="
Assert-HttpOk -Name "Frontend root" -Url "$FrontendUrl/" | Out-Null
Assert-HttpOk -Name "Frontend /engagement-demo" -Url "$FrontendUrl/engagement-demo" | Out-Null
Assert-HttpOk -Name "Backend /health" -Url "$BackendUrl/health" | Out-Null
Assert-HttpOk -Name "Python root" -Url "$PythonUrl/" | Out-Null

Write-Output "=== Socket pipeline checks ==="
Push-Location "intervau-ai-frontend"
try {
  $nodeScript = @'
const { io } = require('socket.io-client');

const backendUrl = process.env.SMOKE_BACKEND_URL || 'http://localhost:5000';
const sessionId = 'smoke_' + Date.now();
const frame = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAzSURBVDhPpcixEQAgAAOhjO7mOgDVnwUN29n9QlRERVRERVRERVRERVRERVRERVRERUQP6wh/EIgtQ8EAAAAASUVORK5CYII=';

const socket = io(`${backendUrl}/engagement`, {
  transports: ['websocket', 'polling'],
  timeout: 6000,
});

let gotMetrics = false;

socket.on('connect', () => {
  console.log('PASS | Socket connect');

  socket.emit('start-session', { sessionId, userId: 'smoke-test' }, (startRes) => {
    if (!startRes || !startRes.success) {
      console.error('FAIL | start-session', JSON.stringify(startRes));
      process.exit(2);
    }
    console.log('PASS | start-session');

    socket.emit('analyze-frame', { sessionId, frame, timestamp: Date.now() }, (analyzeRes) => {
      if (!analyzeRes || !analyzeRes.success) {
        console.error('FAIL | analyze-frame', JSON.stringify(analyzeRes));
        process.exit(3);
      }
      console.log('PASS | analyze-frame ack');

      setTimeout(() => {
        socket.emit('end-session', { sessionId }, (endRes) => {
          if (!endRes || !endRes.success) {
            console.error('FAIL | end-session', JSON.stringify(endRes));
            process.exit(4);
          }
          console.log('PASS | end-session');

          if (!gotMetrics) {
            console.error('FAIL | engagement-metrics event missing');
            process.exit(5);
          }

          console.log('PASS | engagement-metrics event');
          process.exit(0);
        });
      }, 900);
    });
  });
});

socket.on('engagement-metrics', () => {
  gotMetrics = true;
});

socket.on('connect_error', (err) => {
  console.error('FAIL | socket connect_error', err.message);
  process.exit(6);
});

setTimeout(() => {
  console.error('FAIL | socket smoke timeout');
  process.exit(7);
}, 12000);
'@

  $env:SMOKE_BACKEND_URL = $BackendUrl
  node -e $nodeScript
  if ($LASTEXITCODE -ne 0) {
    $msg = "FAIL | Socket smoke script exited with code $LASTEXITCODE"
    Write-Output $msg
    $failures.Add($msg)
  }
} finally {
  Pop-Location
}

Write-Output "=== Result ==="
if ($failures.Count -gt 0) {
  Write-Output "SMOKE FAILED"
  $failures | ForEach-Object { Write-Output $_ }
  exit 1
}

Write-Output "SMOKE PASSED"
exit 0
