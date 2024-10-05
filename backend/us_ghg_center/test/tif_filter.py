import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
import numpy as np
from scipy import ndimage
import os
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
from cartopy.feature import COASTLINE, BORDERS
from matplotlib.colors import LinearSegmentedColormap
import psutil


def print_memory_usage():
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    print(f"Uso de memória: {memory_info.rss / 1024 / 1024:.2f} MB")


def process_tiff(input_path, output_path, scale_factor, target_crs='EPSG:4326'):
    print("Iniciando pré-processamento do TIFF")
    print_memory_usage()

    # Criar o diretório 'results' se não existir
    results_dir = os.path.dirname(output_path)
    os.makedirs(results_dir, exist_ok=True)

    # 1-4. Leitura, reprojeção, recorte e reamostragem
    with rasterio.open(input_path) as src:
        width = int(src.width * scale_factor)
        height = int(src.height * scale_factor)

        transform, _, _ = calculate_default_transform(
            src.crs, target_crs, width, height, *src.bounds)
        kwargs = src.meta.copy()
        kwargs.update({
            'crs': target_crs,
            'transform': transform,
            'width': width,
            'height': height
        })

        with rasterio.open(output_path, 'w', **kwargs) as dst:
            reproject(
                source=rasterio.band(src, 1),
                destination=rasterio.band(dst, 1),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=target_crs,
                resampling=Resampling.bilinear)

    # Leitura do arquivo reprojetado
    with rasterio.open(output_path) as reprojected:
        image = reprojected.read(1)

    # 5-9. Processamento da imagem
    scaler = MinMaxScaler(feature_range=(0, 1))
    image_normalized = scaler.fit_transform(
        image.reshape(-1, 1)).reshape(image.shape)
    image_linearized = np.power(image_normalized, 0.5)
    image_segmented = np.where(image_linearized > 0.5, 1, 0)
    image_atm_corrected = image_linearized * 1.1
    image_kriged = ndimage.gaussian_filter(image_atm_corrected, sigma=1)

    # Salvar a imagem processada
    with rasterio.open(output_path, 'w', **kwargs) as dst:
        dst.write(image_kriged, 1)

    print("Pré-processamento do TIFF concluído")
    print_memory_usage()

    return output_path, kwargs


# Exemplo de uso da função
if __name__ == "__main__":
    input_tiff = '../data/antropogenic/odiac2023_1km_excl_intl_200112.tif'
    output_tiff = 'results/processed_image.tif'
    processed_tiff, metadata = process_tiff(input_tiff, output_tiff)
    print(f"Arquivo processado salvo em: {processed_tiff}")
    print("Metadata:", metadata)