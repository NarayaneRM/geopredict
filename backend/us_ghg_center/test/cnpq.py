import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
import numpy as np
from scipy import ndimage
import os
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt

def preprocess_tiff(input_path, output_path, target_crs='EPSG:4326', target_resolution=(0.01, 0.01)):
    # 1. Leitura do arquivo TIFF
    with rasterio.open(input_path) as src:
        # 2. Verificação e correção da projeção
        transform, width, height = calculate_default_transform(
            src.crs, target_crs, src.width, src.height, *src.bounds)
        kwargs = src.meta.copy()
        kwargs.update({
            'crs': target_crs,
            'transform': transform,
            'width': width,
            'height': height
        })

        # 3 & 4. Recorte e Reamostragem
        with rasterio.open(output_path, 'w', **kwargs) as dst:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dst, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=target_crs,
                    resampling=Resampling.bilinear)

    # Leitura do arquivo reprojetado
    with rasterio.open(output_path) as src:
        image = src.read(1)  # Lê a primeira banda

    # 5. Normalização dos dados
    scaler = MinMaxScaler(feature_range=(0, 1))
    image_normalized = scaler.fit_transform(image)

    # 6. Extração de características (exemplo: cálculo de gradiente)
    gradient_x = ndimage.sobel(image_normalized, axis=0)
    gradient_y = ndimage.sobel(image_normalized, axis=1)
    gradient_magnitude = np.sqrt(gradient_x**2 + gradient_y**2)

    # 7. Criação de máscaras (exemplo: máscara para valores muito baixos)
    mask = image_normalized > 0.1

    # 8. Divisão em tiles (exemplo: divisão em 4 tiles)
    tile_size = (image.shape[0] // 2, image.shape[1] // 2)
    tiles = [
        image_normalized[:tile_size[0], :tile_size[1]],
        image_normalized[:tile_size[0], tile_size[1]:],
        image_normalized[tile_size[0]:, :tile_size[1]],
        image_normalized[tile_size[0]:, tile_size[1]:]
    ]

    # 9. Conversão para o formato de entrada do modelo (exemplo: numpy array)
    model_input = np.array(tiles)

    # 10. Preparação dos metadados
    metadata = {
        'crs': src.crs.to_string(),
        'transform': src.transform.to_gdal(),
        'width': src.width,
        'height': src.height
    }

    # 11. Validação dos dados
    assert not np.isnan(model_input).any(), "NaN values detected in the processed data"
    assert model_input.shape == (4, tile_size[0], tile_size[1]), "Unexpected shape of processed data"

    # Visualização para verificação
    plt.figure(figsize=(12, 8))
    plt.subplot(221)
    plt.imshow(image_normalized, cmap='viridis')
    plt.title('Normalized Image')
    plt.subplot(222)
    plt.imshow(gradient_magnitude, cmap='viridis')
    plt.title('Gradient Magnitude')
    plt.subplot(223)
    plt.imshow(mask, cmap='binary')
    plt.title('Mask')
    plt.subplot(224)
    plt.imshow(tiles[0], cmap='viridis')
    plt.title('First Tile')
    plt.tight_layout()
    plt.savefig('preprocessed_visualization.png')

    return model_input, metadata

# Uso da função
input_tiff = 'example.tif'
output_tiff = 'resultado.tif'
processed_data, metadata = preprocess_tiff(input_tiff, output_tiff)

print("Processed data shape:", processed_data.shape)
print("Metadata:", metadata)