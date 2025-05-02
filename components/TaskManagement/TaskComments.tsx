'use client';

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
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.shape.borderRadius,
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
        <CommentItem key={comment.id} elevation={0}>
          <ListItem alignItems="flex-start" disableGutters>
            <ListItemAvatar>
              <Avatar>{comment.userName[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" className="text-white">
                    {comment.userName}
                  </Typography>
                  <Typography variant="caption" className="text-zinc-400">
                    {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    component="span"
                    variant="body2"
                    className="text-zinc-300"
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
                      className="text-green-500"
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