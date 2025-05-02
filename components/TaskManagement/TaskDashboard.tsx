'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, Typography, Paper, Button, TextField, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageUpload from '../common/ImageUpload';
import TaskList from './TaskList';
import TaskComments from './TaskComments';
import { useAuth } from '@/hooks/use-auth';

const DashboardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  minHeight: '80vh',
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
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

export const TaskDashboard = () => {
  const params = useParams();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params && params.projectId) {
      fetchTasks();
    }
  }, [params?.projectId]);

  const fetchTasks = async () => {
    if (!params || !params.projectId) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${params.projectId}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) return;
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
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
        const formData = new FormData();
        formData.append('file', commentImage);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
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

      await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });
      
      setNewComment('');
      setCommentImage(null);
      fetchTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom className="text-white">
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
              <Typography variant="h6" gutterBottom className="text-white">
                Task Details
              </Typography>
              <Typography variant="body1" className="text-zinc-300">
                {selectedTask.description}
              </Typography>
              
              <Box mt={3}>
                <Typography variant="h6" gutterBottom className="text-white">
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      },
                    }}
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