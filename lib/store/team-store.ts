import { create } from 'zustand';

export interface Team {
    id: number;
    name: string;
    description: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;
    user_role: 'admin' | 'member';
    creator_name: string;
    member_count: number;
}

export interface TeamMember {
    id: number;
    team_id: number;
    user_id: number;
    role: 'admin' | 'member';
    joined_at: string;
    name: string;
    email: string;
    email_verified: boolean;
}

interface TeamStore {
    teams: Team[];
    currentTeam: Team | null;
    currentTeamMembers: TeamMember[];
    setTeams: (teams: Team[]) => void;
    addTeam: (team: Team) => void;
    updateTeam: (teamId: number, data: Partial<Team>) => void;
    removeTeam: (teamId: number) => void;
    setCurrentTeam: (team: Team | null) => void;
    setCurrentTeamMembers: (members: TeamMember[]) => void;
    addMember: (member: TeamMember) => void;
    updateMember: (memberId: number, data: Partial<TeamMember>) => void;
    removeMember: (memberId: number) => void;
    reset: () => void;
}

const initialState = {
    teams: [],
    currentTeam: null,
    currentTeamMembers: [],
};

export const useTeamStore = create<TeamStore>((set) => ({
    ...initialState,

    setTeams: (teams) => set({ teams }),

    addTeam: (team) => set((state) => ({
        teams: [team, ...state.teams]
    })),

    updateTeam: (teamId, data) => set((state) => ({
        teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, ...data } : team
        ),
        currentTeam: state.currentTeam?.id === teamId
            ? { ...state.currentTeam, ...data }
            : state.currentTeam,
    })),

    removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
        currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam,
    })),

    setCurrentTeam: (team) => set({ currentTeam: team }),

    setCurrentTeamMembers: (members) => set({ currentTeamMembers: members }),

    addMember: (member) => set((state) => ({
        currentTeamMembers: [...state.currentTeamMembers, member],
    })),

    updateMember: (memberId, data) => set((state) => ({
        currentTeamMembers: state.currentTeamMembers.map((member) =>
            member.id === memberId ? { ...member, ...data } : member
        ),
    })),

    removeMember: (memberId) => set((state) => ({
        currentTeamMembers: state.currentTeamMembers.filter(
            (member) => member.id !== memberId
        ),
    })),

    reset: () => set(initialState),
}));

