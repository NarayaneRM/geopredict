from flask import Blueprint, jsonify, request
import sys
import os

# Adicione o diretório pai ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from us_ghg_center.plot3d_v1 import process_all_tifs, get_globe_data, get_available_years, check_json_files
import json
import hashlib

globe_api = Blueprint('globe_api', __name__)

TIF_FOLDER_NATURAL = "./us_ghg_center/data/processed_tiffs_natural_micasa"
TIF_FOLDER_ANTHROPOGENIC = "./us_ghg_center/data/processed_tiffs_antropogenic_odiac"
JSON_FOLDER_NATURAL = "./us_ghg_center/data/preprocessed_globe_data_natural"
JSON_FOLDER_ANTHROPOGENIC = "./us_ghg_center/data/preprocessed_globe_data_anthropogenic"

# Ensure JSON files are generated only once when the server starts
if not check_json_files(TIF_FOLDER_NATURAL, JSON_FOLDER_NATURAL):
    print("Natural JSON files are missing or outdated. Generating new JSON files...")
    process_all_tifs(TIF_FOLDER_NATURAL, JSON_FOLDER_NATURAL)
else:
    print("All natural JSON files are up to date.")

if not check_json_files(TIF_FOLDER_ANTHROPOGENIC, JSON_FOLDER_ANTHROPOGENIC):
    print("Anthropogenic JSON files are missing or outdated. Generating new JSON files...")
    process_all_tifs(TIF_FOLDER_ANTHROPOGENIC, JSON_FOLDER_ANTHROPOGENIC)
else:
    print("All anthropogenic JSON files are up to date.")

# Cache available years for both types
AVAILABLE_YEARS_NATURAL = get_available_years(JSON_FOLDER_NATURAL)
AVAILABLE_YEARS_ANTHROPOGENIC = get_available_years(JSON_FOLDER_ANTHROPOGENIC)

def calculate_json_hash(json_path):
    with open(json_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


@globe_api.route('/api/process_data', methods=['POST'])
def process_data():
    try:
        process_all_tifs(TIF_FOLDER_NATURAL, JSON_FOLDER_NATURAL)
        return jsonify({"message": "All TIF files processed successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Error processing TIF files: {str(e)}"}), 500


@globe_api.route('/api/available_years')
def available_years():
    data_type = request.args.get('type', 'natural')
    if data_type == 'anthropogenic':
        return jsonify(AVAILABLE_YEARS_ANTHROPOGENIC)
    else:
        return jsonify(AVAILABLE_YEARS_NATURAL)


@globe_api.route('/api/globe_data')
def get_globe_data_api():
    year = request.args.get('year')
    month = request.args.get('month', '12')
    data_type = request.args.get('type', 'natural')
    
    if not year:
        return jsonify({"error": "Year parameter is required"}), 400

    json_folder = JSON_FOLDER_ANTHROPOGENIC if data_type == 'anthropogenic' else JSON_FOLDER_NATURAL
    json_path = os.path.join(json_folder, f"globe_data_{year}_{month}.json")
    
    try:
        data = get_globe_data(json_path)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": f"Data for year {year}, month {month}, and type {data_type} not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Error reading data: {str(e)}"}), 500


@globe_api.route('/api/compare_years')
def compare_years():
    year1 = '2001'
    year2 = '2021'
    month = '12'

    json_path_2001 = os.path.join(
        JSON_FOLDER, f"globe_data_{year1}_{month}.json")
    json_path_2021 = os.path.join(
        JSON_FOLDER, f"globe_data_{year2}_{month}.json")

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


@globe_api.route('/api/compare_years_detailed')
def compare_years_detailed():
    year1 = '2001'
    year2 = '2022'
    month = '12'

    json_path_2001 = os.path.join(
        JSON_FOLDER, f"globe_data_{year1}_{month}.json")
    json_path_2022 = os.path.join(
        JSON_FOLDER, f"globe_data_{year2}_{month}.json")

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
