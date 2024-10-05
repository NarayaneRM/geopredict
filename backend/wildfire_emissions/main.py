from src.data_processing import load_and_preprocess_data
from src.emissions_calculation import calculate_emissions
from src.geo_processing import load_and_process_shapefile
from src.json_generator import generate_plot_data, save_json
from src.visualization import create_fire_map_app

def main():
    # Configurações
    csv_folder = 'data/csv'
    shapefile_path = 'data/shp/BR_UF_2022.shp'
    output_file = 'data/json/plot_data.json'

    # Processamento de dados
    full_data = calculate_emissions(load_and_preprocess_data(csv_folder))
    br_states = load_and_process_shapefile(shapefile_path)
    plot_data = generate_plot_data(full_data, br_states)
    save_json(plot_data, output_file)
    print(f"Dados para plotagem gerados e salvos em '{output_file}'")

    # Criar e executar o aplicativo Dash
    app = create_fire_map_app(plot_data)
    print("Iniciando o servidor. Por favor, acesse http://127.0.0.1:8050/ no seu navegador.")
    app.run_server(debug=True)

if __name__ == "__main__":
    main()