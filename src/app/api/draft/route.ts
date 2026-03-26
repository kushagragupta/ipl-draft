import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const playersFile = path.join(dataDir, 'players.json');
const stateFile = path.join(dataDir, 'draft-state.json');

function getPlayers() {
  const data = fs.readFileSync(playersFile, 'utf8');
  return JSON.parse(data);
}

function getState() {
  const data = fs.readFileSync(stateFile, 'utf8');
  return JSON.parse(data);
}

function saveState(state: any) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

export async function GET() {
  try {
    const players = getPlayers();
    const state = getState();
    return NextResponse.json({ players, state });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    const state = getState();
    const players = getPlayers();

    if (action === 'PICK_PLAYER') {
      const { playerId, userId } = payload;
      
      if (state.drafted[playerId]) {
        return NextResponse.json({ error: 'Player already drafted' }, { status: 400 });
      }

      const currentUser = state.users[state.currentTurnIndex];
      // Note: A real app would verify the active user here (auth)
      // but for friends local session we just trust the turn.

      state.drafted[playerId] = currentUser.id;
      state.pickHistory.unshift({
        playerId,
        userId: currentUser.id,
        round: state.round,
        pickNumber: state.pickHistory.length + 1
      });

      // Move turn using Snake Draft logic
      const totalPicks = state.pickHistory.length;
      const N = state.users.length;
      
      if (totalPicks >= N * 11) {
        state.status = 'COMPLETED';
      } else {
        const nextRound = Math.floor(totalPicks / N) + 1;
        const pos = totalPicks % N;
        state.currentTurnIndex = (nextRound % 2 !== 0) ? pos : (N - 1) - pos;
        state.round = nextRound;
      }

      saveState(state);
      return NextResponse.json({ state });
    }

    if (action === 'RESET') {
      state.drafted = {};
      state.pickHistory = [];
      state.currentTurnIndex = 0;
      state.round = 1;
      state.status = 'IN_PROGRESS';
      saveState(state);
      return NextResponse.json({ state });
    }

    if (action === 'HARD_RESET') {
      state.users = [];
      state.drafted = {};
      state.pickHistory = [];
      state.currentTurnIndex = 0;
      state.round = 1;
      state.status = 'NOT_STARTED';
      saveState(state);
      return NextResponse.json({ state });
    }

    if (action === 'ADD_USER') {
      const newId = 'u' + (state.users.length + 1);
      state.users.push({ id: newId, name: payload.name });
      saveState(state);
      return NextResponse.json({ state });
    }

    if (action === 'START_DRAFT') {
      // Randomize array
      const shuffled = [...state.users].sort(() => 0.5 - Math.random());
      state.users = shuffled;
      state.status = 'IN_PROGRESS';
      state.currentTurnIndex = 0;
      state.round = 1;
      saveState(state);
      return NextResponse.json({ state });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
