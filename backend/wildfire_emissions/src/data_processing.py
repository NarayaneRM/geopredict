import os
import pandas as pd
import unicodedata
import re


def normalize_state_name(name):
    # Remove acentos e converte para minúsculas
    normalized = ''.join(c.lower() for c in unicodedata.normalize('NFD', name) if unicodedata.category(c) != 'Mn')
    # Remove caracteres especiais, mas mantém espaços e underscores
    normalized = re.sub(r'[^a-z\s_]', '', normalized)
    # Substitui underscores por espaços
    normalized = normalized.replace('_', ' ')
    # Remove espaços extras
    normalized = ' '.join(normalized.split())
    return normalized


def format_state_name(name):
    words = name.replace('_', ' ').split()
    formatted_name = ' '.join(word.capitalize() for word in words)
    replacements = {
        'Sao': 'São',
        'Para': 'Pará',
        'Paraiba': 'Paraíba',
        'Amapa': 'Amapá',
        'Goias': 'Goiás',
        'Rondonia': 'Rondônia'
    }
    for old, new in replacements.items():
        formatted_name = formatted_name.replace(old, new)
    return formatted_name


def load_and_preprocess_data(csv_folder):
    state_files = [f for f in os.listdir(csv_folder) if f.startswith('historico_estado_') and f.endswith('.csv')]

    dfs = []
    for state_file in state_files:
        try:
            df = pd.read_csv(os.path.join(csv_folder, state_file), index_col=0)
            state_name = state_file.split('_', 2)[-1].replace('.csv', '')
            df['state'] = format_state_name(state_name)
            df['state_normalized'] = normalize_state_name(state_name)
            df = df.reset_index()

            df = df[~df['index'].isin(['Máximo*', 'Média*', 'Mínimo*'])]

            df = df.melt(id_vars=['index', 'state', 'state_normalized'], var_name='month', value_name='fire_count')
            df['year'] = df['index'].astype(int)
            df['fire_count'] = pd.to_numeric(df['fire_count'], errors='coerce')
            dfs.append(df)
        except Exception as e:
            print(f"Erro ao carregar {state_file}: {e}")

    full_data = pd.concat(dfs, ignore_index=True)
    return full_data