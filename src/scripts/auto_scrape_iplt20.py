import sys
import os
import json
import difflib

# Add root folder to sys path so we can import update_points and cricbuzz_scraper
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
import update_points
from cricbuzz_scraper import clean_name, parse_dismissal_for_fielding

def load_db():
    with open('data/players.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_processed_matches():
    if not os.path.exists('data/processed_matches.json'):
        return []
    with open('data/processed_matches.json', 'r') as f:
        return json.load(f)

def fetch_playwright_match(match_id):
    """
    Production-Ready Playwright DOM Extraction Logic
    """
    print(f"🕵️  [Playwright] Bypassing CSR & Extracting Match {match_id} natively...")
    try:
        from playwright.sync_api import sync_playwright
        from playwright_stealth import stealth_sync
        import pandas as pd
        import time
        
        url = f"https://www.iplt20.com/match/2026/{match_id}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
            page = browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
            stealth_sync(page)
            
            response = page.goto(url, wait_until='networkidle', timeout=30000)
            if response.status == 404 or "Access Denied" in page.content():
                return None
                
            try:
                # Attempt to organically click the generic Scorecard tab loaded by React
                page.click("text='Scorecard'", timeout=5000)
                time.sleep(2)
            except:
                pass
                
            html = page.content()
            dfs = pd.read_html(html)
            
            batting_dfs = [df for df in dfs if any('batter' in str(c).lower() or 'batsman' in str(c).lower() for c in df.columns)]
            bowling_dfs = [df for df in dfs if any('bowler' in str(c).lower() for c in df.columns)]
            
            if len(batting_dfs) < 2 or len(bowling_dfs) < 2:
                print("Pandas failed to detect 2 full innings tables. IPLT20.com DOM might be utilizing non-standard flexbox grids.")
                return None
                
            match_data = {"innings1": {"batting": [], "bowling": []}, "innings2": {"batting": [], "bowling": []}}
            
            # Map Innings 1
            for index, row in batting_dfs[0].iterrows():
                try: 
                    name = str(row.iloc[0]).split('c ')[0].split('b ')[0].split('(')[0].strip()
                    if 'total' in name.lower() or 'extras' in name.lower() or name == 'nan': continue
                    match_data["innings1"]["batting"].append({
                        "name": name, "runs": int(row.iloc[1]), "balls": int(row.iloc[2]), 
                        "4s": int(row.iloc[3]), "6s": int(row.iloc[4]), "sr": float(row.iloc[5]), "dismissal": str(row.iloc[6] if len(row.columns) > 6 else 'not out')
                    })
                except: pass
                
            for index, row in bowling_dfs[0].iterrows():
                try:
                    name = str(row.iloc[0]).strip()
                    if 'total' in name.lower() or name == 'nan': continue
                    match_data["innings1"]["bowling"].append({
                        "name": name, "overs": float(row.iloc[1]), "maidens": int(row.iloc[2]), 
                        "runs": int(row.iloc[3]), "wickets": int(row.iloc[4]), "dots": int(row.iloc[5] if len(row.columns) > 6 else 0)
                    })
                except: pass
                
            # Map Innings 2
            for index, row in batting_dfs[1].iterrows():
                try: 
                    name = str(row.iloc[0]).split('c ')[0].split('b ')[0].split('(')[0].strip()
                    if 'total' in name.lower() or 'extras' in name.lower() or name == 'nan': continue
                    match_data["innings2"]["batting"].append({
                        "name": name, "runs": int(row.iloc[1]), "balls": int(row.iloc[2]), 
                        "4s": int(row.iloc[3]), "6s": int(row.iloc[4]), "sr": float(row.iloc[5]), "dismissal": str(row.iloc[6] if len(row.columns) > 6 else 'not out')
                    })
                except: pass
                
            for index, row in bowling_dfs[1].iterrows():
                try:
                    name = str(row.iloc[0]).strip()
                    if 'total' in name.lower() or name == 'nan': continue
                    match_data["innings2"]["bowling"].append({
                        "name": name, "overs": float(row.iloc[1]), "maidens": int(row.iloc[2]), 
                        "runs": int(row.iloc[3]), "wickets": int(row.iloc[4]), "dots": int(row.iloc[5] if len(row.columns) > 6 else 0)
                    })
                except: pass

            return match_data
            
    except Exception as e:
        print(f"Playwright encountered fatal DOM exception: {e}")
        return None

def sync_new_matches():
    players_db = load_db()
    valid_names = [p['name'] for p in players_db]
    role_map = {p['name']: p['role'] for p in players_db}
    
    def find_best_match(raw_name):
        for name in valid_names:
            if raw_name.lower() == name.lower(): return name
        for name in valid_names:
            if len(raw_name) > 3 and raw_name.lower() in name.lower().split(): return name
        matches = difflib.get_close_matches(raw_name, valid_names, n=1, cutoff=0.6)
        if matches: return matches[0]
        return raw_name
        
    processed = get_processed_matches()
    # Begin tracing the incremental IDs. We stop when the 404 block breaks the while-loop.
    current_target = processed[-1] + 1 if processed else 2417
    
    print(f"🚀 IPL 2026 Automated Daily GitHub Action Sync Initated.")
    print(f"📊 Tracking Database currently reports {len(processed)} matches successfully resolved.")
    
    updates_made = False
    
    while True:
        data = fetch_playwright_match(current_target)
        if not data:
            print(f"🛑 Match {current_target} is unavailable or not yet played. Halting dynamic daily extraction bounds.")
            break
            
        print(f"✅ Match {current_target} data structured perfectly. Piping safely into the Custom Matrix Formula...")
        
        match_stats = {}
        for innings_key in ["innings1", "innings2"]:
            innings_data = data[innings_key]
            for row in innings_data["batting"]:
                raw_cname = clean_name(row["name"])
                name = find_best_match(raw_cname)
                
                if name not in match_stats: match_stats[name] = {}
                match_stats[name]['runs_scored'] = row['runs']
                match_stats[name]['balls_faced'] = row['balls']
                match_stats[name]['fours'] = row['4s']
                match_stats[name]['sixes'] = row['6s']
                match_stats[name]['is_dismissed'] = (row['dismissal'] != 'not out')
                match_stats[name]['is_in_playing_xi'] = True
                match_stats[name]['role'] = role_map.get(name, 'Batsman')
                
                if row['dismissal'] != 'not out':
                    parse_dismissal_for_fielding(row['dismissal'], match_stats)
                    
            for row in innings_data["bowling"]:
                raw_cname = clean_name(row["name"])
                name = find_best_match(raw_cname)
                
                if name not in match_stats: match_stats[name] = {}
                match_stats[name]['overs_bowled'] = row['overs']
                match_stats[name]['maidens'] = row.get('maidens', 0)
                match_stats[name]['runs_conceded'] = row['runs']
                match_stats[name]['wickets'] = row['wickets']
                match_stats[name]['dot_balls'] = row.get('dots', 0)
                match_stats[name]['is_in_playing_xi'] = True
                match_stats[name]['lbw_bowled_count'] = 0
                match_stats[name]['role'] = role_map.get(name, 'Batsman')

        final_dict = {}
        for player_name, p_stats in match_stats.items():
            if 'role' not in p_stats:
                p_stats['role'] = role_map.get(find_best_match(player_name), 'Batsman')
                
            points = update_points.calculate_total_dream11_points(p_stats)
            master_name = find_best_match(player_name)
            final_dict[master_name] = final_dict.get(master_name, 0) + points
        
        for p in players_db:
            if p['name'] in final_dict:
                p['latest_points'] = final_dict[p['name']]
                # Strip old structures and use user requested mapping
                p.pop('points2025', None) 
                p['total_points_2026'] = p.get('total_points_2026', 0) + final_dict[p['name']]
                
        processed.append(current_target)
        current_target += 1
        updates_made = True
        print(f"🔄 Accumulated stats synced to live frontend db variable mapping.")
        
    if updates_made:
        with open('data/players.json', 'w', encoding='utf-8') as f:
            json.dump(players_db, f, indent=4)
        with open('data/processed_matches.json', 'w', encoding='utf-8') as f:
            json.dump(processed, f, indent=2)
        print("💾 Automatically injected Math Engine outputs directly into strictly formatted generic players.json")
    else:
        print("⏸ Nothing new to update at this scheduled hour.")

if __name__ == "__main__":
    sync_new_matches()
