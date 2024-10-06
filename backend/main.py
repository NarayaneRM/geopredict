from flask import Flask
from flask_cors import CORS
from APIs.globe_api import globe_api
from APIs.wildfire_api import wildfire_api
from APIs.country_api import country_api  # Add this line

app = Flask(__name__)
CORS(app)

# Register the blueprints
app.register_blueprint(globe_api)
app.register_blueprint(wildfire_api)
app.register_blueprint(country_api)  # Add this line

@app.route('/')
def home():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Globe Data, Wildfire, and Country Totals API</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            h2 { color: #666; }
            code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Welcome to the Globe Data, Wildfire, and Country Totals API</h1>
        
        <h2>Available Endpoints:</h2>
        
        <h3>1. Globe Data</h3>
        <p>Use: <code>/api/globe_data?year=YYYY&type=TYPE&month=MM</code></p>
        <p>Example: <code>/api/globe_data?year=2021&type=natural</code></p>
        
        <h3>2. Wildfire Data</h3>
        <p>Use: <code>/api/fire_data</code></p>
        
        <h3>3. Country Totals</h3>
        <p>Use: <code>/api/country_totals?year=YYYY&type=TYPE&month=MM</code></p>
        <p>Example: <code>/api/country_totals?year=2021&type=natural</code></p>
        
        <h3>4. Available Years</h3>
        <p>Use: <code>/api/available_years?type=TYPE</code></p>
        <p>Example: <code>/api/available_years?type=natural</code></p>
        
        <h2>Additional Endpoints:</h2>
        <ul>
            <li><code>/api/process_data</code> (POST method)</li>
            <li><code>/api/compare_years</code></li>
            <li><code>/api/compare_years_detailed</code></li>
        </ul>
        
        <p>Replace YYYY with the desired year, TYPE with 'natural' or 'anthropogenic', and MM with the month (default is 12).</p>
    </body>
    </html>
    """

if __name__ == "__main__":
    app.run(debug=True)
