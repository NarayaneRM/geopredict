import geopandas as gpd
from .data_processing import normalize_state_name


def load_and_process_shapefile(shapefile_path):
    br_states = gpd.read_file(shapefile_path)

    # Assumindo que o nome da coluna com os nomes dos estados é 'NM_UF'
    br_states['state'] = br_states['NM_UF']
    br_states['state_normalized'] = br_states['NM_UF'].apply(normalize_state_name)

    # Garantir que o GeoDataFrame está em WGS84 (EPSG:4326)
    if br_states.crs != 'EPSG:4326':
        br_states = br_states.to_crs(epsg=4326)

    # Calcular o centroide e extrair as coordenadas
    centroids = br_states.geometry.centroid
    br_states['longitude'] = centroids.x
    br_states['latitude'] = centroids.y

    return br_states