# GeoPredict: Interactive Platform for Predictive Modeling of Greenhouse Gas Emissions

First deploy version: [GeoPredict](https://geopredict-437815.web.app/)

## 1. What is the project

GeoPredict is an interactive platform developed to predict greenhouse gas (GHG) emissions, using machine learning models applied to geospatial data. The platform aims to promote digital inclusion, facilitating community access to emission data and its analysis.

## 2. Databases Used

The GeoPredict platform leverages several geospatial and emissions-related databases to provide accurate and up-to-date information for modeling and analysis. Below are the main data sources integrated into the platform:

### 1. **US GHG Center: MICASA (Model of Integrating Climate and Atmosphere for Spatial Analysis)**
   - **Description**: This dataset provides information on natural emissions, including data from various biomes and ecosystems. MICASA focuses on emissions from natural causes, such as volcanic activity, oceanic currents, and vegetative processes.
   - **Use in GeoPredict**: Natural emissions data is visualized on the 3D globe, allowing users to filter by year and country to track emissions patterns from natural sources.
   - **Data Range**: 2001 - 2022

### 2. **US GHG Center: ODIAC (Open-source Data Inventory for Anthropogenic CO2)**
   - **Description**: ODIAC offers high-resolution data on CO2 emissions from human activities, including energy production, industry, and transportation sectors. This database is widely used for global-scale analysis of anthropogenic emissions.
   - **Use in GeoPredict**: The platform uses ODIAC data to model human-caused emissions, contributing to its predictive models for future emissions scenarios.
   - **Data Range**: 2001 - 2022

### 3. **US GHG Center: EMIT (Emission Monitoring and Impact Tracking)**
   - **Description**: EMIT provides data on significant emission events, such as wildfires, industrial accidents, and major natural disasters. This dataset is updated in real-time, offering near-instantaneous tracking of emission spikes.
   - **Use in GeoPredict**: EMIT data is integrated into the platform’s real-time modeling, allowing users to observe how major events contribute to global GHG emissions.
   - **Data Range**: 2022

### 4. **SEEG (System for Estimating Greenhouse Gas Emissions)**
   - **Description**: SEEG is a Brazilian database that focuses on GHG emissions from various sectors within the country, such as deforestation, agriculture, and energy. The platform provides data for all states in Brazil.
   - **Use in GeoPredict**: GeoPredict integrates SEEG data to focus on emissions within Brazil, especially in the Amazon region. This helps users visualize the impact of deforestation and other activities on local and global emissions.
   - **Data Range**: 1998 - 2022

### 5. **INPE (Brazilian National Institute for Space Research)**
   - **Description**: INPE provides real-time data on wildfire outbreaks across Brazil. This dataset includes geographic coordinates, fire intensity, and emissions from burning biomass.
   - **Use in GeoPredict**: INPE’s wildfire data is visualized alongside emissions from various Brazilian states, showing how these events contribute to overall GHG levels in the region.
   - **Data Range**: Real-time data (updated monthly)


## 3. Features and Models

The platform integrates several features for predicting GHG emissions:
- **Emissions and Wildfire Data**: Combines real-time wildfire outbreaks from INPE and CO2e, CH4, and CO2 emissions data from SEEG across all Brazilian states.
- **Interactive Timeline**: Allows users to explore global GHG emissions from natural causes (MICASA data), human activities (ODIAC data), and large events (EMIT data) through a 3D globe with year and country filters.
- **Predicting Model (Education)**: Uses data from 2001-2022 from the US GHG Center, with a forecast for 2050 emissions using Convolutional Neural Networks (CNN) for spatial effects and Long Short-Term Memory (LSTM) for temporal effects.
- **Visualization (Education)**:  Users can interact with the predicting model in a city analogy mode to visualize the impacts of their choices on GHG emissions.

## 4. Technologies involved

### Backend
- Python
- Flask
- NumPy
- SciPy
- PyProj
- PyVista
- Pillow
- Rasterio
- VTK
- Plotly
- TensorFlow
- Scikit-learn

### Frontend
- React
- React Router
- React Globe.gl
- D3.js
- Plotly.js
- Three.js
- Recharts
- Material-UI (MUI)
- React Spring

## 5. Requirements

- Python 3.8+
- Node.js 14+
- npm 6+

## 6. Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/geopredict.git
   cd geopredict
   ```

2. Set up the environment and install dependencies (Windows):
   ```bash
   run.bat setup
   ```

3. To run the project (Windows):
   ```bash
   run.bat run
   ```

For more details on available commands in Windows, run `run.bat` without arguments.

Note: The `run.bat` file is specific to Windows systems. If you're using macOS or Linux, you'll need to run the equivalent commands manually or create a similar shell script for your operating system.

For macOS/Linux users, you can follow these general steps:

1. Set up the backend:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Run the project:
   - In one terminal, start the backend:
     ```bash
     cd backend
     source venv/bin/activate
     python main.py
     ```
   - In another terminal, start the frontend:
     ```bash
     cd frontend
     npm start
     ```

## 7. Contributors

- [Narayane Ribeiro Medeiros](https://github.com/NarayaneRM) - Lead Developer
- [Francisco Eduardo Fontenele Ramos Neto](https://github.com/fontflows) - Data Scientist
- [Juan Marco de Jesus Libonatti](https://github.com/WarXenozord) - UI/UX Designer

## 8. License

This project is licensed under the [insert license type, e.g., MIT License] - see the [LICENSE.md](LICENSE.md) file for details.

## 9. Acknowledgments

- We thank the Technological Institute of Aeronautics (ITA - Brazil) for the support and resources provided.
- Our recognition to the open-source community for the tools and libraries used in this project.