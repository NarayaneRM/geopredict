# Salve este arquivo como tif_analyzer.py

import rasterio
import numpy as np
from rasterio.warp import transform_bounds
import pyproj
from datetime import datetime


def analyze_tif(tif_path):
    with rasterio.open(tif_path) as src:
        # Informações básicas
        crs = src.crs
        bounds = src.bounds
        if crs != pyproj.CRS.from_epsg(4326):
            bounds = transform_bounds(crs, pyproj.CRS.from_epsg(4326), *bounds)
        min_lon, min_lat, max_lon, max_lat = bounds
        width, height = src.width, src.height

        # Verificar data
        date_info = None
        if 'TIFFTAG_DATETIME' in src.tags():
            date_str = src.tags()['TIFFTAG_DATETIME']
            try:
                date_info = datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
            except ValueError:
                date_info = f"Data encontrada, mas em formato não padrão: {
                    date_str}"

        # Verificar cobertura de oceanos
        sample = src.read(1, window=(
            (0, min(100, height)), (0, min(100, width))))
        has_ocean = np.any(sample != src.nodata)

        # Verificar outros metadados relevantes
        metadata = src.tags()

        # Determinar a extensão aproximada
        lon_span = max_lon - min_lon
        lat_span = max_lat - min_lat

        if lon_span >= 350 and lat_span >= 150:
            coverage = "Este arquivo provavelmente cobre o mundo todo ou quase todo."
        elif lon_span > 50 or lat_span > 50:
            coverage = "Este arquivo provavelmente cobre um país grande ou uma região continental."
        elif lon_span > 5 or lat_span > 5:
            coverage = "Este arquivo provavelmente cobre um país pequeno ou uma região."
        else:
            coverage = "Este arquivo provavelmente cobre uma cidade ou uma área local."

        return {
            "crs": str(crs),
            "bounds": {
                "min_lon": min_lon,
                "min_lat": min_lat,
                "max_lon": max_lon,
                "max_lat": max_lat
            },
            "dimensions": {
                "width": width,
                "height": height
            },
            "date_info": date_info,
            "has_ocean": has_ocean,
            "metadata": metadata,
            "coverage": coverage
        }


def print_tif_analysis(tif_path):
    info = analyze_tif(tif_path)

    print(f"Sistema de Coordenadas: {info['crs']}")
    print(f"Limites geográficos:")
    print(f"  Longitude: {info['bounds']['min_lon']} a {
          info['bounds']['max_lon']}")
    print(f"  Latitude: {info['bounds']['min_lat']} a {
          info['bounds']['max_lat']}")
    print(f"Dimensões do raster: {info['dimensions']['width']} x {
          info['dimensions']['height']}")

    if info['date_info']:
        print(f"Data do dado: {info['date_info']}")
    else:
        print("Não foi possível determinar a data do dado a partir dos metadados.")

    print(f"Cobertura de oceanos: {
          'Sim' if info['has_ocean'] else 'Não ou indeterminado'}")
    print(f"Cobertura estimada: {info['coverage']}")

    print("\nOutros metadados relevantes:")
    for key, value in info['metadata'].items():
        print(f"  {key}: {value}")
