/**
 * Mock Data Generator for Match Details
 * 
 * Since our database schema for match events/lineups is not yet fully populated,
 * we generate realistic data for demonstration purposes.
 */

const NAMES = [
    'Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie',
    'Fortin', 'Gagné', 'Ouellet', 'Pelletier', 'Bélanger', 'Lévesque', 'Bergeron',
    'Leblanc', 'Paquette', 'Girard', 'Simard', 'Boucher'
];

const FIRST_NAMES = [
    'Jean', 'Michel', 'Pierre', 'Luc', 'Marc', 'Philippe', 'Nicolas', 'Sébastien',
    'Alexandre', 'David', 'Mathieu', 'Guillaume', 'François', 'Simon', 'Thomas',
    'Maxime', 'Julien', 'Benoît', 'Antoine', 'Kevin'
];

const POSITIONS = ['G', 'D', 'D', 'AG', 'C', 'AD'];

export interface Player {
    id: string;
    name: string;
    number: number;
    position: string;
    isCaptain?: boolean;
    isAssistant?: boolean;
}

export interface MatchEvent {
    id: string;
    type: 'goal' | 'penalty' | 'period_start' | 'period_end';
    period: number;
    time: string; // MM:SS
    teamId?: string; // home or away
    playerId?: string;
    playerName?: string;
    assist1Name?: string;
    assist2Name?: string;
    detail?: string; // "Cinglage" or "2 min"
    score?: { home: number, away: number };
}

export interface MatchStats {
    home: { shots: number, saves: number, faceoffs: number, powerplay: string, penalties: number };
    away: { shots: number, saves: number, faceoffs: number, powerplay: string, penalties: number };
}

function getRandomName() {
    return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${NAMES[Math.floor(Math.random() * NAMES.length)]}`;
}

export function generateLineups(teamId: string): Player[] {
    const players: Player[] = [];

    // Goalies
    players.push({ id: `g1-${teamId}`, name: getRandomName(), number: 31, position: 'G' });
    players.push({ id: `g2-${teamId}`, name: getRandomName(), number: 35, position: 'G' });

    // Skaters (4 lines)
    for (let i = 0; i < 20; i++) {
        players.push({
            id: `p${i}-${teamId}`,
            name: getRandomName(),
            number: Math.floor(Math.random() * 98) + 1,
            position: POSITIONS[i % 5 + 1], // Skip G
            isCaptain: i === 5,
            isAssistant: i === 2 || i === 12
        });
    }

    return players;
}

export function generateEvents(matchId: string, homeTeamId: string, awayTeamId: string): MatchEvent[] {
    const events: MatchEvent[] = [];
    let homeScore = 0;
    let awayScore = 0;

    const PENALTY_TYPES = ['Cinglage', 'Trébucher', 'Accrocher', 'Retenir', 'Interférence', 'Dureté'];

    for (let p = 1; p <= 3; p++) {
        events.push({ id: `p${p}-start`, type: 'period_start', period: p, time: '20:00', detail: `Début de la ${p}${p === 1 ? 'ère' : 'ème'} période` });

        // Generate events
        const numEvents = Math.floor(Math.random() * 4) + 3;
        for (let i = 0; i < numEvents; i++) {
            const isGoal = Math.random() > 0.6;
            const isHome = Math.random() > 0.5;
            const teamId = isHome ? homeTeamId : awayTeamId;
            const time = `${Math.floor(Math.random() * 20).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

            if (isGoal) {
                if (isHome) homeScore++; else awayScore++;
                events.push({
                    id: `e-${p}-${i}-goal`,
                    type: 'goal',
                    period: p,
                    time,
                    teamId,
                    playerName: getRandomName(),
                    assist1Name: Math.random() > 0.4 ? getRandomName() : undefined,
                    assist2Name: Math.random() > 0.6 ? getRandomName() : undefined,
                    score: { home: homeScore, away: awayScore },
                    detail: Math.random() > 0.7 ? 'SN' : 'EQ'
                });
            } else {
                events.push({
                    id: `e-${p}-${i}-pen`,
                    type: 'penalty',
                    period: p,
                    time,
                    teamId,
                    playerName: getRandomName(),
                    detail: `2 min - ${PENALTY_TYPES[Math.floor(Math.random() * PENALTY_TYPES.length)]}`
                });
            }
        }
        events.push({ id: `p${p}-end`, type: 'period_end', period: p, time: '00:00', detail: `Fin de la ${p}${p === 1 ? 'ère' : 'ème'} période` });
    }

    return events.sort((a, b) => {
        if (a.period !== b.period) return b.period - a.period;
        return b.time.localeCompare(a.time);
    });
}

export function generateStats(matchId: string): MatchStats {
    const homeShots = Math.floor(Math.random() * 20) + 20;
    const awayShots = Math.floor(Math.random() * 20) + 20;

    return {
        home: {
            shots: homeShots,
            saves: awayShots - Math.floor(Math.random() * 5),
            faceoffs: Math.floor(Math.random() * 20) + 20,
            powerplay: '1/3',
            penalties: Math.floor(Math.random() * 10)
        },
        away: {
            shots: awayShots,
            saves: homeShots - Math.floor(Math.random() * 5),
            faceoffs: Math.floor(Math.random() * 20) + 20,
            powerplay: '0/2',
            penalties: Math.floor(Math.random() * 10)
        }
    };
}
