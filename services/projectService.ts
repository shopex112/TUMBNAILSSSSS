
import { supabase } from './supabaseClient';
import { Project } from '../types';

class ProjectService {
  async getProjectsForUser(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error.message);
      throw new Error(error.message || 'Failed to fetch projects.');
    }
    return data || [];
  }

  async saveProject(userId: string, name: string, layoutData: any): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ user_id: userId, name, layout_data: layoutData }])
      .select()
      .single();

    if (error) {
      console.error('Error saving project:', error.message);
      throw new Error(error.message || 'Failed to save project.');
    }
    return data;
  }

  async updateProject(projectId: number, name: string, layoutData: any): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ name, layout_data: layoutData, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error.message);
      throw new Error(error.message || 'Failed to update project.');
    }
    return data;
  }

  async deleteProject(projectId: number): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error.message);
      throw new Error(error.message || 'Failed to delete project.');
    }
  }
}

export const projectService = new ProjectService();