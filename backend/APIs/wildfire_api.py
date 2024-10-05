from flask import Blueprint, jsonify
import sys
import os

# Adicione o diretório pai ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from wildfire_emissions.src.data_processing import load_and_preprocess_data
from wildfire_emissions.src.emissions_calculation import calculate_emissions
from wildfire_emissions.src.geo_processing import load_and_process_shapefile
from wildfire_emissions.src.json_generator import generate_plot_data, save_json
import traceback

wildfire_api = Blueprint('wildfire_api', __name__)

WILDFIRE_CSV_FOLDER = './wildfire_emissions/data/csv'
WILDFIRE_SHAPEFILE_PATH = './wildfire_emissions/data/shp/BR_UF_2022.shp'
WILDFIRE_OUTPUT_FILE = './wildfire_emissions/data/json/plot_data.json'

# Variável global para armazenar os dados processados de wildfire
wildfire_plot_data = None

def process_wildfire_data():
    global wildfire_plot_data
    try:
        print("1. Iniciando o carregamento e pré-processamento dos dados...")
        full_data = load_and_preprocess_data(WILDFIRE_CSV_FOLDER)
        print("2. Dados carregados e pré-processados com sucesso.")

        print("3. Calculando emissões...")
        full_data = calculate_emissions(full_data)
        print("4. Emissões calculadas com sucesso.")

        print("5. Carregando e processando o shapefile...")
        br_states = load_and_process_shapefile(WILDFIRE_SHAPEFILE_PATH)
        print("6. Shapefile carregado e processado com sucesso.")

        print("7. Gerando dados para plotagem...")
        wildfire_plot_data = generate_plot_data(full_data, br_states)
        print("8. Dados para plotagem gerados com sucesso.")

        print("9. Salvando dados em JSON...")
        save_json(wildfire_plot_data, WILDFIRE_OUTPUT_FILE)
        print(f"10. Dados para plotagem gerados e salvos em '{WILDFIRE_OUTPUT_FILE}'")
    except Exception as e:
        print(f"Erro durante o processamento de dados: {str(e)}")
        print(traceback.format_exc())
        raise

@wildfire_api.route('/api/fire_data')
def get_fire_data():
    global wildfire_plot_data
    try:
        print("Requisição recebida para /api/fire_data")
        if wildfire_plot_data is None:
            print("Dados ainda não processados. Iniciando processamento...")
            process_wildfire_data()
        print("Retornando dados processados...")
        return jsonify(wildfire_plot_data)
    except Exception as e:
        print(f"Erro ao retornar dados: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500