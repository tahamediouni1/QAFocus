import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

const Root = styled('div')({
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
  paddingTop: '24px',
});

const AppBarStyled = styled(AppBar)({
  backgroundColor: '#1976d2',
  marginBottom: '32px',
});

const ContainerStyled = styled(Container)({
  padding: '32px',
});

const ProjectList = styled(Paper)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginTop: '16px',
});

const ProjectItem = styled(Paper)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  marginBottom: '16px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const CreateButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
  marginBottom: '16px',
});

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
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <Root>
      <AppBarStyled position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Focus Corporation for Automated Tests
          </Typography>
          <IconButton color="inherit" onClick={() => setDialogOpen(true)}>
            <FaPlus />
          </IconButton>
        </Toolbar>
      </AppBarStyled>
      <ContainerStyled>
        <Typography variant="h4" gutterBottom>
          Projects
        </Typography>
        <CreateButton variant="contained" onClick={() => setDialogOpen(true)}>
          Create Project
        </CreateButton>
        {projects.length > 0 ? (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <ProjectItem>
                  <ListItemText
                    primary={project.name}
                    secondary={project.description}
                    onClick={() => history.push(`/projects/${project.id}/testruns`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Tooltip title="Delete Project">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => deleteProject(project.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ProjectItem>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1">
            No projects found. Create a new project to get started.
          </Typography>
        )}
      </ContainerStyled>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        style={{ padding: '16px' }}
      >
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
    </Root>
  );
};

export default Dashboard;
