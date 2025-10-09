// Sidebar menu type for navigation
export interface SidebarMenu {
	label: string;
	link: string;
	icon?: React.ReactNode;
}

// Job entity
export interface Job {
	id: number;
	title: string;
	company: string;
	location: string;
	type: string;
	status: string;
	description: string;
}

// Candidate entity
export interface Candidate {
	id: number;
	name: string;
	email: string;
	status: string;
	role: string;
	bio: string;
}

// Company entity
export interface Company {
	id: number;
	name: string;
	location: string;
	industry: string;
	status: string;
	description: string;
}

// Application entity
export interface Application {
	id: number;
	jobId: number;
	candidateId: number;
	status: string;
	date: string;
}

// User entity
export interface User {
	id: number;
	name: string;
	email: string;
	role: 'Admin' | 'HR' | 'Candidate' | 'Client';
}

// DashboardCard type
export interface DashboardCard {
	title: string;
	value: number | string;
	icon?: React.ReactNode;
	color?: string;
}
