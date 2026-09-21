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

export interface TaskProject {
    id: number;
    team_id: number;
    name: string;
    description: string | null;
    color: string;
}

export interface TaskLabel {
    id: number;
    team_id: number;
    name: string;
    color: string;
}

export interface TaskTemplate {
    id: number;
    team_id: number;
    project_id: number | null;
    project_name: string | null;
    name: string;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
}

export interface Task {
    id: number;
    team_id: number;
    project_id: number | null;
    project_name: string | null;
    project_color: string | null;
    assigned_to: number;
    assigned_by: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    start_date: string | null;
    end_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    assigned_to_name: string;
    assigned_to_email: string;
    assigned_by_name: string;
    assigned_by_email: string;
    labels: TaskLabel[];
}

interface TeamStore {
    teams: Team[];
    currentTeam: Team | null;
    currentTeamMembers: TeamMember[];
    currentTeamTasks: Task[];
    setTeams: (teams: Team[]) => void;
    addTeam: (team: Team) => void;
    updateTeam: (teamId: number, data: Partial<Team>) => void;
    removeTeam: (teamId: number) => void;
    setCurrentTeam: (team: Team | null) => void;
    setCurrentTeamMembers: (members: TeamMember[]) => void;
    addMember: (member: TeamMember) => void;
    updateMember: (memberId: number, data: Partial<TeamMember>) => void;
    removeMember: (memberId: number) => void;
    setCurrentTeamTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (taskId: number, data: Partial<Task>) => void;
    removeTask: (taskId: number) => void;
    reset: () => void;
}

const initialState = {
    teams: [],
    currentTeam: null,
    currentTeamMembers: [],
    currentTeamTasks: [],
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

    setCurrentTeamTasks: (tasks) => set({ currentTeamTasks: tasks }),

    addTask: (task) => set((state) => ({
        currentTeamTasks: [task, ...state.currentTeamTasks],
    })),

    updateTask: (taskId, data) => set((state) => ({
        currentTeamTasks: state.currentTeamTasks.map((task) =>
            task.id === taskId ? { ...task, ...data } : task
        ),
    })),

    removeTask: (taskId) => set((state) => ({
        currentTeamTasks: state.currentTeamTasks.filter(
            (task) => task.id !== taskId
        ),
    })),

    reset: () => set(initialState),
}));

