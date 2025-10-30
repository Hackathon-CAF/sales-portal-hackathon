import os
import requests
import pandas as pd
import plotly.express as px
import streamlit as st
from dotenv import load_dotenv

# --- Carregar variáveis de ambiente ---
load_dotenv()

# --- Configuração da Página ---
st.set_page_config(
    page_title="Dashboard de Vendas",
    page_icon="📊",
    layout="wide"
)

# --- Função para Carregar Dados da API ---
@st.cache_data(ttl=60)
def carregar_dados_api():
    URL_API = "http://localhost:3000/api/transactions/dashboard"
    API_KEY = os.getenv("API_DASHBOARD_KEY")

    if not API_KEY:
        st.error("Chave de API não encontrada. Verifique o arquivo .env.")
        return pd.DataFrame()

    headers = {"x-api-key": API_KEY}

    try:
        response = requests.get(URL_API, headers=headers, timeout=5)
        response.raise_for_status()

        data_json = response.json()
        df_bruto = pd.DataFrame(data_json.get("data", []))

        if df_bruto.empty:
            st.error("API retornou dados vazios.")
            return pd.DataFrame()

        # --- Flatten dos dados aninhados ---
        if 'customer' in df_bruto.columns and 'product' in df_bruto.columns:
            df_bruto = pd.concat([
                df_bruto.drop(['customer', 'product'], axis=1),
                df_bruto['customer'].apply(pd.Series).add_prefix('customer_'),
                df_bruto['product'].apply(pd.Series).add_prefix('product_')
            ], axis=1)

        # --- Renomear colunas ---
        df_renomeado = df_bruto.rename(columns={
            'totalPrice': 'preco_total_item',
            'date': 'data_pedido',
            'status': 'status_pedido',
            'customer_name': 'nome_cliente',
            'customer_segment': 'segmento_cliente',
            'customer_city': 'cidade',
            'customer_state': 'estado',
            'product_name': 'nome_produto',
            'product_quantity': 'quantidade'
        })

        # --- Mapear regiões ---
        def map_region(estado):
            if not estado:
                return "Desconhecida"
            estado = estado.upper()
            if estado in ["AC", "AP", "AM", "PA", "RO", "RR", "TO"]:
                return "Norte"
            elif estado in ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"]:
                return "Nordeste"
            elif estado in ["DF", "GO", "MT", "MS"]:
                return "Centro-Oeste"
            elif estado in ["ES", "MG", "RJ", "SP"]:
                return "Sudeste"
            elif estado in ["PR", "RS", "SC"]:
                return "Sul"
            else:
                return "Desconhecida"

        df_renomeado['regiao'] = df_renomeado['estado'].apply(map_region)

        return df_renomeado

    except requests.exceptions.RequestException as e:
        st.error(f"Erro ao conectar na API: {e}")
        st.error(f"Tentando conectar em: {URL_API}")
        return pd.DataFrame()


# --- Carrega os dados ---
df = carregar_dados_api()

if df.empty:
    st.warning("Não foi possível carregar os dados da API.")
    st.stop()

df['data_pedido'] = pd.to_datetime(df['data_pedido'])
df['mes_ano'] = df['data_pedido'].dt.to_period('M').astype(str)

# --- Título ---
st.title("📊 Dashboard de Vendas (Dados da API)")

# --- KPIs ---
st.header("Visão Geral (Dados Totais)")
col1, col2, col3 = st.columns(3)

receita_total = df['preco_total_item'].sum()
col1.metric("Receita Total", f"R$ {receita_total:,.2f}")

pedidos_unicos = df['orderId'].nunique()
col2.metric("Total de Pedidos", f"{pedidos_unicos}")

ticket_medio = receita_total / pedidos_unicos if pedidos_unicos > 0 else 0
col3.metric("Ticket Médio", f"R$ {ticket_medio:,.2f}")

st.markdown("---")

# --- Gráficos de Análises ---
st.header("Análises de Pedidos")
col_status, col_tempo = st.columns(2)

with col_status:
    vendas_por_status = df.groupby('status_pedido')['preco_total_item'].sum().reset_index()
    fig_status = px.pie(
        vendas_por_status,
        names='status_pedido',
        values='preco_total_item',
        title="Receita por Status do Pedido",
        template="plotly_dark",
        hole=.4
    )
    fig_status.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_status, use_container_width=True, key="grafico_status")

with col_tempo:
    vendas_por_mes = df.groupby('mes_ano')['preco_total_item'].sum().reset_index()
    fig_tempo = px.line(
        vendas_por_mes,
        x='mes_ano',
        y='preco_total_item',
        title="Receita ao Longo do Tempo (por Mês)",
        labels={'preco_total_item': 'Receita', 'mes_ano': 'Mês/Ano'},
        template="plotly_dark",
        markers=True
    )
    fig_tempo.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_tempo, use_container_width=True, key="grafico_tempo")

st.markdown("---")

# --- Análises de Produtos e Clientes ---
st.header("Análise de Produtos e Clientes")
col_top_prod, col_top_cli = st.columns(2)

with col_top_prod:
    st.subheader("Top 10 Produtos (por Receita)")
    df_top_receita = df.groupby('nome_produto')['preco_total_item'].sum().nlargest(10).sort_values(ascending=True).reset_index()
    fig_top_receita = px.bar(
        df_top_receita,
        x='preco_total_item',
        y='nome_produto',
        orientation='h',
        template="plotly_dark",
        labels={'preco_total_item': 'Receita Total', 'nome_produto': 'Produto'}
    )
    fig_top_receita.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_top_receita, use_container_width=True, key="grafico_top_receita")

with col_top_cli:
    st.subheader("Top 10 Clientes (por Receita)")
    df_top_cliente = df.groupby('nome_cliente')['preco_total_item'].sum().nlargest(10).sort_values(ascending=True).reset_index()
    fig_top_cliente = px.bar(
        df_top_cliente,
        x='preco_total_item',
        y='nome_cliente',
        orientation='h',
        template="plotly_dark",
        labels={'preco_total_item': 'Receita Total', 'nome_cliente': 'Cliente'}
    )
    fig_top_cliente.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig_top_cliente, use_container_width=True, key="grafico_top_cliente")

st.markdown("---")

# --- Gráfico de Pizza por Região ---
st.header("Pedidos por Região")
pedidos_por_regiao = df.groupby('regiao')['orderId'].count().reset_index()
fig_regiao = px.pie(
    pedidos_por_regiao,
    names='regiao',
    values='orderId',
    title="Distribuição de Pedidos por Região",
    template="plotly_dark",
    hole=.3
)
fig_regiao.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
st.plotly_chart(fig_regiao, use_container_width=True, key="grafico_regiao")

# --- Gráfico de Produtos mais comprados por Clientes Gold ---
st.header("Produtos mais comprados por Clientes Gold")
df_gold = df[df['segmento_cliente'].str.lower() == "gold"]
produtos_gold = df_gold.groupby('nome_produto')['preco_total_item'].sum().nlargest(10).sort_values(ascending=True).reset_index()
fig_prod_gold = px.bar(
    produtos_gold,
    x='preco_total_item',
    y='nome_produto',
    orientation='h',
    title="Top 10 Produtos por Clientes Gold",
    template="plotly_dark",
    labels={'preco_total_item': 'Receita Total', 'nome_produto': 'Produto'}
)
fig_prod_gold.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
st.plotly_chart(fig_prod_gold, use_container_width=True, key="grafico_prod_gold")

st.markdown("---")

# --- Tabela Bruta ---
st.header("Dados Brutos da API")
st.dataframe(df)