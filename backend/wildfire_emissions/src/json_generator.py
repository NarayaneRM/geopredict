import json
import numpy as np


def generate_plot_data(full_data, br_states):
    plot_data = []

    for _, row in full_data.iterrows():
        state_geo = br_states[br_states['state_normalized'] == row['state_normalized']]
        if not state_geo.empty:
            plot_data.append({
                'year_month': f"{row['year']}-{row['month']}",
                'state': row['state'],
                'latitude': float(state_geo.iloc[0]['latitude']),
                'longitude': float(state_geo.iloc[0]['longitude']),
                'fire_count': int(row['fire_count']) if not np.isnan(row['fire_count']) else 0,
                'carbon_emission': float(row['carbon_emission']) if not np.isnan(row['carbon_emission']) else 0.0
            })
        else:
            print(f"Estado não encontrado: {row['state']} (normalizado: {row['state_normalized']})")

    return plot_data


def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)