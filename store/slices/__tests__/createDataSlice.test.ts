import { createStore } from 'zustand/vanilla';
import { createDataSlice } from '../createDataSlice';
import { supabase } from '../../../lib/supabase';
import { StoreState } from '../../types';

// Mock du backend Supabase pour isoler la logique métier du store
jest.mock('../../../lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
        auth: {
            getSession: jest.fn(),
        }
    }
}));

describe('createDataSlice - Zustand Store Logic', () => {
    let mockStore: any;

    beforeEach(() => {
        // Init a fresh store for each test
        mockStore = createStore<StoreState>((set, get, api) => ({
            ...createDataSlice(set as any, get as any, api),
            // Mock other slices if needed (or just initial states)
            matches: [],
            teams: [],
            players: [],
            gameEvents: [],
            isLoading: false
        } as StoreState))();

        jest.clearAllMocks();
    });

    test('fetchMatches calls Supabase and updates state', async () => {
        const mockMatches = [{ id: '1', status: 'scheduled' }];

        // Setup chained mock for supabase.from('matches').select(...).order(...)
        const tempQuery = {
            order: jest.fn().mockResolvedValue({ data: mockMatches })
        };
        const selectMock = jest.fn().mockReturnValue(tempQuery);
        (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

        // Execute
        await mockStore.fetchMatches();

        // Assert
        expect(supabase.from).toHaveBeenCalledWith('matches');
        expect(selectMock).toHaveBeenCalled();
        expect(mockStore.matches).toEqual(mockMatches);
        expect(mockStore.isLoading).toBe(false);
    });

    test('fetchTeams calls Supabase and updates teams state', async () => {
        const mockTeams = [{ id: 't1', name: 'Brûleurs de Loups' }];
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: mockTeams })
        });

        await mockStore.fetchTeams();

        expect(supabase.from).toHaveBeenCalledWith('teams');
        expect(mockStore.teams).toEqual(mockTeams);
    });

    test('fetchGameEvents successfully retrieves and sorts events', async () => {
        const matchId = 123;
        const mockEvents = [{ id: 'e1', match_api_id: matchId }];
        
        const tempQuery = {
            order: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockEvents, error: null })
            })
        };
        const eqMock = jest.fn().mockReturnValue(tempQuery);
        const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
        (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

        await mockStore.fetchGameEvents(matchId);

        expect(supabase.from).toHaveBeenCalledWith('game_events');
        expect(mockStore.gameEvents).toEqual(mockEvents);
    });

    test('fetchGameEvents handles database failure safely without crashing', async () => {
        const tempQuery = {
            order: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: null, error: new Error("DB Failed") })
            })
        };
        const eqMock = jest.fn().mockReturnValue(tempQuery);
        const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
        (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Store previously had data
        mockStore.gameEvents = [{ id: 'old' }];
        
        await mockStore.fetchGameEvents(999);

        // On error, it should catch, console.error and reset to empty array
        expect(consoleSpy).toHaveBeenCalled();
        expect(mockStore.gameEvents).toEqual([]);

        consoleSpy.mockRestore();
    });
});
