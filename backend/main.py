from flask import Flask
from flask_cors import CORS
from APIs.globe_api import globe_api
from APIs.wildfire_api import wildfire_api

app = Flask(__name__)
CORS(app)

# Registrar os blueprints
app.register_blueprint(globe_api)
app.register_blueprint(wildfire_api)


@app.route('/')
def home():
    return "Welcome to the Globe Data and Wildfire API. Use /api/globe_data?year=YYYY for globe data and /api/fire_data for wildfire data."


if __name__ == "__main__":
    app.run(debug=True)
