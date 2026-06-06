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
    
    if 'SERVIDORES' in df.columns:
        excel_names = set(str(val).strip() for val in df['SERVIDORES'].dropna().unique() if str(val).strip() and str(val).lower() != 'nan')
        
        # Obter servidores atuais no banco
        cursor.execute("SELECT id, name FROM servers")
        db_servers = {row[1].strip(): row[0] for row in cursor.fetchall()}
        db_names = set(db_servers.keys())
        
        # Identificar diferenças
        new_names = excel_names - db_names
        removed_names = db_names - excel_names
        
        # Inserir novos servidores
        added_count = 0
        for name in new_names:
            cursor.execute(
                "INSERT INTO servers (name, url, logo, status, description) VALUES (?, ?, ?, ?, ?)",
                (name, "http://", "", "active", "")
            )
            added_count += 1
            print(f"Adicionado: {name}")
            
        # Remover servidores que não estão mais na planilha
        removed_count = 0
        for name in removed_names:
            cursor.execute("DELETE FROM servers WHERE id = ?", (db_servers[name],))
            removed_count += 1
            print(f"Removido: {name}")
            
        conn.commit()
        print(f"\nSincronização concluída com sucesso!")
        print(f" - Servidores adicionados: {added_count}")
        print(f" - Servidores removidos: {removed_count}")
    else:
        print("Erro: A coluna 'SERVIDORES' não foi encontrada na planilha.")
        
    conn.close()

except Exception as e:
    print(f"Ocorreu um erro durante a importação: {e}")
