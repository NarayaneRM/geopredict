from flask import Flask, jsonify
from flask_cors import CORS
from plot3d_v1 import generate_globe_data

app = Flask(__name__)
CORS(app)

@app.route('/api/globe-data')
def get_globe_data():
    tif_path = "example.tif"  # Certifique-se de que este arquivo existe
    try:
        globe_data = generate_globe_data(tif_path)
        return globe_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
