import urllib.request, re, zipfile, io, os
print("Buscando a versão mais recente do PHP portátil para Windows...")
req = urllib.request.urlopen("https://windows.php.net/downloads/releases/")
html = req.read().decode('utf-8')
# Find a recent 8.x NTS x64 zip
match = re.search(r'href="(php-8\.[34]\.\d+-nts-Win32-vs16-x64\.zip)"', html)
if match:
    filename = match.group(1)
    url = "https://windows.php.net/downloads/releases/" + filename
    print("Baixando " + filename + "... (Isso pode levar alguns segundos)")
    res = urllib.request.urlopen(url)
    print("Extraindo arquivos...")
    with zipfile.ZipFile(io.BytesIO(res.read())) as z:
        z.extractall("php")
    print("PHP extraído com sucesso na pasta 'php'!")
else:
    print("Erro: Não foi possível encontrar a versão do PHP.")
