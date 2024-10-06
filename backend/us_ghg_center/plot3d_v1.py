import rasterio
import numpy as np
import json
import os
import random
import glob

# Variáveis de configuração
RESOLUTION = 2  # Ajuste este valor para controlar a densidade dos pontosy
MAX_POINTS = 100000  # Número máximo de pontos a serem processados


def preprocess_globe_data(tif_path, output_path, resolution=RESOLUTION, max_points=MAX_POINTS):
    print(f"Processing TIF file: {tif_path}")
    with rasterio.open(tif_path) as src:
        data = src.read(1)[::resolution, ::resolution]
        height, width = data.shape

    print(f"TIF dimensions after resolution adjustment: {height} x {width}")

    lons = np.linspace(-180, 180, width)
    lats = np.linspace(90, -90, height)
    lon, lat = np.meshgrid(lons, lats)

    # Normalize data
    data_min = np.nanmin(data)
    data_max = np.nanmax(data)
    data_normalized = (data - data_min) / (data_max - data_min)

    # Create a list of all valid points
    all_points = []
    for i in range(height):
        for j in range(width):
            if not np.isnan(data_normalized[i, j]):
                all_points.append({
                    'lat': float(lat[i, j]),
                    'lon': float(lon[i, j]),
                    'value': float(data_normalized[i, j])
                })

    # Randomly sample points if we have more than max_points
    if len(all_points) > max_points:
        points = random.sample(all_points, max_points)
    else:
        points = all_points

    # Save to JSON file
    with open(output_path, 'w') as f:
        json.dump(points, f)

    print(f"Processed {len(points)} points. Min value: {
          data_min}, Max value: {data_max}")
    print(f"JSON file saved to: {output_path}")


def process_all_tifs(tif_folder, output_folder):
    print(f"Searching for TIF files in: {tif_folder}")
    tif_files = glob.glob(os.path.join(tif_folder, "*.tif"))
    print(f"Found {len(tif_files)} TIF files")

    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    print(f"Output folder: {output_folder}")

    for tif_file in tif_files:
        print(f"Processing file: {tif_file}")
        filename = os.path.basename(tif_file)
        date_part = filename.split('_')[-1].split('.')[0]
        year = date_part[:4]
        month = date_part[4:]

        output_path = os.path.join(
            output_folder, f"globe_data_{year}_{month}.json")
        print(f"Output path: {output_path}")
        preprocess_globe_data(tif_file, output_path)
        print(f"Processed file for {year}-{month}")

    print("Finished processing all TIF files")


def get_globe_data(json_path):
    with open(json_path, 'r') as f:
        return json.load(f)


def get_available_years(json_folder):
    print(f"Searching for JSON files in: {json_folder}")
    if not os.path.exists(json_folder):
        print(f"Folder {json_folder} does not exist")
        return []

    json_files = glob.glob(os.path.join(json_folder, "globe_data_*.json"))
    print(f"Found {len(json_files)} JSON files")

    years = set()
    for f in json_files:
        print(f"Processing JSON file: {f}")
        year = os.path.basename(f).split('_')[2]
        years.add(year)

    result = sorted(list(years))
    print(f"Available years: {result}")
    return result

# Remove outras funções não utilizadas


def check_json_files(tif_folder, json_folder):
    tif_files = glob.glob(os.path.join(tif_folder, "*.tif"))
    json_files = glob.glob(os.path.join(json_folder, "globe_data_*.json"))

    return len(tif_files) == len(json_files)

# Adicione esta função ao final do arquivo
