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


def preprocess_tiff(input_path, output_path, target_crs='EPSG:4326', scale_factor=0.1):
    print("Iniciando pré-processamento do TIFF")
    print_memory_usage()

    # Criar o diretório 'results' se não existir
    results_dir = os.path.join(os.path.dirname(__file__), 'results')
    os.makedirs(results_dir, exist_ok=True)

    # 1. Leitura do arquivo TIFF e reprojeção
    with rasterio.open(input_path) as src:
        print("1. Leitura do arquivo TIFF concluída")
        print_memory_usage()

        # 2. Verificação e correção da projeção
        # Calcular as novas dimensões
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
        print("2. Verificação e correção da projeção concluída")
        print_memory_usage()

        # 3 & 4. Recorte e Reamostragem
        with rasterio.open(output_path, 'w', **kwargs) as dst:
            reproject(
                source=rasterio.band(src, 1),
                destination=rasterio.band(dst, 1),
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=target_crs,
                resampling=Resampling.bilinear)
        print("3 & 4. Recorte e Reamostragem concluídos")
        print_memory_usage()

        # Leitura do arquivo reprojetado
        with rasterio.open(output_path) as reprojected:
            image = reprojected.read(1)  # Lê a primeira banda
        print("Leitura do arquivo reprojetado concluída")
        print_memory_usage()

    # 5. Normalização dos dados
    scaler = MinMaxScaler(feature_range=(0, 1))
    image_normalized = scaler.fit_transform(
        image.reshape(-1, 1)).reshape(image.shape)
    print("5. Normalização dos dados concluída")
    print_memory_usage()

    # 6. Linearização das intensidades (simulação)
    image_linearized = np.power(image_normalized, 0.5)
    print("6. Linearização das intensidades concluída")
    print_memory_usage()

    # 7. Filtro de cores e segmentação (simulação)
    image_segmented = np.where(image_linearized > 0.5, 1, 0)
    print("7. Filtro de cores e segmentação concluídos")
    print_memory_usage()

    # 8. Correção atmosférica (simulação)
    image_atm_corrected = image_linearized * 1.1
    print("8. Correção atmosférica concluída")
    print_memory_usage()

    # 9. Interpolação espacial (krigagem) (simulação)
    image_kriged = ndimage.gaussian_filter(image_atm_corrected, sigma=1)
    print("9. Interpolação espacial (krigagem) concluída")
    print_memory_usage()

    # Visualização da evolução do processamento
    print("Iniciando visualização da evolução do processamento")
    plt.figure(figsize=(20, 12))
    images = [image, image_normalized, image_linearized,
              image_segmented, image_atm_corrected, image_kriged]
    titles = ['Imagem Inicial', 'Normalização', 'Linearização',
              'Segmentação', 'Correção Atmosférica', 'Krigagem']

    for i, (img, title) in enumerate(zip(images, titles)):
        plt.subplot(2, 3, i+1)
        plt.imshow(img, cmap='viridis')
        plt.title(title)
        plt.colorbar()

    plt.tight_layout()
    plt.savefig(os.path.join(results_dir, 'processing_evolution.png'))
    plt.close()
    print("Visualização da evolução do processamento concluída")
    print_memory_usage()

    # Plotagem 2D e 3D
    print("Iniciando plotagem 2D e 3D")
    plt.figure(figsize=(20, 10))

    # 2D plot
    plt.subplot(121)
    plt.imshow(image_kriged, cmap='viridis')
    plt.title('Plotagem 2D')
    plt.colorbar()

    # 3D plot
    ax = plt.subplot(122, projection='3d')
    x = np.arange(0, image_kriged.shape[1])
    y = np.arange(0, image_kriged.shape[0])
    X, Y = np.meshgrid(x, y)
    ax.plot_surface(X, Y, image_kriged, cmap='viridis')
    ax.set_title('Plotagem 3D')

    plt.tight_layout()
    plt.savefig(os.path.join(results_dir, '2d_3d_comparison.png'))
    plt.close()
    print("Plotagem 2D e 3D concluída")
    print_memory_usage()

    # Criar um mapa de cores personalizado
    colors = ['blue', 'cyan', 'green', 'yellow', 'orange', 'red']
    n_bins = 100
    cmap_custom = LinearSegmentedColormap.from_list('custom', colors, N=n_bins)

    # Criar uma grade de longitude e latitude
    lons = np.linspace(-180, 180, image_kriged.shape[1])
    lats = np.linspace(90, -90, image_kriged.shape[0])  # Note a inversão aqui
    lons, lats = np.meshgrid(lons, lats)

    # Nova visualização: Mapa Mundi 2D, 2D com espectro ampliado e Globo 3D
    print("Iniciando visualização do Mapa Mundi 2D, 2D com espectro ampliado e Globo 3D")
    fig = plt.figure(figsize=(20, 15))

    # Mapa Mundi 2D
    ax0 = fig.add_subplot(211, projection=ccrs.PlateCarree())
    ax0.set_global()
    ax0.add_feature(COASTLINE)
    ax0.add_feature(BORDERS)
    im0 = ax0.pcolormesh(lons, lats, image_kriged,
                         transform=ccrs.PlateCarree(), cmap=cmap_custom)
    ax0.set_title('Mapa Mundi 2D', fontsize=16)

    # 2D plot com espectro ampliado
    ax1 = fig.add_subplot(223)
    im1 = ax1.imshow(image_kriged, cmap=cmap_custom, aspect='auto',
                     # Invertemos a latitude aqui
                     extent=[-180, 180, 90, -90], origin='upper')
    ax1.set_title('Plotagem 2D (Espectro Ampliado)', fontsize=14)
    ax1.set_xlabel('Longitude')
    ax1.set_ylabel('Latitude')
    cbar1 = plt.colorbar(im1, ax=ax1, label='Intensidade',
                         orientation='vertical')

    # Após ajustar as posições dos subplots

    # Ajustar a posição da barra de cores do plot 2D
    ax1_pos = ax1.get_position()
    cbar1.ax.set_position(
        [ax1_pos.x1 + 0.01, ax1_pos.y0, 0.02, ax1_pos.height])

    # 3D Globe plot
    ax2 = fig.add_subplot(224, projection=ccrs.Orthographic(0, 0))
    ax2.add_feature(COASTLINE)
    ax2.add_feature(BORDERS)

    # Plotar os dados no globo
    im2 = ax2.pcolormesh(lons, lats, image_kriged,
                         transform=ccrs.PlateCarree(), cmap=cmap_custom)
    ax2.set_global()
    ax2.gridlines()
    ax2.set_title('Globo 3D', fontsize=14)

    # Ajustar o layout
    plt.tight_layout()

    # Ajustar a posição do mapa mundi para centralizá-lo e ocupar toda a largura
    ax0_pos = ax0.get_position()
    ax0.set_position([0.05, ax0_pos.y0, 0.9, ax0_pos.height])

    # Ajustar os outros plots para ficarem alinhados abaixo e com espaço entre eles
    ax1_pos = ax1.get_position()
    ax2_pos = ax2.get_position()
    width = (ax0_pos.x1 - ax0_pos.x0 - 0.05) / \
        2  # 0.05 é o espaço entre os plots
    ax1.set_position([ax0_pos.x0, ax1_pos.y0, width, ax1_pos.height])
    ax2.set_position([ax0_pos.x0 + width + 0.05,
                     ax2_pos.y0, width, ax2_pos.height])

    # Ajustar a posição da barra de cores do plot 2D
    ax1_pos = ax1.get_position()
    cbar1.ax.set_position(
        [ax1_pos.x1 + 0.01, ax1_pos.y0, 0.02, ax1_pos.height])

    plt.savefig(os.path.join(results_dir, '2d_3d_globe_comparison_with_map.png'),
                dpi=300, bbox_inches='tight')
    plt.close()
    print("Visualização do Mapa Mundi 2D, 2D com espectro ampliado e Globo 3D concluída")
    print_memory_usage()

    print("Pré-processamento do TIFF concluído")
    print_memory_usage()
    return image_kriged, kwargs


# Uso da função
# input_tiff = '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200112.tif'
input_tiff = '../data/antropogenic/odiac2023_1km_excl_intl_200112.tif'
output_tiff = 'final_image.tif'
print("Iniciando processamento do arquivo:", input_tiff)
print_memory_usage()
processed_data, metadata = preprocess_tiff(
    input_tiff, output_tiff, scale_factor=0.1)

print("Processed data shape:", processed_data.shape)
print("Metadata:", metadata)
print("Processamento concluído")
print_memory_usage()
