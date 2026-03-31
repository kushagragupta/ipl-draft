import json
import difflib

def load_player_names_from_db(db_path):
    with open(db_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
    return [p['name'] for p in players]

def find_best_match(raw_name, valid_names):
    # 1. Exact case-insensitive match
    for name in valid_names:
        if raw_name.lower() == name.lower():
            return name
            
    # 2. Substring match (Crucial for fielding abbreviations like "topley" -> "Reece Topley")
    for name in valid_names:
        # Avoid short strings mismatching everything
        if len(raw_name) > 3 and raw_name.lower() in name.lower().split():
            return name
            
    # 3. Handle specific formatting cases (e.g. phil salt / Philip Salt)
    matches = difflib.get_close_matches(raw_name, valid_names, n=1, cutoff=0.6)
    if matches:
        return matches[0]
        
    return raw_name

def merge():
    db_path = '/Users/ogkush/ipl-draft/data/players.json'
    points_path = '/Users/ogkush/ipl-draft/data/rcb_srh_test_points.json'
    
    valid_names = load_player_names_from_db(db_path)
    
    with open(points_path, 'r', encoding='utf-8') as f:
        raw_points = json.load(f)
        
    merged_points = {}
    
    for raw_name, points in raw_points.items():
        master_name = find_best_match(raw_name, valid_names)
        
        # Accumulate points for the master name
        merged_points[master_name] = merged_points.get(master_name, 0) + points
        
    # Sort for readability
    sorted_merged = dict(sorted(merged_points.items(), key=lambda item: item[1], reverse=True))
    
    # Save back to a cleaned json
    output_path = '/Users/ogkush/ipl-draft/data/merged_points.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_merged, f, indent=4)
        
    print(f"✅ Merged {len(raw_points)} fragmented names down to {len(sorted_merged)} absolute Player entities.")
    for name, pts in sorted_merged.items():
        print(f" - {name}: {pts} pts")

if __name__ == "__main__":
    merge()
