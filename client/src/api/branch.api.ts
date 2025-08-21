import type { Branch } from '../types/branch.types';
import api from './api';

export async function fetchBranches(): Promise<Branch[]> {
    const res = await api.get<Branch[]>('/branches');
    return res.data;
}

export async function createBranch(
    branch: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Branch> {
    const res = await api.post<Branch>('/branches', branch);
    return res.data;
}

export async function updateBranch(
    id: string,
    branch: Partial<Branch>,
): Promise<Branch> {
    const res = await api.put<Branch>(`/branches/${id}`, branch);
    return res.data;
}

export async function deleteBranch(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
}
