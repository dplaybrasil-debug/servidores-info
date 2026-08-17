import pandas as pd
import sqlite3
import os

try:
    file_path = r'C:\Users\dimil\Downloads\DPLAY SERVIDORES.xlsx'
    print(f"Lendo o arquivo: {file_path}")
    df = pd.read_excel(file_path)
    
    # Conecta no banco do projeto
    db_path = 'database.sqlite'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    count = 0
    # A coluna principal encontrada foi 'SERVIDORES'
    if 'SERVIDORES' in df.columns:
        for index, row in df.iterrows():
            name = str(row['SERVIDORES']).strip()
            # Ignora linhas vazias
            if name and name.lower() != 'nan':
                # Inserir no banco com valores em branco para URL e Logo
                cursor.execute(
                    "INSERT INTO servers (name, url, logo, status, description) VALUES (?, ?, ?, ?, ?)",
                    (name, "http://", "", "active", "")
                )
                count += 1
        
        conn.commit()
        print(f"Sucesso! {count} servidores foram importados para o sistema.")
    else:
        print("Erro: A coluna 'SERVIDORES' não foi encontrada na planilha.")
        
    conn.close()

except Exception as e:
    print(f"Ocorreu um erro durante a importação: {e}")
