from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import date
from dateutil.relativedelta import relativedelta
import yfinance as yf
import numpy as np
import google.generativeai as genai
import requests
import json
import xml.etree.ElementTree as ET
import re
import ast

with open('/Users/anon/Documents/school/Code/frontendv2/src/credentials.txt') as f:
    credentials = ast.literal_eval(f.read())

def strip_html_tags(text):
    if not text:
        return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

today = date.today()
dt = today.strftime('%Y-%m-%d')
eighteen_months_ago = today - relativedelta(months=18)

genai.configure(api_key=credentials['gemini_api_key'])
gemini = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/data', methods=['GET'])
def get_data():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'status': 'error', 'message': 'No query provided'}), 400

    tickers = [i.strip() for i in query.split(',') if i.strip()]
    if not tickers:
        return jsonify({'status': 'error', 'message': 'No tickers provided'}), 400

    all_ports = []
    try:
        for ticker in tickers:
            data = yf.download(ticker, start=eighteen_months_ago, end=today)
            if data.empty:
                continue
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = [i[0] for i in data.columns]
            data['short'] = data['Close'].rolling(25).mean()
            data['long'] = data['Close'].rolling(50).mean()
            data = data.dropna(subset=['Close'])
            data['signal'] = 0
            data.loc[data.index[25:], 'signal'] = np.where(data['short'][25:] > data['long'][25:], 1.0, 0.0)
            data['positions'] = data['signal'].diff().fillna(0)
            positions = 1000 * data['signal']
            holdings = positions * data['Close']
            cash = 10000 - (positions.diff().fillna(0) * data['Close']).cumsum()
            total = cash + holdings
            returns = total.pct_change().fillna(0)
            port = pd.DataFrame({
                'Date': data.index,
                'ticker': ticker,
                'holdings': holdings,
                'cash': cash,
                'total': total,
                'returns': returns
            })
            all_ports.append(port.reset_index(drop=True))
        if not all_ports:
            return jsonify({'status': 'success', 'data': []})
        out = pd.concat(all_ports, ignore_index=True)
        out = out.replace([np.inf, -np.inf], np.nan)
        out = out.where(pd.notnull(out), None)
        performance = out.groupby(out.Date).agg({'holdings': 'sum', 'cash': 'sum', 'total': 'sum'}).reset_index()
        performance.Date = performance['Date'].apply(lambda x: x.strftime("%Y-%m-%d"))
        performance = performance.to_dict(orient='records')
        return jsonify({'status': 'success', 'out': performance})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def fetch_news_for_tickers(tickers):
    all_articles = []
    for ticker in tickers:
        url = f"https://news.google.com/rss/search?q={ticker}+stock"
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            root = ET.fromstring(response.content)
            items = root.findall('.//item')
            for item in items[:5]:
                description_raw = item.find('description').text if item.find('description') is not None else ""
                description_clean = strip_html_tags(description_raw)
                all_articles.append({
                    'title': item.find('title').text if item.find('title') is not None else "",
                    'text': description_clean,
                    'publishedDate': item.find('pubDate').text if item.find('pubDate') is not None else "",
                    'symbol': ticker
                })
        except Exception as e:
            print(f"Error fetching news for {ticker}: {e}")
    return all_articles

@app.route('/news', methods=['GET'])
def get_news():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'status': 'error', 'message': 'No ticker(s) provided'}), 400
    tickers = [i.strip() for i in query.split(',') if i.strip()]
    articles = fetch_news_for_tickers(tickers)
    return jsonify({'status': 'success', 'articles': articles})

@app.route('/ask', methods=['POST'])
def ask_model():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '') if data else ''
        if not prompt:
            return jsonify({'status': 'error', 'message': 'No prompt provided'}), 400
        response = gemini.generate_content(prompt)
        return jsonify({'status': 'success', 'response': response.text, 'formattedPrompt': prompt})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/quote', methods=['GET'])
def get_quote():
    tickers_param = request.args.get('tickers')
    if not tickers_param:
        return jsonify({'status': 'error', 'message': 'No tickers provided'}), 400
    tickers = [t.strip().upper() for t in tickers_param.split(',') if t.strip()]
    results = []
    for ticker in tickers:
        try:
            t = yf.Ticker(ticker)
            data = t.history(period="2d")
            if data.empty or 'Close' not in data or data['Close'].isnull().all():
                results.append({'ticker': ticker, 'error': 'No data found'})
                continue
            closes = data['Close'].dropna()
            last = closes.iloc[-1]
            prev = closes.iloc[-2] if len(closes) > 1 else last
            change = last - prev
            percent = (change / prev) * 100 if prev else 0
            results.append({
                'ticker': ticker,
                'price': float(last),
                'change': float(change),
                'percent': float(percent)
            })
        except Exception as e:
            results.append({'ticker': ticker, 'error': str(e)})
    return jsonify({'status': 'success', 'results': results})

@app.route('/charts', methods=['GET'])
def get_chart_data():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'status': 'error', 'message': 'No query provided'}), 400

    tickers = [i.strip() for i in query.split(',') if i.strip()]
    if not tickers:
        return jsonify({'status': 'error', 'message': 'No tickers provided'}), 400

    all_prices = []
    try:
        for ticker in tickers:
            data = yf.download(ticker, start=eighteen_months_ago, end=today)
            if data.empty:
                continue
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = [i[0] for i in data.columns]
            data = data.reset_index()
            data = data[['Date', 'Close']]  # Only get Date and Close columns
            data['ticker'] = ticker
            data['Date'] = data['Date'].apply(lambda x: x.strftime("%Y-%m-%d") if hasattr(x, "strftime") else str(x))
            all_prices.append(data)
        if not all_prices:
            return jsonify({'status': 'success', 'prices': []}), 200

        out = pd.concat(all_prices, ignore_index=True)
        out = out.replace([np.inf, -np.inf], np.nan)
        out = out.where(pd.notnull(out), None)
        return jsonify({'status': 'success', 'prices': out.to_dict(orient='records')}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'success', 'message': 'Flask server is running!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)