from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
from plot3d_v1 import process_all_tifs, get_globe_data, get_available_years, check_json_files
import os
import json
import hashlib

app = Flask(__name__)
CORS(app)

TIF_FOLDER = "./data/processed_tiffs_natural_micasa"
JSON_FOLDER = "./data/preprocessed_globe_data"

# Create JSON_FOLDER if it doesn't exist
os.makedirs(JSON_FOLDER, exist_ok=True)

# Ensure JSON files are generated only once when the server starts
if not check_json_files(TIF_FOLDER, JSON_FOLDER):
    print("JSON files are missing or outdated. Generating new JSON files...")
    process_all_tifs(TIF_FOLDER, JSON_FOLDER)
else:
    print("All JSON files are up to date.")

# Cache available years
AVAILABLE_YEARS = get_available_years(JSON_FOLDER)

def calculate_json_hash(json_path):
    with open(json_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

@app.route('/')
def home():
    return "Welcome to the Globe Data API. Use /api/globe_data?year=YYYY to get data for a specific year."

@app.route('/api/process_data', methods=['POST'])
def process_data():
    try:
        process_all_tifs(TIF_FOLDER, JSON_FOLDER)
        return jsonify({"message": "All TIF files processed successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error processing TIF files: {str(e)}")
        return jsonify({"error": f"Error processing TIF files: {str(e)}"}), 500

@app.route('/api/available_years')
def available_years():
    return jsonify(AVAILABLE_YEARS)

@app.route('/api/globe_data')
def get_globe_data_api():
    year = request.args.get('year')
    month = request.args.get('month', '12')  # Default to December if month not provided
    if not year:
        return jsonify({"error": "Year parameter is required"}), 400

    json_path = os.path.join(JSON_FOLDER, f"globe_data_{year}_{month}.json")
    try:
        data = get_globe_data(json_path)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": f"Data for year {year} and month {month} not found"}), 404
    except Exception as e:
        app.logger.error(f"Error reading data: {str(e)}")
        return jsonify({"error": f"Error reading data: {str(e)}"}), 500

@app.route('/api/compare_years')
def compare_years():
    year1 = '2001'
    year2 = '2021'
    month = '12'

    json_path_2001 = os.path.join(JSON_FOLDER, f"globe_data_{year1}_{month}.json")
    json_path_2021 = os.path.join(JSON_FOLDER, f"globe_data_{year2}_{month}.json")

    try:
        hash_2001 = calculate_json_hash(json_path_2001)
        hash_2021 = calculate_json_hash(json_path_2021)

        are_equal = hash_2001 == hash_2021

        with open(json_path_2001, 'r') as f:
            data_2001 = json.load(f)
        with open(json_path_2021, 'r') as f:
            data_2021 = json.load(f)

        return jsonify({
            "are_equal": are_equal,
            "hash_2001": hash_2001,
            "hash_2021": hash_2021,
            "data_length_2001": len(data_2001),
            "data_length_2021": len(data_2021),
            "first_point_2001": data_2001[0] if data_2001 else None,
            "first_point_2021": data_2021[0] if data_2021 else None,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare_years_detailed')
def compare_years_detailed():
    year1 = '2001'
    year2 = '2022'
    month = '12'

    json_path_2001 = os.path.join(JSON_FOLDER, f"globe_data_{year1}_{month}.json")
    json_path_2022 = os.path.join(JSON_FOLDER, f"globe_data_{year2}_{month}.json")

    try:
        with open(json_path_2001, 'r') as f:
            data_2001 = json.load(f)
        with open(json_path_2022, 'r') as f:
            data_2022 = json.load(f)

        # Compare lengths
        length_equal = len(data_2001) == len(data_2022)

        # Compare each point
        differences = []
        for i, (point_2001, point_2022) in enumerate(zip(data_2001, data_2022)):
            if point_2001 != point_2022:
                differences.append({
                    'index': i,
                    'point_2001': point_2001,
                    'point_2022': point_2022
                })

        are_equal = len(differences) == 0

        return jsonify({
            "are_equal": are_equal,
            "length_equal": length_equal,
            "data_length_2001": len(data_2001),
            "data_length_2022": len(data_2022),
            "number_of_differences": len(differences),
            "first_5_differences": differences[:5] if differences else None,
            "first_point_2001": data_2001[0] if data_2001 else None,
            "first_point_2022": data_2022[0] if data_2022 else None,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
