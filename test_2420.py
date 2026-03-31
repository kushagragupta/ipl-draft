from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
import pandas as pd
import time

def extract_2420():
    print("Initiating local Chromium instance...")
    match_id = 2420
    url = f"https://www.iplt20.com/match/2026/{match_id}"
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
            page = browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
            
            # Apply stealth
            Stealth().use_sync(page)
            
            print(f"Navigating to {url}...")
            res = page.goto(url, wait_until='networkidle', timeout=30000)
            print(f"Response: {res.status}")
            
            if "Access Denied" in page.content():
                print("BLOCK: WAF intercepted access.")
                return
                
            try:
                print("Waiting for Scorecard tab...")
                page.wait_for_selector("text='Scorecard'", timeout=10000)
                page.click("text='Scorecard'")
                print("Clicked Scorecard. Waiting for tables...")
                time.sleep(5)
            except Exception as e:
                print(f"Error clicking scorecard: {e}")
                
            html = page.content()
            
            # Pandas Extraction Check
            dfs = pd.read_html(html)
            print(f"Pandas identified {len(dfs)} raw tables.")
            
            batting_dfs = [df for df in dfs if any('batter' in str(c).lower() or 'batsman' in str(c).lower() for c in df.columns)]
            bowling_dfs = [df for df in dfs if any('bowler' in str(c).lower() for c in df.columns)]
            
            print(f"Mapped {len(batting_dfs)} Batting Tables and {len(bowling_dfs)} Bowling Tables.")
            
            if batting_dfs:
                print("\n--- SAMPLE BATTING TABLE ---")
                print(batting_dfs[0].head(2))
            if bowling_dfs:
                print("\n--- SAMPLE BOWLING TABLE ---")
                print(bowling_dfs[0].head(2))
                
            browser.close()
            
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    extract_2420()
