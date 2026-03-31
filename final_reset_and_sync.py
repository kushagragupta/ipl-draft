import json
import os
import sys
import difflib

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import update_points
from cricbuzz_scraper import clean_name, parse_dismissal_for_fielding

def load_db():
    with open('/Users/ogkush/ipl-draft/data/players.json', 'r', encoding='utf-8') as f:
        return json.load(f)

# Load Match 1 Payload securely stored from earlier session
with open('/Users/ogkush/ipl-draft/run_mock_points.py', 'r') as f:
    text = f.read()
    # Fast parsing of the dict by just importing run_mock_points technically
    
import run_mock_points
match_1_data = run_mock_points.run_simulation.__code__.co_consts[1]
if not isinstance(match_1_data, dict):
    # Fallback if bytecode extract fails
    match_1_data = {
        "innings1": {"team": "SRH", "score": "201/9", "batting": [{"name": "Travis Head", "runs": 11, "balls": 9, "4s": 2, "6s": 0, "sr": 122.22, "dismissal": "c Phil Salt b Jacob Duffy"}, {"name": "Abhishek Sharma", "runs": 7, "balls": 8, "4s": 0, "6s": 1, "sr": 87.50, "dismissal": "c Jitesh Sharma b Jacob Duffy"}, {"name": "Ishan Kishan", "runs": 80, "balls": 38, "4s": 8, "6s": 5, "sr": 210.52, "dismissal": "c Phil Salt b Abhinandan Singh"}, {"name": "Nitish Kumar Reddy", "runs": 1, "balls": 6, "4s": 0, "6s": 0, "sr": 16.66, "dismissal": "c Abhinandan Singh b Jacob Duffy"}, {"name": "Heinrich Klaasen", "runs": 31, "balls": 22, "4s": 2, "6s": 1, "sr": 140.90, "dismissal": "c Phil Salt b Romario Shepherd"}, {"name": "Salil Arora", "runs": 9, "balls": 6, "4s": 0, "6s": 1, "sr": 150.00, "dismissal": "c Devdutt Padikkal b Suyash Sharma"}, {"name": "Aniket Verma", "runs": 43, "balls": 18, "4s": 3, "6s": 4, "sr": 238.88, "dismissal": "c Virat Kohli b Romario Shepherd"}, {"name": "Harsh Dubey", "runs": 3, "balls": 3, "4s": 0, "6s": 0, "sr": 100.00, "dismissal": "c Devdutt Padikkal b Romario Shepherd"}, {"name": "Harshal Patel", "runs": 0, "balls": 2, "4s": 0, "6s": 0, "sr": 0.00, "dismissal": "c Devdutt Padikkal b Bhuvneshwar Kumar"}, {"name": "David Payne", "runs": 10, "balls": 6, "4s": 0, "6s": 1, "sr": 166.66, "dismissal": "not out"}, {"name": "Jaydev Unadkat", "runs": 1, "balls": 2, "4s": 0, "6s": 0, "sr": 50.00, "dismissal": "not out"}], "bowling": [{"name": "Jacob Duffy", "overs": 4.0, "maidens": 0, "runs": 22, "wickets": 3, "dots": 13, "econ": 5.50}, {"name": "Bhuvneshwar Kumar", "overs": 4.0, "maidens": 0, "runs": 31, "wickets": 1, "dots": 9, "econ": 7.75}, {"name": "Abhinandan Singh", "overs": 3.0, "maidens": 0, "runs": 38, "wickets": 1, "dots": 7, "econ": 12.67}, {"name": "Romario Shepherd", "overs": 4.0, "maidens": 0, "runs": 54, "wickets": 3, "dots": 5, "econ": 13.50}, {"name": "Suyash Sharma", "overs": 3.0, "maidens": 0, "runs": 28, "wickets": 1, "dots": 6, "econ": 9.33}, {"name": "Krunal Pandya", "overs": 2.0, "maidens": 0, "runs": 26, "wickets": 0, "dots": 1, "econ": 13.00}]}, "innings2": {"team": "RCB", "score": "203/4", "batting": [{"name": "Phil Salt", "runs": 8, "balls": 7, "4s": 2, "6s": 0, "sr": 114.28, "dismissal": "c Heinrich Klaasen b Jaydev Unadkat"}, {"name": "Virat Kohli", "runs": 69, "balls": 38, "4s": 5, "6s": 5, "sr": 181.57, "dismissal": "not out"}, {"name": "Devdutt Padikkal", "runs": 61, "balls": 26, "4s": 7, "6s": 4, "sr": 234.61, "dismissal": "c Heinrich Klaasen b Harsh Dubey"}, {"name": "Rajat Patidar", "runs": 31, "balls": 12, "4s": 2, "6s": 3, "sr": 258.33, "dismissal": "c Harsh Dubey b David Payne"}, {"name": "Jitesh Sharma", "runs": 0, "balls": 1, "4s": 0, "6s": 0, "sr": 0.00, "dismissal": "c Jaydev Unadkat b David Payne"}, {"name": "Tim David", "runs": 16, "balls": 10, "4s": 1, "6s": 1, "sr": 160.00, "dismissal": "not out"}], "bowling": [{"name": "Nitish Kumar Reddy", "overs": 2.0, "maidens": 0, "runs": 19, "wickets": 0, "dots": 5, "econ": 9.50}, {"name": "Jaydev Unadkat", "overs": 3.0, "maidens": 0, "runs": 29, "wickets": 1, "dots": 6, "econ": 9.67}, {"name": "David Payne", "overs": 3.0, "maidens": 0, "runs": 35, "wickets": 2, "dots": 5, "econ": 11.67}, {"name": "Harsh Dubey", "overs": 3.0, "maidens": 0, "runs": 35, "wickets": 1, "dots": 4, "econ": 11.67}, {"name": "Eshan Malinga", "overs": 2.0, "maidens": 0, "runs": 35, "wickets": 0, "dots": 3, "econ": 17.50}, {"name": "Harshal Patel", "overs": 2.4, "maidens": 0, "runs": 39, "wickets": 0, "dots": 3, "econ": 14.63}]}
    } # Fallback Match 1

# Load Match 2 & 3 dynamically from the JSON strings in the scratchpad
def extract_json_block(scratchpad_path, match_number):
    import re
    with open(scratchpad_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Locate Match X JSON Data blocks explicitly
    marker = f"## Match {match_number} JSON Data:"
    if marker in content:
        block = content.split(marker)[1].split("```json")[1].split("```")[0]
        return json.loads(block)
    return None

def process():
    players_db = load_db()
    valid_names = [p['name'] for p in players_db]
    role_map = {p['name']: p['role'] for p in players_db}
    
    # Reset schema! Wipe points2025, latest_points
    for p in players_db:
        p.pop('points2025', None)
        p.pop('latest_points', None)
        p['total_points_2026'] = 0

    def find_best_match(raw_name):
        for name in valid_names:
            if raw_name.lower() == name.lower(): return name
        for name in valid_names:
            if len(raw_name) > 3 and raw_name.lower() in name.lower().split(): return name
        matches = difflib.get_close_matches(raw_name, valid_names, n=1, cutoff=0.55)
        if matches: return matches[0]
        return raw_name
        
    scratchpad = '/Users/ogkush/.gemini/antigravity/brain/e0893db9-c662-464b-a309-4e498778025b/browser/scratchpad_7dzb0ni1.md'
    match_2_data = extract_json_block(scratchpad, 2)
    match_3_data = extract_json_block(scratchpad, 3)

    all_matches = [match_1_data, match_2_data, match_3_data]
    
    global_points = {}
    
    for i, match_data in enumerate(all_matches):
        if not match_data: continue
        print(f"Calculating Matrix for Math {i+1}...")
        match_stats = {}
        for innings_key in ["innings1", "innings2"]:
            innings_data = match_data[innings_key]
            
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
            
        for player, pts in final_dict.items():
            global_points[player] = global_points.get(player, 0) + pts
            
    # Inject safely back to standard JSON dictionary
    updated = 0
    for p in players_db:
        if p['name'] in global_points:
            p['total_points_2026'] = global_points[p['name']]
            if p['total_points_2026'] > 0:
                print(f"Assigning {p['total_points_2026']} pts to | {p['name']}")
                updated += 1
          
    with open('/Users/ogkush/ipl-draft/data/players.json', 'w', encoding='utf-8') as f:
        json.dump(players_db, f, indent=4)
        
    print(f"✅ Reset database and injected total_points_2026 safely to {updated} active players!")

if __name__ == "__main__":
    process()
