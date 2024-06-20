// src/pages/TestPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TestPage = () => {
  const { projectName, filename } = useParams();
  const [testUrl, setTestUrl] = useState('');
  const [executionStatus, setExecutionStatus] = useState('Idle');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch test details if needed
  }, [projectName, filename]);

  const runTestExecution = async () => {
    if (testUrl) {
      try {
        await axios.post('http://127.0.0.1:5000/run-test', { url: testUrl, filename }, { headers: { 'Content-Type': 'application/json' } });
        setExecutionStatus('Running');
      } catch (error) {
        console.error('Error running the test:', error);
        setError('Failed to run the test.');
      }
    }
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

  return (
    <Container>
      <Typography variant="h4" sx={{ marginTop: 4, marginBottom: 4 }}>
        Test: {filename}
      </Typography>
      <TextField
        margin="dense"
        label="Test URL"
        type="url"
        fullWidth
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={runTestExecution} sx={{ marginTop: 2 }}>
        Run Test
      </Button>
      <Button variant="contained" color="secondary" onClick={stopTestExecution} sx={{ marginTop: 2 }}>
        Stop Test
      </Button>
      {error && <Typography variant="body1" sx={{ color: 'red', marginTop: 2 }}>{error}</Typography>}
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Test Execution Status: {executionStatus}
      </Typography>
    </Container>
  );
};

export default TestPage;
