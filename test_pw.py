from playwright.sync_api import sync_playwright
import time
import json
from bs4 import BeautifulSoup

def test_scrape():
    url = "https://www.iplt20.com/match/2026/2418"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until='networkidle')
        time.sleep(3) # allow Vue render
        
        try:
            # Look for scorecard tab
            scorecard_tab = page.locator("li[data-tab='scorecard']")
            if scorecard_tab.count() > 0:
                scorecard_tab.click()
                time.sleep(2)
        except Exception as e:
            print("Scorecard click failed", e)
            
        html = page.content()
        browser.close()
        
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text()
        
        print("Snippets from HTML:")
        if "Yashasvi Jaiswal" in text:
            print("FOUND YAHSASVI JAISWAL!")
        print(text[:1000])

if __name__ == "__main__":
    test_scrape()
