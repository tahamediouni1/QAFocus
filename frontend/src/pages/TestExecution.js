import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Button,
  Box,
  Typography,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Paper,
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import StopIcon from '@mui/icons-material/Stop';
import { styled } from '@mui/system';

const StyledContainer = styled(Container)({
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
  padding: '24px',
});

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#1976d2',
});

const NewTestButton = styled(Button)({
  backgroundColor: '#ffeb3b',
  color: '#000',
  '&:hover': {
    backgroundColor: '#fdd835',
  },
});

const StopTestButton = styled(Button)({
  backgroundColor: '#e53935',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
  marginLeft: '16px',
});

const TestList = styled(List)({
  marginTop: '16px',
});

const TestItem = styled(Paper)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  marginBottom: '8px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const TestExecution = () => {
  const { projectId } = useParams();
  const [executionStatus, setExecutionStatus] = useState('Idle');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [testFiles, setTestFiles] = useState([]);

  useEffect(() => {
    fetchTestFiles();
  }, []);

  const fetchTestFiles = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/projects/${projectId}/testruns`);
      setTestFiles(response.data);
    } catch (error) {
      console.error('Error fetching test files:', error);
      setError('Failed to fetch test files.');
    }
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const startTestExecution = async () => {
    if (url && filename) {
      try {
        await axios.post(`http://127.0.0.1:5000/start`, {
          url,
          filename,
          project_id: projectId,
        }, { headers: { 'Content-Type': 'application/json' } });
        setExecutionStatus('Running');
        handleDialogClose();
      } catch (error) {
        console.error('Error starting the test:', error);
        setError('Failed to start the test.');
      }
    }
  };

  const runTestExecution = async (filename) => {
    const url = prompt('Enter the URL to test:');
    if (url && filename) {
      try {
        await axios.post(`http://127.0.0.1:5000/projects/${projectId}/testruns/${filename}`, { url }, { headers: { 'Content-Type': 'application/json' } });
        setExecutionStatus('Running');
      } catch (error) {
        console.error('Error running the test:', error);
        setError('Failed to run the test.');
      }
    }
  };
  
  const deleteTestFile = async (filename) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/projects/${projectId}/testruns/${filename}`);
      fetchTestFiles();
    } catch (error) {
      console.error('Error deleting the test file:', error);
      setError('Failed to delete the test file.');
    }
  };

  const stopTestExecution = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/stop', { filename, project_id: projectId }, { headers: { 'Content-Type': 'application/json' } });
      setExecutionStatus('Stopped');
    } catch (error) {
      console.error('Error stopping the test:', error);
      setError('Failed to stop the test.');
    }
  };

  return (
    <StyledContainer>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Focus Corporation
          </Typography>
          <NewTestButton variant="contained" onClick={handleDialogOpen}>
            <FaPlus />
          </NewTestButton>
          <StopTestButton
            variant="contained"
            onClick={stopTestExecution}
            disabled={executionStatus !== 'Running'}
            startIcon={<StopIcon />}
          >
            Stop Test
          </StopTestButton>
        </Toolbar>
      </StyledAppBar>
      <Box sx={{ flexGrow: 1, marginTop: '24px' }}>
        <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
          Test Execution for Project: {projectId}
        </Typography>
        <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
          Test Execution Status: {executionStatus}
        </Typography>
        {error && <Typography variant="body1" sx={{ color: 'red', textAlign: 'center' }}>{error}</Typography>}
        <TestList>
          {testFiles.length > 0 ? (
            testFiles.map((file) => (
              <TestItem key={file}>
                <ListItemText primary={file.replace('.json', '')} />
                <Tooltip title="Run Test">
                  <IconButton edge="end" aria-label="play" onClick={() => runTestExecution(file)}>
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Test">
                  <IconButton edge="end" aria-label="delete" onClick={() => deleteTestFile(file)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TestItem>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: '#333', textAlign: 'center' }}>
              No tests available. Create a new test to get started.
            </Typography>
          )}
        </TestList>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Enter Test Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            type="url"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Filename"
            type="text"
            fullWidth
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={startTestExecution} color="primary">
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default TestExecution;
