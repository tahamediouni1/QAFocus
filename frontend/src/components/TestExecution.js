import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Box, Typography, Container, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { styled } from '@mui/system';

const TestExecutionWrapper = ({ children }) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const handleNewTest = () => {
    console.log('Create new test clicked.');
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Focus Corporation
          </Typography>
          <IconButton color="inherit" onClick={() => setShowDrawer(true)}>
            <FaPlus />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </Container>
      <Drawer anchor="left" open={showDrawer} onClose={() => setShowDrawer(false)}>
        <List>
          <ListItem button onClick={() => setShowDrawer(false)}>
            <ListItemText primary="Previous Tests" />
          </ListItem>
          <ListItem button onClick={() => setShowDrawer(false)}>
            <ListItemText primary="Test Cases" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
};

const TestExecutionStatus = ({ status }) => (
  <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
    Test Execution Status: {status}
  </Typography>
);

const CenteredButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

const TestExecutionControls = ({ status, onStart, onPause, onResume, onStop, onDelete, onListTests }) => {
  const getButtonStyle = (isDisabled) => (isDisabled ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
      <CenteredButton style={{ ...getButtonStyle(status !== 'Idle') }} onClick={onStart} disabled={status !== 'Idle'}>
        Create Test
      </CenteredButton>
      <CenteredButton style={{ ...getButtonStyle(status !== 'Idle') }} onClick={onPause} disabled={status === 'Running'}>
        Run Latest Test
      </CenteredButton>
      <CenteredButton style={{ ...getButtonStyle(status !== 'Paused') }} onClick={onResume} disabled={status !== 'Paused'}>
        Resume Test
      </CenteredButton>
      <CenteredButton style={{ ...getButtonStyle(status === 'Idle' || status === 'Stopped') }} onClick={onStop} disabled={status === 'Idle' || status === 'Stopped'}>
        Stop Test
      </CenteredButton>
      <CenteredButton onClick={onDelete} sx={{ backgroundColor: '#e53935', '&:hover': { backgroundColor: '#d32f2f' } }}>
        Delete Test Run
      </CenteredButton>
      <CenteredButton onClick={onListTests} sx={{ backgroundColor: '#2196f3', '&:hover': { backgroundColor: '#1976d2' } }}>
        List Available Tests
      </CenteredButton>
    </Box>
  );
};

const TestExecution = () => {
  const [executionStatus, setExecutionStatus] = useState('Idle');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [testFiles, setTestFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.error('No token found in local storage.');
    }
  }, []);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const startTestExecution = async () => {
    if (url && filename) {
      try {
        await axios.post('http://127.0.0.1:5000/start', { url, filename }, { headers: { 'Content-Type': 'application/json' } });
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
        await axios.post('http://127.0.0.1:5000/run-test', { url, filename }, { headers: { 'Content-Type': 'application/json' } });
        setExecutionStatus('Running');
      } catch (error) {
        console.error('Error running the test:', error);
        setError('Failed to run the test.');
      }
    }
  };

  const resumeTestExecution = () => {
    setExecutionStatus('Running');
  };

  const stopTestExecution = async () => {
    try {
      await axios.get('http://127.0.0.1:5000/stop');
      setExecutionStatus('Stopped');
    } catch (error) {
      console.error('Error stopping the test:', error);
      setError('Failed to stop the test.');
    }
  };

  const deleteTestRun = () => {
    alert('Test run deleted successfully.');
  };

  const listAvailableTests = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/list-tests');
      setTestFiles(response.data.tests);
    } catch (error) {
      console.error('Error fetching test files:', error);
      setError('Failed to fetch test files.');
    }
  };

  return (
    <TestExecutionWrapper>
      <div>
        <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'center' }}>
          Test Execution
        </Typography>
        <TestExecutionStatus status={executionStatus} />
        {error && <Typography variant="body1" sx={{ color: 'red', textAlign: 'center' }}>{error}</Typography>}
        <TestExecutionControls
          status={executionStatus}
          onStart={handleDialogOpen}
          onPause={listAvailableTests}
          onResume={resumeTestExecution}
          onStop={stopTestExecution}
          onDelete={deleteTestRun}
          onListTests={listAvailableTests}
        />
        {testFiles.length > 0 && (
          <List>
            {testFiles.map((file, index) => (
              <ListItem key={index} button onClick={() => runTestExecution(file)}>
                <ListItemText primary={file} />
              </ListItem>
            ))}
          </List>
        )}
      </div>
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
    </TestExecutionWrapper>
  );
};

export default TestExecution;
