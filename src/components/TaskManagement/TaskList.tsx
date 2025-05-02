import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const TaskItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  comments: any[];
}

interface TaskListProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  isAdmin: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskSelect,
  onTaskUpdate,
  isAdmin,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tasks
      </Typography>
      <List>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            button
            onClick={() => onTaskSelect(task)}
          >
            <ListItemText
              primary={task.title}
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {task.assignedTo}
                  </Typography>
                  <Chip
                    label={task.status}
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
                    // Implement edit functionality
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement delete functionality
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </TaskItem>
        ))}
      </List>
    </Box>
  );
};

export default TaskList; 