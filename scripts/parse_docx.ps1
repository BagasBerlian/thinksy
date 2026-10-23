Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "d:\belajar - ai - mvp\Rencana perbaikan Thinksy.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$matches = [regex]::Matches($xmlText, '<w:t[^>]*>(.*?)</w:t>')
$extracted = ($matches | ForEach-Object { $_.Groups[1].Value }) -join " "
$extracted | Out-File -FilePath "d:\belajar - ai - mvp\scripts\docx_text.txt" -Encoding utf8
Write-Host "Length: " $extracted.Length
