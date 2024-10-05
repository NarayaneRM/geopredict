import pyvista as pv
import numpy as np
import rasterio
from scipy import ndimage
import requests
from io import BytesIO
from PIL import Image

def enhance_contrast(data, percentile_low=1, percentile_high=99):
    p_low, p_high = np.percentile(data[~np.isnan(data)], [percentile_low, percentile_high])
    return np.clip((data - p_low) / (p_high - p_low), 0, 1)

def non_linear_normalize(data, factor=0.3):
    return np.power(data, factor)

def download_earth_texture():
    url = "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg"
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    img = img.convert("RGB")
    return pv.numpy_to_texture(np.array(img))

def create_earth_sphere(radius=1.0, resolution=400):
    sphere = pv.Sphere(radius=radius, theta_resolution=resolution, phi_resolution=resolution//2)
    sphere.texture_map_to_sphere(inplace=True)
    return sphere

def plot_global_3d(tif_path):
    # Carregar dados do TIF
    with rasterio.open(tif_path) as src:
        data = src.read(1)
        height, width = data.shape
        print(f"CRS: {src.crs}")
        print(f"Bounds: {src.bounds}")

    # Processar dados
    data_smooth = ndimage.gaussian_filter(data, sigma=1)
    data_enhanced = enhance_contrast(data_smooth, percentile_low=1, percentile_high=99)
    data_normalized = non_linear_normalize(data_enhanced, factor=0.3)

    # Criar coordenadas esféricas
    lon = np.linspace(-180, 180, width)
    lat = np.linspace(90, -90, height)
    lon, lat = np.meshgrid(lon, lat)

    # Converter para coordenadas cartesianas
    radius = 1.02  # Ligeiramente maior que o raio da Terra
    x = radius * np.cos(np.radians(lat)) * np.cos(np.radians(lon))
    y = radius * np.cos(np.radians(lat)) * np.sin(np.radians(lon))
    z = radius * np.sin(np.radians(lat))

    # Criar nuvem de pontos
    mask = ~np.isnan(data_normalized)
    points = np.column_stack((x[mask], y[mask], z[mask]))
    cloud = pv.PolyData(points)
    cloud["values"] = data_normalized[mask]

    # Criar globo com coordenadas de textura
    sphere = create_earth_sphere(radius=1.0, resolution=400)
    
    # Baixar e carregar textura da Terra
    tex = download_earth_texture()

    # Criar plotter
    plotter = pv.Plotter()
    plotter.add_mesh(sphere, texture=tex)
    
    # Adicionar nuvem de pontos
    plotter.add_mesh(cloud, render_points_as_spheres=True, point_size=3, 
                     scalars="values", cmap="viridis", clim=[0, 1])

    # Configurar câmera
    plotter.camera_position = [(0, 0, 3), (0, 0, 0), (0, 1, 0)]

    # Mostrar plot
    plotter.show()

# Uso
tif_path = "../data/processed_tiffs_antropogenic_odiac/processed_odiac2023_1km_excl_intl_200112.tif"
plot_global_3d(tif_path)