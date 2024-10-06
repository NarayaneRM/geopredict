from flask import Blueprint, jsonify, request
import os
import json
from collections import defaultdict
import reverse_geocoder as rg

country_api = Blueprint('country_api', __name__)

JSON_FOLDER_NATURAL = "./us_ghg_center/data/preprocessed_globe_data_natural"
JSON_FOLDER_ANTHROPOGENIC = "./us_ghg_center/data/preprocessed_globe_data_anthropogenic"
COUNTRY_TOTALS_FOLDER = "./us_ghg_center/data/country_totals"

# Ensure the country totals folder exists
os.makedirs(COUNTRY_TOTALS_FOLDER, exist_ok=True)

@country_api.route('/api/country_totals')
def get_country_totals():
    year = request.args.get('year')
    month = request.args.get('month', '12')
    data_type = request.args.get('type', 'natural')
    
    if not year:
        return jsonify({"error": "Year parameter is required"}), 400

    json_folder = JSON_FOLDER_ANTHROPOGENIC if data_type == 'anthropogenic' else JSON_FOLDER_NATURAL
    input_json_path = os.path.join(json_folder, f"globe_data_{year}_{month}.json")
    output_json_path = os.path.join(COUNTRY_TOTALS_FOLDER, f"country_totals_{data_type}_{year}_{month}.json")
    
    try:
        # Check if the country totals file already exists
        if os.path.exists(output_json_path):
            with open(output_json_path, 'r') as f:
                return jsonify(json.load(f))
        
        # If not, process the data
        with open(input_json_path, 'r') as f:
            globe_data = json.load(f)
        
        country_totals = defaultdict(float)
        
        # Group coordinates to make fewer calls to reverse_geocoder
        coordinates = [(point['lat'], point['lon']) for point in globe_data]
        country_info = rg.search(coordinates)
        
        for point, info in zip(globe_data, country_info):
            country = info['cc']
            country_totals[country] += point['value']
        
        result = {
            "year": year,
            "month": month,
            "type": data_type,
            "country_totals": dict(country_totals)
        }
        
        # Save the result to a new JSON file
        with open(output_json_path, 'w') as f:
            json.dump(result, f)
        
        return jsonify(result)
    except FileNotFoundError:
        return jsonify({"error": f"Data for year {year}, month {month}, and type {data_type} not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Error processing data: {str(e)}"}), 500
