import pandas as pd
import requests
from bs4 import BeautifulSoup
import json
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36'
}

def get_wiki_players():
    # Wikipedia often has a specific page for squads
    # e.g., "List of 2026 Indian Premier League personnel changes" or just the main page
    urls = [
        "https://en.wikipedia.org/wiki/2026_Indian_Premier_League",
        "https://en.wikipedia.org/wiki/List_of_2026_Indian_Premier_League_personnel_changes"
    ]
    
    for url in urls:
        print(f"Trying {url}")
        try:
            r = requests.get(url, headers=HEADERS)
            soup = BeautifulSoup(r.text, 'html.parser')
            tables = pd.read_html(str(soup))
            print(f"Found {len(tables)} tables")
            
            for i, df in enumerate(tables):
                # Flatten MultiIndex columns if present
                if isinstance(df.columns, pd.MultiIndex):
                    df.columns = ['_'.join(map(str, col)).strip() for col in df.columns.values]
                
                cols = [str(c).lower() for c in df.columns]
                if any('player' in c for c in cols):
                    print(f"--> Table {i} looks like it has players: {list(df.columns)}")
                    print(df.head(3).to_string())
                    print("-" * 40)
        except Exception as e:
            print(f"Error fetching {url}: {e}")

if __name__ == "__main__":
    get_wiki_players()
