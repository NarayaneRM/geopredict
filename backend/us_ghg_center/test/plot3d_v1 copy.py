import rasterio
import numpy as np
import plotly.graph_objects as go
from scipy import ndimage


def enhance_contrast(data, percentile_low=1, percentile_high=99):
    p_low, p_high = np.percentile(data[~np.isnan(data)], [
                                  percentile_low, percentile_high])
    return np.clip((data - p_low) / (p_high - p_low), 0, 1)


def non_linear_normalize(data, factor=0.3):
    return np.power(data, factor)


def create_custom_colorscale():
    colors = ['darkblue', 'blue', 'cyan', 'lightgreen',
              'yellow', 'orange', 'red', 'darkred']
    n_bins = len(colors)
    return [(i/(n_bins-1), color) for i, color in enumerate(colors)]


def generate_globe_data(tif_path):
    with rasterio.open(tif_path) as src:
        data = src.read(1)
        height, width = data.shape

    lons = np.linspace(-180, 180, width)
    lats = np.linspace(90, -90, height)
    lon, lat = np.meshgrid(lons, lats)

    # Aplicar filtro de suavização
    data_smooth = ndimage.gaussian_filter(data, sigma=1)

    # Realçar contraste
    data_enhanced = enhance_contrast(
        data_smooth, percentile_low=1, percentile_high=99)

    # Normalização não-linear para destacar diferenças
    data_normalized = non_linear_normalize(data_enhanced, factor=0.3)

    # Criar uma escala de cores personalizada compatível com Plotly
    custom_colorscale = create_custom_colorscale()

    fig = go.Figure(data=go.Scattergeo(
        lon=lon.flatten(),
        lat=lat.flatten(),
        mode='markers',
        marker=dict(
            size=2,
            color=data_normalized.flatten(),
            colorscale=custom_colorscale,
            colorbar_title='Valor Normalizado',
            showscale=True,
            cmin=0,
            cmax=1
        )
    ))

    fig.update_layout(
        title='Visualização Global 3D - Contraste Aprimorado',
        geo=dict(
            projection_type='orthographic',
            showland=True,
            landcolor="rgb(212, 212, 212)",
            showocean=True,
            oceancolor="rgb(20, 20, 50)",
            showcoastlines=True,
            coastlinecolor="rgb(255, 255, 255)",
            showcountries=True,
            countrycolor="rgb(255, 255, 255)"
        )
    )

    fig.show()
