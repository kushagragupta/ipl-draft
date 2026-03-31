import sys
import json
import re
import requests
from bs4 import BeautifulSoup

# Import our Dream11 engine
from update_points import calculate_total_dream11_points

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

def clean_name(name):
    """Deepest clean of Cricbuzz names strictly to standardized Player DB formats"""
    # Remove any captian (c) or wicketkeeper (wk) tags
    n = re.sub(r'\(c\)', '', name, flags=re.IGNORECASE)
    n = re.sub(r'\(wk\)', '', n, flags=re.IGNORECASE)
    n = re.sub(r'\(sub\)', '', n, flags=re.IGNORECASE)
    # Remove any trailing spaces or non-breaking spaces
    n = n.replace('\xa0', ' ').strip()
    return n

def parse_dismissal_for_fielding(dismissal_text, match_stats):
    """
    Regex parsing to extract catches, stumpings, and run outs from the 'Dismissal' text column
    Example text: 'c Gaikwad b Jadeja', 'st Dhoni b Chahal', 'run out (Kohli)'
    """
    text = dismissal_text.lower().strip()
    
    # Check for catches: 'c FielderName b BowlerName' or 'c & b Bowler'
    catch_match = re.match(r'^c\s+([a-zA-Z\s\.\-]+)\s+b\s+', text)
    if catch_match:
        catcher = catch_match.group(1).strip()
        if catcher:
            match_stats.setdefault(catcher, {}).setdefault('catches', 0)
            match_stats[catcher]['catches'] += 1
            
    # Caught and bowled
    elif 'c & b' in text or 'c and b' in text:
        # The bowler caught it. E.g 'c & b Jadeja'
        cb_match = re.search(r'b\s+([a-zA-Z\s\.\-]+)$', text)
        if cb_match:
            bowler = cb_match.group(1).strip()
            if bowler:
                match_stats.setdefault(bowler, {}).setdefault('catches', 0)
                match_stats[bowler]['catches'] += 1

    # Check for stumping: 'st WicketKeeper b Bowler'
    st_match = re.match(r'^st\s+([a-zA-Z\s\.\-]+)\s+b\s+', text)
    if st_match:
        keeper = st_match.group(1).strip()
        if keeper:
            match_stats.setdefault(keeper, {}).setdefault('stumping', 0)
            match_stats[keeper]['stumping'] += 1

    # Check for run out: 'run out (Fielder1/Fielder2)'
    ro_match = re.match(r'^run out\s*\((.*?)\)', text)
    if ro_match:
        fielders_str = ro_match.group(1).strip()
        # Sometimes it's a single direct hit, sometimes it involves two fielders
        fielders = [f.strip() for f in fielders_str.split('/')]
        # Dream11 rules: Direct hit = 12pts, Indirect = 6pts per fielder (up to 2 fielders)
        if len(fielders) == 1 and fielders[0]:
            match_stats.setdefault(fielders[0], {}).setdefault('direct_hit', 0)
            match_stats[fielders[0]]['direct_hit'] += 1
        else:
            for f in fielders:
                if f:
                    match_stats.setdefault(f, {}).setdefault('indirect_hit', 0)
                    match_stats[f]['indirect_hit'] += 1

def scrape_match(url):
    print(f"📡 Fetching Scorecard: {url}")
    res = requests.get(url, headers=HEADERS)
    if res.status_code != 200:
        print(f"Failed to fetch {url}. Status: {res.status_code}")
        return None
        
    soup = BeautifulSoup(res.text, 'html.parser')
    
    # We will aggregate raw stats per player name
    match_stats = {}
    
    # All players listed in the Match Info as "Playing" or "Impact Sub" receive +4 Appearance Points
    # Cricbuzz puts squads in .cb-minfo-tm-nm and following divs
    # Alternatively, just give +4 to anyone who batted, bowled, or fielded (this is a safe fallback)
    
    # Fetch Batting Tables
    batting_rows = soup.find_all('div', class_=re.compile(r'scorecard-bat-grid'))
    print(f"🏏 Found {len(batting_rows)} Total Batting Rows")

    for row in batting_rows:
        # Check if it's a header row
        if 'Batter' in row.text:
            continue
            
        # The structure is: 
        # Div 0: wrapper for Name + Dismissal
        # Div 1: Runs, Div 2: Balls, Div 3: 4s, Div 4: 6s, Div 5: SR
        cols = row.find_all('div', recursive=False)
        if len(cols) >= 6:
            name_a = cols[0].find('a')
            if not name_a:
                continue
                
            name = clean_name(name_a.text)
            
            # The dismissal text is inside the first col but after the anchor, or inside a nested div
            dismissal_div = cols[0].find('div', class_=re.compile(r'text-cbTxtSec'))
            dismissal_text = dismissal_div.text.strip() if dismissal_div else 'not out'
            
            # Some columns might have internal flex justification divs, extracting raw text
            try:
                runs = int(cols[1].text.strip())
                balls = int(cols[2].text.strip())
                fours = int(cols[3].text.strip())
                sixes = int(cols[4].text.strip())
            except ValueError:
                continue
                
            is_dismissed = dismissal_text.lower() not in ['not out', 'retired hurt', 'playing', 'retire hurt']
            
            if name not in match_stats:
                match_stats[name] = {}
                
            match_stats[name]['runs_scored'] = runs
            match_stats[name]['balls_faced'] = balls
            match_stats[name]['fours'] = fours
            match_stats[name]['sixes'] = sixes
            match_stats[name]['is_dismissed'] = is_dismissed
            match_stats[name]['is_in_playing_xi'] = True
            
            if is_dismissed:
                parse_dismissal_for_fielding(dismissal_text, match_stats)

    # Fetch Bowling Tables
    bowling_rows = soup.find_all('div', class_=re.compile(r'scorecard-bowl-grid'))
    print(f"🎯 Found {len(bowling_rows)} Total Bowling Rows")

    for row in bowling_rows:
        if 'Bowler' in row.text:
            continue
            
        cols = row.find_all('div', recursive=False)
        # Structure: Anchor Node directly as child maybe?
        name_a = row.find('a')
        if not name_a:
            continue
            
        name = clean_name(name_a.text)
        
        # Cols array might be shifted if anchor is a direct child alongside divs
        # Let's just collect all divs that have text
        divs = [d.text.strip() for d in cols if d.text.strip()]
        
        # Depending on if NB/WD are hidden, typical visible divs:
        # [Overs, Maidens, Runs, Wickets, ECO]
        if len(divs) >= 4:
            try:
                overs_str = divs[0]
                maidens = int(divs[1])
                runs = int(divs[2])
                wickets = int(divs[3])
                
                overs_float = float(overs_str)
                o_split = str(overs_float).split('.')
                full_overs = int(o_split[0])
                balls = int(o_split[1]) if len(o_split)>1 else 0
                actual_overs_math = full_overs + (balls / 6.0)
                
                if name not in match_stats:
                    match_stats[name] = {}
                    
                match_stats[name]['overs_bowled'] = actual_overs_math
                match_stats[name]['maidens'] = maidens
                match_stats[name]['runs_conceded'] = runs
                match_stats[name]['wickets'] = wickets
                match_stats[name]['is_in_playing_xi'] = True
                match_stats[name]['lbw_bowled_count'] = 0
            except ValueError:
                continue
                        
    return match_stats

def run_test_calculation(url):
    print("="*60)
    print("🏏 CRICBUZZ -> DREAM11 AUTOMATION PIPELINE RUNNER")
    print("="*60 + "\n")
    
    raw_stats = scrape_match(url)
    if not raw_stats:
        print("❌ Web Scraper Failed to yield DOM results.")
        return
        
    print(f"\n✅ Scraped raw metrics for {len(raw_stats)} players.")
    
    # Run through the Dream11 Math Engine
    print("\n⚙️  Processing Dream11 Points Matrix...")
    results = []
    
    for player, stats in raw_stats.items():
        # Ensure appearance points are given to anyone who fielded (if they weren't caught in batting/bowling)
        if 'is_in_playing_xi' not in stats:
            stats['is_in_playing_xi'] = True
            
        pts = calculate_total_dream11_points(stats)
        results.append({
            "player": player,
            "raw_stats": stats,
            "fantasy_points": pts
        })
        
    # Sort by highest points
    results.sort(key=lambda x: x['fantasy_points'], reverse=True)
    
    output_path = "data/rcb_srh_test_points.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)
        
    print(f"\n💾 Saved compiled Points Output to {output_path}")
    print("\n🏆 TOP 5 PERFORMERS IN MATCH:")
    for r in results[:5]:
        print(f"🌟 {r['player'].ljust(20)} | Points: {r['fantasy_points']} | Core Stats: {r['raw_stats']}")
        
if __name__ == "__main__":
    MATCH_URL = "https://www.cricbuzz.com/live-cricket-scorecard/89759/rcb-vs-srh-30th-match-indian-premier-league-2024"
    run_test_calculation(MATCH_URL)
