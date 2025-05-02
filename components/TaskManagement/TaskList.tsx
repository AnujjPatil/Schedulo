'use client';

import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';

const TaskItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  comments: any[];
}

interface TaskListProps {
  serverId: string;
  projectId: string;
}

const TaskList: React.FC<TaskListProps> = ({ serverId, projectId }) => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'PENDING',
  });

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tasks",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update task');

      await fetchTasks();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task",
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      await fetchTasks();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
      });
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create task');

      await fetchTasks();
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        status: 'PENDING',
      });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (authLoading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {isAdmin && (
        <Box mb={3} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Create Task
          </Button>
        </Box>
      )}

      <List>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            button
            onClick={() => setSelectedTask(task)}
            className="text-white"
          >
            <ListItemText
              primary={
                <Typography className="text-white">
                  {task.title}
                </Typography>
              }
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" className="text-zinc-400">
                    Assigned to: {task.assignedTo}
                  </Typography>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    size="small"
                    color={getStatusColor(task.status)}
                  />
                </Box>
              }
            />
            {isAdmin && (
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setFormData({
                      title: task.title,
                      description: task.description,
                      assignedTo: task.assignedTo,
                      status: task.status,
                    });
                    setIsDialogOpen(true);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(task);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </TaskItem>
        ))}
      </List>

      {/* Create/Edit Task Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Assigned To"
            fullWidth
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={selectedTask ? () => handleTaskUpdate(selectedTask.id, formData) : handleCreateTask}>
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedTask && handleTaskDelete(selectedTask.id)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList; 