import matplotlib.pyplot as plt
from cartopy.feature import COASTLINE, BORDERS
import cartopy.crs as ccrs
import os
import numpy as np
import rasterio
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, LSTM, TimeDistributed, BatchNormalization, Dropout
from sklearn.model_selection import train_test_split
from tif_filter import process_tiff
import psutil
from tensorflow.keras.callbacks import EarlyStopping

# Model and data processing parameters
SCALE_FACTOR = 0.1  # Reduce image size (0.1 = 10% of original size)
CONV_FILTERS = [2, 4, 8]  # Number of filters in each Conv2D layer
DENSE_NEURONS = [8, 4]  # Number of neurons in Dense layers
LSTM_UNITS = 50  # Number of units in LSTM layer
DROPOUT_RATE = 0.3  # Dropout rate
EPOCHS = 30  # Number of training epochs
BATCH_SIZE = 4  # Batch size for training
VALIDATION_SPLIT = 0.2  # Fraction of data to use for validation
TIME_STEPS = 5  # Number of time steps (years) to use for prediction
EARLY_STOPPING_PATIENCE = 10  # Patience for early stopping


def print_memory_usage(message):
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    print(f"{message} - Uso de memória: {memory_info.rss / 1024 / 1024:.2f} MB")


def process_multiple_tiffs(input_files, output_dir):
    processed_data = []
    for input_file in input_files:
        output_file = os.path.join(output_dir, f"processed_{os.path.basename(input_file)}")
        
        if os.path.exists(output_file):
            print(f"Processed file already exists: {output_file}")
            with rasterio.open(output_file) as src:
                data = src.read(1)
        else:
            print(f"Processing file: {input_file}")
            processed_file, _ = process_tiff(input_file, output_file, scale_factor=SCALE_FACTOR)
            with rasterio.open(processed_file) as src:
                data = src.read(1)
        
        processed_data.append(data)
    
    print_memory_usage("Após processar todos os TIFFs")
    return np.array(processed_data)


def normalize_data(data):
    return (data - np.min(data)) / (np.max(data) - np.min(data))


def prepare_data_for_cnn_lstm(data, time_steps):
    X = []
    y = []
    for i in range(len(data) - time_steps):
        X.append(data[i:i+time_steps])
        y.append(data[i+time_steps])
    X = normalize_data(np.array(X))[..., np.newaxis]
    y = normalize_data(np.array(y))[..., np.newaxis]
    return X, y


def create_cnn_lstm_model(input_shape, time_steps):
    model = Sequential([
        TimeDistributed(Conv2D(CONV_FILTERS[0], (3, 3), activation='relu', padding='same'), input_shape=(time_steps, *input_shape)),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Conv2D(CONV_FILTERS[1], (3, 3), activation='relu', padding='same')),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Conv2D(CONV_FILTERS[2], (3, 3), activation='relu', padding='same')),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Flatten()),
        LSTM(LSTM_UNITS, return_sequences=True),
        LSTM(LSTM_UNITS),
        Dense(DENSE_NEURONS[0], activation='relu'),
        Dropout(DROPOUT_RATE),
        Dense(DENSE_NEURONS[1], activation='relu'),
        Dropout(DROPOUT_RATE),
        Dense(np.prod(input_shape), activation='linear')
    ])
    model.compile(optimizer='adam', loss='mse')
    return model


def train_model(X, y):
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=VALIDATION_SPLIT, random_state=42)
    input_shape = X_train.shape[2:]  # Exclude time_steps and batch dimensions
    time_steps = X_train.shape[1]
    model = create_cnn_lstm_model(input_shape, time_steps)
    early_stopping = EarlyStopping(patience=EARLY_STOPPING_PATIENCE, restore_best_weights=True)
    model.fit(X_train, y_train.reshape(y_train.shape[0], -1),
              validation_data=(X_val, y_val.reshape(y_val.shape[0], -1)),
              epochs=EPOCHS, batch_size=BATCH_SIZE, callbacks=[early_stopping])
    return model


def predict_future(model, last_years_data):
    last_years_data = last_years_data[np.newaxis, ..., np.newaxis]
    prediction = model.predict(last_years_data)
    return prediction.reshape(last_years_data.shape[2:4])  # Reshape to match image dimensions


def save_prediction(prediction, output_path, metadata):
    # Ajuste os metadados para corresponder à forma da previsão
    metadata['count'] = 1
    metadata['height'], metadata['width'] = prediction.shape

    with rasterio.open(output_path, 'w', **metadata) as dst:
        dst.write(prediction, 1)


def plot_world_map(last_processed, prediction, output_path):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(20, 10),
                                   subplot_kw={'projection': ccrs.PlateCarree()})

    # Última imagem processada
    im1 = ax1.imshow(last_processed, cmap='viridis',
                     extent=[-180, 180, -90, 90], transform=ccrs.PlateCarree())
    ax1.add_feature(COASTLINE)
    ax1.add_feature(BORDERS)
    ax1.set_title('Última imagem processada (2020)')
    plt.colorbar(im1, ax=ax1, orientation='horizontal', label='CO2 Budget')

    # Previsão para 2025
    im2 = ax2.imshow(prediction, cmap='viridis',
                     extent=[-180, 180, -90, 90], transform=ccrs.PlateCarree())
    ax2.add_feature(COASTLINE)
    ax2.add_feature(BORDERS)
    ax2.set_title('Previsão para 2025')
    plt.colorbar(im2, ax=ax2, orientation='horizontal', label='CO2 Budget')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


def read_tiff(file_path):
    with rasterio.open(file_path) as src:
        return src.read(1), src.meta


def plot_comparison(original_2020, processed_2020, prediction_2025, output_path):
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(30, 10),
                                        subplot_kw={'projection': ccrs.PlateCarree()})

    # TIFF original de 2020
    im1 = ax1.imshow(original_2020, cmap='viridis',
                     extent=[-180, 180, -90, 90], transform=ccrs.PlateCarree())
    ax1.add_feature(COASTLINE)
    ax1.add_feature(BORDERS)
    ax1.set_title('TIFF Original 2020')
    plt.colorbar(im1, ax=ax1, orientation='horizontal', label='CO2 Budget')

    # Imagem processada de 2020
    im2 = ax2.imshow(processed_2020, cmap='viridis',
                     extent=[-180, 180, -90, 90], transform=ccrs.PlateCarree())
    ax2.add_feature(COASTLINE)
    ax2.add_feature(BORDERS)
    ax2.set_title('Imagem Processada 2020')
    plt.colorbar(im2, ax=ax2, orientation='horizontal', label='CO2 Budget')

    # Previsão para 2025
    im3 = ax3.imshow(prediction_2025, cmap='viridis',
                     extent=[-180, 180, -90, 90], transform=ccrs.PlateCarree())
    ax3.add_feature(COASTLINE)
    ax3.add_feature(BORDERS)
    ax3.set_title('Previsão para 2025')
    plt.colorbar(im3, ax=ax3, orientation='horizontal', label='CO2 Budget')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()


if __name__ == "__main__":
    print_memory_usage("Início do script")

    """input_files = [
        '../data/antropogenic/odiac2023_1km_excl_intl_200112.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200212.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200312.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200412.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200512.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200612.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200712.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200812.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_200912.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201012.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201112.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201212.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201312.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201412.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201512.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201612.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201712.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201812.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_201912.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_202012.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_202112.tif',
        '../data/antropogenic/odiac2023_1km_excl_intl_202212.tif'
    ]"""

    
     
    input_files = [
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200112.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200212.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200312.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200412.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200512.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200612.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200712.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200812.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_200912.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201012.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201112.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201212.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201312.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201412.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201512.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201612.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201712.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201812.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_201912.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_202012.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_202112.tif',
        '../data/natural/MiCASA_v1_ATMC_x3600_y1800_monthly_202212.tif'
    ]
    
    
    output_dir = 'processed_tiffs'
    os.makedirs(output_dir, exist_ok=True)

    # Check if all processed files exist
    all_processed = all(os.path.exists(os.path.join(output_dir, f"processed_{os.path.basename(f)}")) for f in input_files)

    if all_processed:
        print("All files are already processed. Skipping processing step.")
        processed_data = process_multiple_tiffs(input_files, output_dir)
    else:
        print("Processing TIFF files...")
        processed_data = process_multiple_tiffs(input_files, output_dir)

    # Prepare data for the CNN-LSTM
    print("Preparing data for the CNN-LSTM...")
    X, y = prepare_data_for_cnn_lstm(processed_data, TIME_STEPS)
    print_memory_usage("After preparing data for CNN-LSTM")

    # Train the model
    print("Training the CNN-LSTM model...")
    model = train_model(X, y)

    # Make the prediction for 2025
    print("Making the prediction for 2025...")
    prediction_2025 = predict_future(model, processed_data[-TIME_STEPS:])
    print_memory_usage("After making the prediction")

    # Salvar a previsão como TIFF
    print("Salvando a previsão como TIFF...")
    with rasterio.open(input_files[-1]) as src:
        metadata = src.meta.copy()
    save_prediction(prediction_2025, 'prediction_2025.tif', metadata)

    # Ler o TIFF original de 2020
    original_2020, _ = read_tiff(input_files[-1])

    # Plotar a comparação
    print("Gerando o mapa comparativo...")
    plot_comparison(
        original_2020, processed_data[-1], prediction_2025, 'comparison_original_processed_prediction.png')

    print("Processamento concluído. Arquivos gerados: prediction_2025.tif e comparison_original_processed_prediction.png")
    print_memory_usage("Fim do script")