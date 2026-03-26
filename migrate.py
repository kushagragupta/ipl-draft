import csv
import json
import random

players = []
with open('data/latest_squads.csv', 'r') as f:
    reader = csv.DictReader(f)
    for idx, row in enumerate(reader):
        role_map = {'AR': 'All-rounder', 'BAT': 'Batsman', 'BOWL': 'Bowler', 'WK': 'Wicketkeeper'}
        runs = int(row['runs']) if row['runs'] else 0
        wickets = int(row['wickets']) if row['wickets'] else 0
        points = 0
        players.append({
            'id': f'p{idx+1}',
            'name': row['player_name'],
            'team': row['team'],
            'role': role_map.get(row['role'], row['role']),
            'country': row['nationality'],
            'overseas': row['overseas'].upper() == 'TRUE',
            'points2025': points,
            'imageUrl': row['image_url']
        })

with open('data/players.json', 'w') as f:
    json.dump(players, f, indent=2)
print("Migrated successfully!")
