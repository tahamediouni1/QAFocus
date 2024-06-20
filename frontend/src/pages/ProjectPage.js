// src/pages/ProjectPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const ProjectPage = () => {
  const { projectName } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [tests, setTests] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // Fetch existing tests for the project
    const fetchTests = async () => {
      try {
        // Replace with your actual API call to fetch tests
        const response = await axios.get(`/api/projects/${projectName}/tests`);
        setTests(response.data.tests);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, [projectName]);

  const handleCreateTest = async () => {
    if (testUrl && filename) {
      try {
        // Replace with your actual API call to create a test
        await axios.post(`/api/projects/${projectName}/tests`, { url: testUrl, filename });
        setTests([...tests, { url: testUrl, filename }]);
        setTestUrl('');
        setFilename('');
        setDialogOpen(false);
      } catch (error) {
        console.error('Error creating test:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ marginTop: 4, marginBottom: 4 }}>
        Project: {projectName}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
        Start New Test
      </Button>
      <List>
        {tests.map((test, index) => (
          <ListItem button key={index} onClick={() => history.push(`/project/${projectName}/test/${test.filename}`)}>
            <ListItemText primary={test.filename} />
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Start New Test</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test URL"
            type="url"
            fullWidth
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
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
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateTest} color="primary">
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectPage;
