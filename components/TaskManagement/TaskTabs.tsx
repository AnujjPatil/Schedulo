'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import TaskList from './TaskList';
import TaskDashboard from './TaskDashboard';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TaskTabsProps {
  serverId: string;
  projectId: string;
}

export const TaskTabs: React.FC<TaskTabsProps> = ({ serverId, projectId }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs
          value={value}
          onChange={handleChange}
          aria-label="task tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <StyledTab label="List" />
          <StyledTab label="Dashboard" />
        </StyledTabs>
      </Box>
      <TabPanel value={value} index={0}>
        <TaskList serverId={serverId} projectId={projectId} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TaskDashboard serverId={serverId} projectId={projectId} />
      </TabPanel>
    </Box>
  );
}; 