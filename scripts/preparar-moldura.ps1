# Prepara uma arte exportada do Canva pra virar Template Visual do app.
#
# Convencao: no Canva, pinte de magenta puro (#FF00FF) as areas que o app vai
# preencher. Este script converte cada area magenta em:
#   -Furo   x,y  -> transparente (a foto do produto entra POR BAIXO da arte)
#   -Branco x,y  -> branco solido (tarja onde o app escreve texto)
#
# A area e identificada por um PONTO qualquer dentro dela (flood fill), nao por
# retangulo: nas artes com elementos inclinados as areas se cruzam em x/y, e
# caixas retangulares acabariam brigando pela mesma faixa de pixels.
#
# -LimparTexto "x1,y1,x2,y2" apaga textos de exemplo (pixels neutros) numa
# regiao, preservando as cores saturadas do desenho.
#
# Uso:
#   pwsh scripts/preparar-moldura.ps1 `
#     -Origem "arte-canva\feed_1.png" -Destino "public\templates\feed_1.png" `
#     -Furo "543,700" -Branco "572,1048"

param(
  [Parameter(Mandatory=$true)][string]$Origem,
  [Parameter(Mandatory=$true)][string]$Destino,
  [string[]]$Furo = @(),
  [string[]]$Branco = @(),
  [string[]]$LimparTexto = @()
)

Add-Type -AssemblyName System.Drawing

function ParsePontos($lista) {
  $r = New-Object System.Collections.ArrayList
  foreach ($s in $lista) {
    $p = $s.Split(",") | ForEach-Object { [int]$_.Trim() }
    [void]$r.Add(@($p[0], $p[1]))
  }
  # A virgula evita o unrolling do PowerShell: sem ela uma lista de um item
  # volta como valores soltos.
  return ,$r
}
function ParseCaixas($lista) {
  $r = New-Object System.Collections.ArrayList
  foreach ($s in $lista) {
    $p = $s.Split(",") | ForEach-Object { [int]$_.Trim() }
    [void]$r.Add(@($p[0], $p[1], $p[2], $p[3]))
  }
  return ,$r
}

$origemAbs = (Resolve-Path $Origem).Path
$img = [System.Drawing.Bitmap]::FromFile($origemAbs)
$w = $img.Width; $h = $img.Height
$out = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$rect = New-Object System.Drawing.Rectangle(0,0,$w,$h)
$dIn  = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly,  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dOut = $out.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$n = $dIn.Stride * $h
$bi = New-Object byte[] $n
$bo = New-Object byte[] $n
[System.Runtime.InteropServices.Marshal]::Copy($dIn.Scan0, $bi, 0, $n)
$stride = $dIn.Stride

# Mascara de magenta, com tolerancia pra pegar a borda antialiasada
$total = $w * $h
$mask = New-Object bool[] $total
for ($y=0; $y -lt $h; $y++) {
  $row = $y * $stride
  $off = $y * $w
  for ($x=0; $x -lt $w; $x++) {
    $i = $row + $x*4
    if ($bi[$i+2] -gt 180 -and $bi[$i] -gt 180 -and $bi[$i+1] -lt 130) {
      $mask[$off + $x] = $true
    }
  }
}

# 0 = intacto, 1 = furo, 2 = branco
$acao = New-Object byte[] $total

function Marcar($semente, $valor) {
  $sx = $semente[0]; $sy = $semente[1]
  $p0 = $sy * $script:w + $sx
  if (-not $script:mask[$p0]) {
    Write-Output "  AVISO: ponto ($sx,$sy) nao esta em area magenta — ignorado"
    return 0
  }
  $fila = New-Object System.Collections.Generic.Queue[int]
  $fila.Enqueue($p0)
  $script:acao[$p0] = $valor
  $cnt = 0
  while ($fila.Count -gt 0) {
    $p = $fila.Dequeue()
    $cnt++
    $py = [int][Math]::Floor($p / $script:w)
    $px = $p - ($py * $script:w)
    if ($px -gt 0)                { $q = $p - 1;          if ($script:mask[$q] -and $script:acao[$q] -eq 0) { $script:acao[$q]=$valor; $fila.Enqueue($q) } }
    if ($px -lt $script:w - 1)    { $q = $p + 1;          if ($script:mask[$q] -and $script:acao[$q] -eq 0) { $script:acao[$q]=$valor; $fila.Enqueue($q) } }
    if ($py -gt 0)                { $q = $p - $script:w;  if ($script:mask[$q] -and $script:acao[$q] -eq 0) { $script:acao[$q]=$valor; $fila.Enqueue($q) } }
    if ($py -lt $script:h - 1)    { $q = $p + $script:w;  if ($script:mask[$q] -and $script:acao[$q] -eq 0) { $script:acao[$q]=$valor; $fila.Enqueue($q) } }
  }
  return $cnt
}

foreach ($s in (ParsePontos $Furo))   { $c = Marcar $s 1; Write-Output "  furo em ($($s[0]),$($s[1])): $c px" }
foreach ($s in (ParsePontos $Branco)) { $c = Marcar $s 2; Write-Output "  branco em ($($s[0]),$($s[1])): $c px" }

$limpezas = ParseCaixas $LimparTexto
$nLimpo = 0
for ($y=0; $y -lt $h; $y++) {
  $row = $y * $stride
  $off = $y * $w
  for ($x=0; $x -lt $w; $x++) {
    $i = $row + $x*4
    $a = $acao[$off + $x]
    if ($a -eq 1) { $bo[$i]=0; $bo[$i+1]=0; $bo[$i+2]=0; $bo[$i+3]=0; continue }
    if ($a -eq 2) { $bo[$i]=255; $bo[$i+1]=255; $bo[$i+2]=255; $bo[$i+3]=255; continue }

    $b = $bi[$i]; $g = $bi[$i+1]; $r = $bi[$i+2]
    $dentro = $false
    foreach ($c in $limpezas) {
      if ($x -ge $c[0] -and $x -le $c[2] -and $y -ge $c[1] -and $y -le $c[3]) { $dentro = $true; break }
    }
    if ($dentro) {
      $max = [Math]::Max($r, [Math]::Max($g, $b))
      $min = [Math]::Min($r, [Math]::Min($g, $b))
      $media = ($r + $g + $b) / 3
      if (($max - $min) -lt 60 -and $media -lt 245) {
        $bo[$i]=255; $bo[$i+1]=255; $bo[$i+2]=255; $bo[$i+3]=255
        $nLimpo++
        continue
      }
    }
    $bo[$i]=$b; $bo[$i+1]=$g; $bo[$i+2]=$r; $bo[$i+3]=255
  }
}
if ($nLimpo -gt 0) { Write-Output "  texto limpo: $nLimpo px" }

[System.Runtime.InteropServices.Marshal]::Copy($bo, 0, $dOut.Scan0, $n)
$img.UnlockBits($dIn)
$out.UnlockBits($dOut)

$destinoAbs = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Destino))
$dir = [System.IO.Path]::GetDirectoryName($destinoAbs)
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$out.Save($destinoAbs, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $img.Dispose()
Write-Output "  salvo: $Destino"
