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
    return "Welcome to the Globe Data, Wildfire, and Country Totals API. Use /api/globe_data?year=YYYY for globe data, /api/fire_data for wildfire data, and /api/country_totals?year=YYYY for country totals."

if __name__ == "__main__":
    app.run(debug=True)
