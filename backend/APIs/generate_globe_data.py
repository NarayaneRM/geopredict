# backend/test/endpoints/generate_globe_data.py

import sys
import os

# Adicione o diretório pai ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify
from backend.us_ghg_center.plot3d_v1 import generate_globe_data

app = Flask(__name__)

@app.route('/api/globe-data')
def get_globe_data():
    tif_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                            "downloaded_files", "example.tif")
    globe_data = generate_globe_data(tif_path)
    return jsonify(globe_data)

if __name__ == '__main__':
    app.run(debug=True)
