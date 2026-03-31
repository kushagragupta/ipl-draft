import json
import os
import argparse

def calculate_batting_points(runs, balls, fours, sixes, role, is_dismissed):
    """Calculates batting points based on Dream11 T20 rules."""
    pts = 0
    if runs == 0 and balls == 0:
        return 0

    pts += runs               # +1 per run
    pts += (fours * 4)        # +4 boundary bonus
    pts += (sixes * 6)        # +6 six bonus
    
    # Custom Milestone Bonuses
    if runs >= 100:
        pts += 16
    elif runs >= 75:
        pts += 12
    elif runs >= 50:
        pts += 8
    elif runs >= 25:
        pts += 4
        
    # Duck penalty (except standard bowlers)
    if runs == 0 and is_dismissed and role in ['Batsman', 'Wicketkeeper', 'All-rounder']:
        pts -= 2

    # Strike rate (except standard bowlers, minimum 10 balls played)
    if balls >= 10 and role != 'Bowler':
        sr = (runs / balls) * 100 if balls > 0 else 0
        if sr > 170:
            pts += 6
        elif sr > 150:
            pts += 4
        elif sr >= 130:
            pts += 2
        elif 60 <= sr <= 70:
            pts -= 2
        elif 50 <= sr < 60:
            pts -= 4
        elif sr < 50:
            pts -= 6
            
    return pts

def calculate_bowling_points(wickets, maidens, runs_conceded, overs_bowled, lbw_bowled_count, dot_balls=0):
    """Calculates bowling points based on the custom user-provided T20 rules."""
    pts = 0
    if overs_bowled == 0:
        return 0

    pts += (wickets * 30)              # +30 per wicket (custom rule)
    pts += (lbw_bowled_count * 8)      # +8 lbw/bowled bonus
    pts += (dot_balls * 1)             # +1 per dot ball (custom rule)
    
    # Milestone bonuses (non-stacking logic for 3, 4, 5 wickets)
    if wickets >= 5:
        pts += 16
    elif wickets == 4:
        pts += 8
    elif wickets == 3:
        pts += 4
        
    pts += (maidens * 12)              # +12 per maiden over

    # Economy rate (minimum 2 overs bowled)
    if overs_bowled >= 2:
        rpo = runs_conceded / overs_bowled
        if rpo < 5:
            pts += 6
        elif rpo < 6:
            pts += 4
        elif rpo <= 7:
            pts += 2
        elif 10 <= rpo <= 11:
            pts -= 2
        elif 11 < rpo <= 12:
            pts -= 4
        elif rpo > 12:
            pts -= 6

    return pts

def calculate_fielding_points(catches, stumping, direct_hit, indirect_hit, is_in_playing_xi):
    """Calculates fielding and match appearance points based on Dream11 T20 rules."""
    pts = 0
    if is_in_playing_xi:
        pts += 4  # Included in playing XI / Impact sub

    pts += (catches * 8)
    if catches >= 3:
        pts += 4  # 3 catch bonus
        
    pts += (stumping * 12)
    pts += (direct_hit * 12)
    pts += (indirect_hit * 6)
    
    return pts

def calculate_total_dream11_points(player_stats):
    """Aggregates a player's raw metrics to yield the official Dream11 Fantasy score."""
    role = player_stats.get('role', 'Batsman')
    
    batting = calculate_batting_points(
        runs=player_stats.get('runs_scored', 0),
        balls=player_stats.get('balls_faced', 0),
        fours=player_stats.get('fours', 0),
        sixes=player_stats.get('sixes', 0),
        role=role,
        is_dismissed=player_stats.get('is_dismissed', False)
    )
    
    bowling = calculate_bowling_points(
        wickets=player_stats.get('wickets', 0),
        maidens=player_stats.get('maidens', 0),
        runs_conceded=player_stats.get('runs_conceded', 0),
        overs_bowled=player_stats.get('overs_bowled', 0),
        lbw_bowled_count=player_stats.get('lbw_bowled_count', 0),
        dot_balls=player_stats.get('dot_balls', 0)
    )
    
    fielding = calculate_fielding_points(
        catches=player_stats.get('catches', 0),
        stumping=player_stats.get('stumping', 0),
        direct_hit=player_stats.get('direct_hit', 0),
        indirect_hit=player_stats.get('indirect_hit', 0),
        is_in_playing_xi=player_stats.get('is_in_playing_xi', False)
    )
    
    return batting + bowling + fielding

def inject_points_to_database(player_scores_map, db_path='data/players.json'):
    """
    Takes a dictionary mapping `Player Name` -> `New Points Scored In Match`
    and injects it into the existing generic `players.json` database.
    """
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    with open(db_path, 'r', encoding='utf-8') as f:
        players = json.load(f)

    updated_count = 0
    for p in players:
        # Match primarily by exact name (Could be optimized with partial fuzzy matching if required)
        if p['name'] in player_scores_map:
            new_points = player_scores_map[p['name']]
            # Accumulate on top of their 2025 points, or you can track 2026 points as a new key
            p['points2025'] = p.get('points2025', 0) + new_points
            updated_count += 1

    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2)
        
    print(f"✅ Successfully updated fantasy points for {updated_count} players.")

if __name__ == "__main__":
    # Test script isolation execution
    print("Dream11 Points Calculation Engine Loaded.")
