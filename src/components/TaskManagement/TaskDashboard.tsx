import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, Paper, Button, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageUpload from '../common/ImageUpload';
import TaskList from './TaskList';
import TaskComments from './TaskComments';

const DashboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  minHeight: '80vh',
}));

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  comments: TaskComment[];
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isCompleted: boolean;
}

const TaskDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);

  useEffect(() => {
    // Fetch tasks for the current project
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Implement API call to fetch tasks
      // const response = await api.getTasks(projectId);
      // setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) return;
    
    try {
      // Implement API call to update task
      // await api.updateTask(taskId, updates);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;

    try {
      let imageUrl = '';
      if (commentImage) {
        // Implement image upload logic
        // imageUrl = await uploadImage(commentImage);
      }

      const comment: TaskComment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        content: newComment,
        imageUrl,
        timestamp: new Date(),
        isCompleted: false,
      };

      // Implement API call to add comment
      // await api.addTaskComment(selectedTask.id, comment);
      
      setNewComment('');
      setCommentImage(null);
      fetchTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Task Management Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TaskList 
            tasks={tasks}
            onTaskSelect={setSelectedTask}
            onTaskUpdate={handleTaskUpdate}
            isAdmin={isAdmin}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          {selectedTask && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Task Details
              </Typography>
              <Typography variant="body1">
                {selectedTask.description}
              </Typography>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Comments
                </Typography>
                <TaskComments 
                  comments={selectedTask.comments}
                  isAdmin={isAdmin}
                />
                
                <Box mt={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    disabled={!user}
                  />
                  
                  <ImageUpload
                    onImageSelect={setCommentImage}
                    disabled={!user}
                  />
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!user || !newComment.trim()}
                    sx={{ mt: 2 }}
                  >
                    Add Comment
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default TaskDashboard; 