import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, List, ListItem, ListItemText, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createProject = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/projects', { name, description });
      setDialogOpen(false);
      setName('');
      setDescription('');
      history.push(`/projects/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId) => {
    history.push(`/projects/${projectId}`);
  };

  return (
    <div>
      <Button variant="contained" onClick={() => setDialogOpen(true)}>Create Project</Button>
      <List>
        {projects.map((project) => (
          <ListItem button key={project.id} onClick={() => handleProjectClick(project.id)}>
            <ListItemText primary={project.name} />
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={createProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
