import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

const CommentItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const CommentImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '4px',
  marginTop: '8px',
});

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isCompleted: boolean;
}

interface TaskCommentsProps {
  comments: TaskComment[];
  isAdmin: boolean;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ comments, isAdmin }) => {
  const sortedComments = [...comments].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <List>
      {sortedComments.map((comment) => (
        <CommentItem key={comment.id} elevation={1}>
          <ListItem alignItems="flex-start" disableGutters>
            <ListItemAvatar>
              <Avatar>{comment.userName[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {comment.userName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(comment.timestamp, 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {comment.content}
                  </Typography>
                  {comment.imageUrl && (
                    <Box mt={1}>
                      <CommentImage
                        src={comment.imageUrl}
                        alt="Task completion proof"
                        loading="lazy"
                      />
                    </Box>
                  )}
                  {comment.isCompleted && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      ✓ Task marked as completed
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        </CommentItem>
      ))}
    </List>
  );
};

export default TaskComments; 