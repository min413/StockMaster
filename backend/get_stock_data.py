# get_stock_data.py

from flask import Flask, request, jsonify
import yfinance as yf
import requests
from bs4 import BeautifulSoup
import numpy as np
import pandas as pd
import json
import os
import warnings
from dotenv import load_dotenv

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn.cluster._kmeans")
warnings.filterwarnings("ignore", category=FutureWarning, module="sklearn.cluster._kmeans")

from sklearn.linear_model import Ridge
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN
from sklearn.cluster import KMeans

from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.cluster import SpectralClustering
from flask_cors import CORS

os.environ["OMP_NUM_THREADS"] = "1"

app = Flask(__name__)


CORS(app)

@app.route('/get-stock-news', methods=['POST'])
def get_stock_news():
    data = request.get_json()
    stock_name = data.get('stockName', '')

    url = "https://openapi.naver.com/v1/search/news.json"
    headers = {
        'X-Naver-Client-Id': os.environ.get('NAVER_CLIENT_ID'),
        'X-Naver-Client-Secret': os.environ.get('NAVER_CLIENT_SECRET')
    }
    params = {
        'query': stock_name,  
        'display': 30,  
        'start': 1,
        'sort': 'date'  
    }

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        news_data = response.json().get('items', [])
        filtered_news = [
            news for news in news_data
            if 'news.naver.com' in news.get('link', '') and stock_name in news.get('title', '')
        ][:3]

        for news in filtered_news:
            news_link = news.get('link')
            news_content = get_news_content(news_link)
            news['content'] = news_content

        return jsonify({'items': filtered_news})
    else:
        return jsonify({"error": "Failed to fetch news from Naver"}), response.status_code



def get_news_content(link):
    try:
        response = requests.get(link)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            article_tag = soup.find(id='newsct_article')
            if article_tag:
                article_content = article_tag.get_text(separator='\n', strip=True)
                return article_content
        return "본문을 가져오는 중 문제가 발생했습니다."
    except Exception as e:
        return f"본문을 가져오는 중 오류 발생: {e}"


@app.route('/get-stock-data', methods=['POST'])
def get_stock_data():
    data = request.get_json()
    stock_symbol = data['stockName']

    stock = yf.Ticker(stock_symbol)
    
    hist = stock.history(interval='1d', period='1mo', auto_adjust=False)
    last_close = hist['Close'].iloc[-2]
    latest_close = hist['Close'].iloc[-1]

    return jsonify(
        last_close=last_close.item(), 
        latest_close=latest_close.item()
    )

@app.route('/get-news-titles', methods=['GET'])
def get_news_titles():
    url = 'https://m.stock.naver.com/investment/news/mainnews'
    response = requests.get(url, verify=False) # 
    web_content = response.text

    soup = BeautifulSoup(web_content, 'html.parser')
    news_list = soup.find_all('li', class_='NewsList_item__WVsZO')
    

    news_data = []
    for news in news_list:
        title_tag = news.find('strong', class_='NewsList_title__spqZb')
        content_tag = news.find('p', class_='NewsList_text__2_Zog')
        link_tag = news.find('a', class_='NewsList_link__WhFg2')

        if title_tag and content_tag and link_tag:
            title = title_tag.get_text()
            content = content_tag.get_text()
            link = link_tag['href']
            news_data.append({
                'title': title,
                'content': content,
                'link': link
            })
            

    return jsonify(news_data)


@app.route('/get-historical-data/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    stock = yf.Ticker(symbol)
    
    hist = stock.history(period='3y')
    
    date_range = pd.date_range(start=hist.index.min(), end=hist.index.max(), freq='B')  
    # 'B'는 평일만 포함한다

    hist = hist.reindex(date_range, method='ffill')
    # 휴장일에 대해 이전 데이터를 채우기 위해 reindex와 ffill을 사용

    data = []
    for date, row in hist.iterrows():
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'open': row['Open'],
            'high': row['High'],
            'low': row['Low'],
            'close': row['Close']
        })

    return jsonify(data)

@app.route('/get-stock-risk', methods=['POST'])
def get_stock_risk():
    try:
        data = request.get_json()
        stock_symbols = data.get('stockSymbols', [])
        benchmark_symbol = data.get('benchmark', '^GSPC')  

        stock_data = {}
        for symbol in stock_symbols:
            stock = yf.Ticker(symbol)
            stock_history = stock.history(period="3y")['Close']
            returns = stock_history.pct_change().dropna()  
            # 종목 수익률을 계산

            volatility = returns.std()

            benchmark = yf.Ticker(benchmark_symbol)
            benchmark_history = benchmark.history(period="3y")['Close']
            benchmark_returns = benchmark_history.pct_change().dropna()

            market_volatility = benchmark_returns.std()

            # 모든 날짜 범위에 대해 종목과 벤치마크 수익률을 맞추는 과정
            all_dates = returns.index.union(benchmark_returns.index)
            returns = returns.reindex(all_dates).fillna(method='ffill')
            benchmark_returns = benchmark_returns.reindex(all_dates).fillna(method='ffill')

            # 공통 개장일만 남기고 NaN은 제거
            aligned_data = pd.DataFrame({'stock': returns, 'benchmark': benchmark_returns}).dropna()

            if not aligned_data.empty:
                covariance = aligned_data.cov().iloc[0, 1]
                benchmark_variance = aligned_data['benchmark'].var()
                beta = covariance / benchmark_variance if benchmark_variance != 0 else 0
            else:
                beta = float('nan')

            idiosyncratic_risk = 0
            if beta is not None and market_volatility is not None:
                idiosyncratic_risk = (volatility**2 - (beta * market_volatility)**2)**0.5 if volatility**2 > (beta * market_volatility)**2 else volatility
            else:
                idiosyncratic_risk = volatility

            stock_data[symbol] = {
                'volatility': volatility,
                'beta': beta,
                'idiosyncratic_risk': idiosyncratic_risk
            }

        return jsonify(stock_data)
    except Exception as e:
        print("Error in /get-stock-risk:", str(e))
        return jsonify({"error": "Error processing stock risk"}), 500


@app.route('/predict-risk', methods=['POST'])
def predict_risk():
    try:
        data = request.get_json()
        stock_features = pd.DataFrame(data['features'])  
        # 종목별 변동성과 베타 값을 전달
        print("Received features for prediction:", stock_features)

        X = stock_features[['volatility', 'beta']]
        y = stock_features['idiosyncratic_risk']  
        ridge = Ridge(alpha=1.72, max_iter=5000, tol=0.001)
        
        ridge.fit(X, y)

        risk_predictions = ridge.predict(X)
        print("Predicted Risk Values:", risk_predictions)

        return jsonify({'predicted_risk': risk_predictions.tolist()})
    except Exception as e:
        print("Error in /predict-risk:", str(e))
        return jsonify({"error": "Error processing risk prediction"}), 500

        

@app.route('/visualize-risk', methods=['POST'])
def visualize_risk():
    data = request.get_json()
    stock_features = pd.DataFrame(data['features'])

    pca = PCA(n_components=2)
    reduced_data = pca.fit_transform(stock_features[['volatility', 'beta']])
    

    visualization_data = [{'x': float(pt[0]), 'y': float(pt[1])} for pt in reduced_data]
    return jsonify(visualization_data)



# k-means 클러스터링
@app.route('/cluster-risk', methods=['POST'])
def cluster_risk():
    try:
        data = request.get_json()
        stock_features = pd.DataFrame(data['features'])

        # 필요한 열이 존재하는지 확인
        if not all(col in stock_features.columns for col in ['volatility', 'beta']):
            raise ValueError("Expected columns 'volatility' and 'beta' not found in input data")

        # 데이터 정규화
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(stock_features[['volatility', 'beta']])

        # PCA 적용하여 2차원으로 축소
        pca = PCA(n_components=2)
        reduced_data = pca.fit_transform(scaled_features)

        # KMeans 클러스터링 적용
        num_clusters = 3  # 원하는 클러스터 개수 설정
        kmeans = KMeans(n_clusters=num_clusters, random_state=0)
        clusters = kmeans.fit_predict(reduced_data)

        # 클러스터 결과와 PCA 변환 결과를 함께 반환
        cluster_data = [
            {
                'x': float(pt[0]),
                'y': float(pt[1]),
                'cluster': int(clusters[idx]),
                'ticker': stock_features.index[idx]
            } for idx, pt in enumerate(reduced_data)
        ]
        return jsonify(cluster_data)
    except Exception as e:
        print(f"Error in /cluster-risk: {str(e)}")
        return jsonify({"error": "Clustering failed"}), 500





'''
# dbscan 알고리즘 사용
@app.route('/cluster-risk', methods=['POST'])
def cluster_risk():
    try:
        data = request.get_json()
        stock_features = pd.DataFrame(data['features'])

        # 필요한 열이 존재하는지 확인
        if not all(col in stock_features.columns for col in ['volatility', 'beta']):
            raise ValueError("Expected columns 'volatility' and 'beta' not found in input data")

        # 데이터 정규화
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(stock_features[['volatility', 'beta']])

        # PCA 적용하여 2차원으로 축소
        pca = PCA(n_components=2)
        reduced_data = pca.fit_transform(scaled_features)

        # DBSCAN 클러스터링 적용
        dbscan = DBSCAN(eps=0.6, min_samples=2)  # eps와 min_samples는 데이터에 맞게 조정 가능
        clusters = dbscan.fit_predict(reduced_data)

        # 클러스터 결과와 PCA 변환 결과를 함께 반환
        cluster_data = [
            {
                'x': float(pt[0]),
                'y': float(pt[1]),
                'cluster': int(clusters[idx]),
                'ticker': stock_features.index[idx]
            } for idx, pt in enumerate(reduced_data)
        ]
        return jsonify(cluster_data)

    except Exception as e:
        print(f"Error in /cluster-risk-dbscan: {str(e)}")
        return jsonify({"error": "Clustering with DBSCAN failed"}), 500
'''


'''
# Spectral 클러스터링 사용
@app.route('/cluster-risk', methods=['POST'])
def cluster_risk():
    try:
        data = request.get_json()
        stock_features = pd.DataFrame(data['features'])

        # 필요한 열이 존재하는지 확인
        if not all(col in stock_features.columns for col in ['volatility', 'beta']):
            raise ValueError("Expected columns 'volatility' and 'beta' not found in input data")

        # 데이터 정규화
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(stock_features[['volatility', 'beta']])

        # PCA 적용하여 2차원으로 축소
        pca = PCA(n_components=2)
        reduced_data = pca.fit_transform(scaled_features)

        # Spectral Clustering 적용
        num_clusters = 3  # 클러스터 개수 설정
        spectral = SpectralClustering(n_clusters=num_clusters, affinity='nearest_neighbors', random_state=0)
        clusters = spectral.fit_predict(reduced_data)

        # 클러스터 결과와 PCA 변환 결과를 함께 반환
        cluster_data = [
            {
                'x': float(pt[0]),
                'y': float(pt[1]),
                'cluster': int(clusters[idx]),
                'ticker': stock_features.index[idx]
            } for idx, pt in enumerate(reduced_data)
        ]
        return jsonify(cluster_data)
    except Exception as e:
        print(f"Error in /cluster-risk: {str(e)}")
        return jsonify({"error": "Clustering with Spectral Clustering failed"}), 500
'''

if __name__ == '__main__':
    app.run(port=5600)
