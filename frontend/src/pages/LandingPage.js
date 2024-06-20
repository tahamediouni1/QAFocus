// src/pages/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const LandingPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // Fetch existing projects from the server or local storage
    const fetchProjects = async () => {
      try {
        // Replace with your actual API call to fetch projects
        const response = await axios.get('/api/projects');
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (projectName) {
      try {
        // Replace with your actual API call to create a project
        await axios.post('/api/projects', { name: projectName });
        setProjects([...projects, { name: projectName }]);
        setProjectName('');
        setDialogOpen(false);
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ marginTop: 4, marginBottom: 4 }}>
        Projects
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
        Create New Project
      </Button>
      <List>
        {projects.map((project, index) => (
          <ListItem button key={index} onClick={() => history.push(`/project/${project.name}`)}>
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
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateProject} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LandingPage;
