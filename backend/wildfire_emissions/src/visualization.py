import plotly.graph_objects as go
import pandas as pd
import plotly.express as px
import numpy as np
from dash import Dash, dcc, html, Input, Output


def create_fire_map_app(data):
    app = Dash(__name__)

    years, months = get_available_years_and_months(data)

    # Ordenar os anos do mais recente para o mais antigo
    years = sorted(years, reverse=True)
    years = ['Total'] + years

    # Definir a ordem correta dos meses em inglês
    month_order = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December']

    # Converter os meses para inglês e ordená-los corretamente
    months_english = [month_to_english(m) for m in months if m != 'Todos']
    months_english = sorted(months_english, key=lambda x: month_order.index(x) if x in month_order else 13)
    months_english = ['All'] + months_english

    app.layout = html.Div([
        html.H1("Fire Outbreaks in Brazil"),
        dcc.Dropdown(id='year-dropdown', options=years, value='Total', clearable=False),
        dcc.Dropdown(id='month-dropdown', options=months_english, value='All', clearable=False),
        html.Button('Update Map', id='update-button', n_clicks=0),
        dcc.Graph(id='fire-map')
    ])

    @app.callback(
        Output('fire-map', 'figure'),
        Input('update-button', 'n_clicks'),
        Input('year-dropdown', 'value'),
        Input('month-dropdown', 'value')
    )
    def update_map(n_clicks, year, month):
        month_portuguese = month_to_portuguese(month)
        return plot_fire_map(data, year, month_portuguese)

    return app


def plot_fire_map(data, year='Total', month='Todos'):
    df = pd.DataFrame(data)
    df['year'] = df['year_month'].str.split('-').str[0]
    df['month'] = df['year_month'].str.split('-').str[1]

    if year == 'Total':
        # Agregar dados para o total
        df = df.groupby(['state', 'latitude', 'longitude']).agg({
            'fire_count': 'sum',
            'carbon_emission': 'sum'
        }).reset_index()
    else:
        df = df[df['year'] == year]

    if month != 'Todos':
        df = df[df['month'] == month]

    if df.empty:
        print(f"Não há dados para o ano {year} e mês {month}")
        return go.Figure()  # Return an empty figure

    # Normalizar o tamanho dos pontos
    df['normalized_size'] = np.sqrt(df['fire_count']) / np.sqrt(df['fire_count'].max()) * 30

    # Arredondar as emissões de carbono para o inteiro mais próximo
    df['carbon_emission_rounded'] = df['carbon_emission'].round().astype(int)

    fig = px.scatter_mapbox(df,
                            lat="latitude",
                            lon="longitude",
                            color="fire_count",
                            size="normalized_size",
                            hover_name="state",
                            hover_data={
                                "fire_count": True,
                                "carbon_emission_rounded": True,
                                "latitude": False,
                                "longitude": False,
                                "normalized_size": False
                            },
                            color_continuous_scale=["yellow", "orange", "red", "darkred"],
                            size_max=30,
                            zoom=3,
                            center={"lat": -14.2350, "lon": -51.9253},
                            opacity=0.8)

    fig.update_layout(
        mapbox_style="carto-darkmatter",
        title=f'Fire Outbreaks in Brazil ({year}, {month_to_english(month)})',
        height=800,
        width=1200,
    )

    fig.update_coloraxes(colorbar_title="Fire Count")

    fig.update_traces(
        hovertemplate="<b>%{hovertext}</b><br><br>" +
                      "Fire Outbreaks: %{marker.color}<br>" +
                      "Carbon Emission: %{customdata[1]} ton<br>" +
                      "<extra></extra>"
    )

    return fig


def get_available_years_and_months(data):
    df = pd.DataFrame(data)
    years = sorted(df['year_month'].str.split('-').str[0].unique())
    months = sorted(df['year_month'].str.split('-').str[1].unique())
    return years, months


def month_to_english(month):
    months = {
        'Janeiro': 'January', 'Fevereiro': 'February', 'Março': 'March',
        'Abril': 'April', 'Maio': 'May', 'Junho': 'June',
        'Julho': 'July', 'Agosto': 'August', 'Setembro': 'September',
        'Outubro': 'October', 'Novembro': 'November', 'Dezembro': 'December',
        'Todos': 'All'
    }
    return months.get(month, month)


def month_to_portuguese(month):
    months = {
        'January': 'Janeiro', 'February': 'Fevereiro', 'March': 'Março',
        'April': 'Abril', 'May': 'Maio', 'June': 'Junho',
        'July': 'Julho', 'August': 'Agosto', 'September': 'Setembro',
        'October': 'Outubro', 'November': 'Novembro', 'December': 'Dezembro',
        'All': 'Todos'
    }
    return months.get(month, month)