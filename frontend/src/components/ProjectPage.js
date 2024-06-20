import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const ProjectPage = () => {
  const { projectId } = useParams();
  const [testRuns, setTestRuns] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    fetchTestRuns();
  }, []);

  const fetchTestRuns = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/projects/${projectId}/testruns`);
      setTestRuns(response.data);
    } catch (error) {
      console.error('Error fetching test runs:', error);
    }
  };

  const createTestRun = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/projects/${projectId}/testruns`, { name: testName, actions: [] });
      setDialogOpen(false);
      setTestName('');
      setTestRuns([...testRuns, response.data]);
    } catch (error) {
      console.error('Error creating test run:', error);
    }
  };

  return (
    <div>
      <Button variant="contained" onClick={() => setDialogOpen(true)}>Create Test Run</Button>
      <List>
        {testRuns.map((testRun) => (
          <ListItem button key={testRun.id}>
            <ListItemText primary={testRun.name} />
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Test Run</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Run Name"
            type="text"
            fullWidth
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={createTestRun} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectPage;
