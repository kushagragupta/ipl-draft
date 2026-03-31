from playwright.sync_api import sync_playwright
from playwright_stealth import stealth
import time
from bs4 import BeautifulSoup

def test_stealth_scrape():
    url = "https://www.iplt20.com/match/2026/2418"
    with sync_playwright() as p:
        # standard args to avoid detection
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )
        stealth(page)
        
        try:
            response = page.goto(url, wait_until='networkidle', timeout=30000)
            print("Status Code:", response.status)
            time.sleep(3)
            html = page.content()
            
            if "Access Denied" in html:
                print("❌ Still blocked by Akamai.")
            else:
                print("✅ Successfully penetrated Akamai WAF!")
                print("Page Title:", page.title())
        except Exception as e:
            print("Failed to load page:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    test_stealth_scrape()
