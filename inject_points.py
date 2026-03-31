import json
import os

def inject_points():
    db_path = '/Users/ogkush/ipl-draft/data/players.json'
    merged_path = '/Users/ogkush/ipl-draft/data/merged_points.json'
    
    with open(merged_path, 'r', encoding='utf-8') as f:
        merged_points = json.load(f)
        
    with open(db_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    updated = 0
    for p in players:
        if p['name'] in merged_points:
            # Add the 2026 match points as a new property or update existing points
            # Assuming you want to replace points2025 or track it as live points
            p['latest_points'] = merged_points[p['name']] 
            # Alternatively, if points2025 holds historical data, latest_points will hold current tournament logic.
            # We'll also just add to points2025 if that's what the UI reads
            p['points2025'] = p.get('points2025', 0) + merged_points[p['name']]
            updated += 1
            
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=4)
        
    print(f"✅ Injected current match points for {updated} players directly into players.json")

if __name__ == "__main__":
    inject_points()
