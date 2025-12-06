import requests
from datetime import datetime, timedelta

def fetch_binance_pair(symbol1, symbol2, days=30):
    """
    Récupère 2 paires et les sauvegarde
    Exemple: fetch_binance_pair('ETH', 'SOL', 30)
    """
    
    def get_prices(coin):
        symbol = f"{coin}USDT"
        url = "https://api.binance.com/api/v3/klines"
        
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=days)).timestamp() * 1000)
        
        params = {
            'symbol': symbol,
            'interval': '1d',
            'startTime': start_time,
            'endTime': end_time,
            'limit': 1000
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if isinstance(data, dict) and 'msg' in data:
                print(f"✗ Erreur {symbol}: {data['msg']}")
                return None
                
            prices = [float(candle[4]) for candle in data]
            
            # Sauvegarder
            filename = f'{coin}_prices.txt'
            with open(filename, 'w') as f:
                for price in prices:
                    f.write(f"{price}\n")
            
            print(f"✓ {symbol}: {len(prices)} prix → {filename}")
            print(f"  Range: ${min(prices):.2f} - ${max(prices):.2f}")
            
            return prices
            
        except Exception as e:
            print(f"✗ Erreur pour {symbol}: {e}")
            return None
    
    print(f"\n=== Récupération {symbol1}/{symbol2} sur {days} jours ===\n")
    
    prices1 = get_prices(symbol1)
    prices2 = get_prices(symbol2)
    
    if prices1 and prices2:
        print(f"\n✅ Succès ! Copie maintenant:")
        print(f"   1. Le contenu de {symbol1}_prices.txt dans Asset 1")
        print(f"   2. Le contenu de {symbol2}_prices.txt dans Asset 2")
        
        return prices1, prices2
    else:
        print("\n✗ Échec de récupération")
        return None, None

# UTILISATION FACILE
# Change juste les symboles ici 👇

fetch_binance_pair('ETH', 'SOL', days=30)
# fetch_binance_pair('BTC', 'ETH', days=60)
# fetch_binance_pair('ARB', 'OP', days=30)
# fetch_binance_pair('AVAX', 'MATIC', days=45)
