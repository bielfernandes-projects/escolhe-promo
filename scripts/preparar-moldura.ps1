# Prepara uma arte exportada do Canva pra virar Template Visual do app.
#
# Faz duas coisas no PNG:
#  1. Fura (deixa transparente) a area magenta #FF00FF que marca onde entra a
#     foto do produto — o app desenha a foto por baixo da arte.
#  2. Apaga os textos de exemplo ("NOME DO PRODUTO" etc.) preenchendo com a cor
#     da tarja, pra o texto real nao ficar sobreposto ao placeholder.
#
# Uso:
#   pwsh scripts/preparar-moldura.ps1 `
#     -Origem  "C:\...\template_1_feed.png" `
#     -Destino "public\templates\achadinho-do-dia.png" `
#     -FuroAteY 1150 `
#     -LimparTexto "390,1005,760,1090"
#
# -FuroAteY: so fura magenta acima dessa linha (deixa passar pilulas/CTAs
#   magenta que sao parte do desenho).
# -LimparTexto: lista de retangulos "x1,y1,x2,y2" onde os pixels neutros
#   (texto preto e seu antialias) viram branco. Cores saturadas (dourado,
#   magenta) sao preservadas.

param(
  [Parameter(Mandatory=$true)][string]$Origem,
  [Parameter(Mandatory=$true)][string]$Destino,
  [int]$FuroAteY = 999999,
  [string[]]$LimparTexto = @()
)

Add-Type -AssemblyName System.Drawing

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

# Retangulos de limpeza como listas de inteiros
$caixas = @()
foreach ($r in $LimparTexto) {
  $p = $r.Split(",") | ForEach-Object { [int]$_.Trim() }
  $caixas += ,@($p[0], $p[1], $p[2], $p[3])
}

$furados = 0; $limpos = 0
for ($y=0; $y -lt $h; $y++) {
  $row = $y * $stride
  for ($x=0; $x -lt $w; $x++) {
    $i = $row + $x*4
    $b = $bi[$i]; $g = $bi[$i+1]; $r = $bi[$i+2]

    # 1) furo da foto
    if (($y -lt $FuroAteY) -and ($r -gt 180) -and ($b -gt 180) -and ($g -lt 130)) {
      $bo[$i]=0; $bo[$i+1]=0; $bo[$i+2]=0; $bo[$i+3]=0
      $furados++
      continue
    }

    # 2) limpeza de texto de exemplo: so pixels neutros (preto/cinza), pra nao
    #    comer a moldura dourada nem outras cores saturadas
    $dentro = $false
    foreach ($c in $caixas) {
      if ($x -ge $c[0] -and $x -le $c[2] -and $y -ge $c[1] -and $y -le $c[3]) { $dentro = $true; break }
    }
    if ($dentro) {
      $max = [Math]::Max($r, [Math]::Max($g, $b))
      $min = [Math]::Min($r, [Math]::Min($g, $b))
      $media = ($r + $g + $b) / 3
      if (($max - $min) -lt 60 -and $media -lt 245) {
        $bo[$i]=255; $bo[$i+1]=255; $bo[$i+2]=255; $bo[$i+3]=255
        $limpos++
        continue
      }
    }

    $bo[$i]=$b; $bo[$i+1]=$g; $bo[$i+2]=$r; $bo[$i+3]=255
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bo, 0, $dOut.Scan0, $n)
$img.UnlockBits($dIn)
$out.UnlockBits($dOut)

$destinoAbs = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Destino))
$dir = [System.IO.Path]::GetDirectoryName($destinoAbs)
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$out.Save($destinoAbs, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose(); $img.Dispose()

Write-Output "furados: $furados px | texto limpo: $limpos px"
Write-Output "salvo: $destinoAbs"
