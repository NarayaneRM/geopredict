def calculate_emissions(data, emission_factor=0.021):
    data['carbon_emission'] = data['fire_count'] * emission_factor
    return data