import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEye, faSearch  } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import './Users.css'

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ email: '', first_name: '', last_name: '', is_staff: false });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUserData, setViewUserData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByIsStaff, setSortByIsStaff] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/accounts/get_all_users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.get(`http://127.0.0.1:8000/accounts/delete_user/${userToDelete}/`);
      loadUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditUserId(user.id);
    setEditUserData({ email: user.email, first_name: user.first_name, last_name: user.last_name, is_staff: user.is_staff });
    setShowEditModal(true);
  };

  const handleViewUser = async (email) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/accounts/get_user/${email}/`);
      setViewUserData(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    setShowUpdateConfirmModal(true);
  };

  const confirmUpdateUser = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/accounts/update_user/${editUserId}/`, editUserData);
      loadUsers();
      setShowEditModal(false);
      setShowUpdateConfirmModal(false);
      setEditUserId(null);
      setEditUserData({ email: '', first_name: '', last_name: '', is_staff: false });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const openDeleteModal = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortByIsStaff) {
      return b.is_staff - a.is_staff;
    } else {
      return b.is_active - a.is_active;
    }
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  return (
    <div className='container-fullscreen'>
    <h1 className='centered-title'>User List</h1>
    <div className="header-container">
          <div className="search-bar">
            <div className="search-icon">
              <FontAwesomeIcon icon={faSearch} style={{ color: '#FFD100' }}/>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="sort-by">
            <label>Sort by : </label>
            <select
              value={sortByIsStaff ? 'is_staff' : 'is_active'}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'is_staff') {
                  setSortByIsStaff(true);
                } else {
                  setSortByIsStaff(false);
                }
              }}
            >
              <option value="is_staff">Staff</option>
              <option value="is_active">Active</option>
            </select>
          </div>
        </div>

    <table className='table'>
      <thead className='table-header'>
        <tr>
          <th>Email</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.first_name}</td>
            <td>{user.last_name}</td>
            <td>{user.is_active ? 'Active' : 'Inactive'}</td>
            <td>
              <button onClick={() => handleViewUser(user.email)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '10px' }}>
                <FontAwesomeIcon icon={faEye} style={{ color: 'green' }} />
              </button>
              <button onClick={() => handleEditUser(user)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '10px' }}>
                <FontAwesomeIcon icon={faEdit} style={{ color: 'blue' }} />
              </button>
              <button onClick={() => openDeleteModal(user.id)} style={{ background: 'none', border: 'none', padding: 0, marginRight: '10px' }}>
                <FontAwesomeIcon icon={faTrash} style={{ color: 'red' }} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
   
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton className="modal-header">
    <Modal.Title className="text-center" style={{ color: '#FFD100' }}>Edit User</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form onSubmit={handleUpdateUser}>
      <Form.Group controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={editUserData.email}
          onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
          required
          style={{ color: 'black', border: '1px solid #ced4da', borderRadius: '8px' }}
        />
      </Form.Group>
      <Form.Group controlId="formFirstName">
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          value={editUserData.first_name}
          onChange={(e) => setEditUserData({ ...editUserData, first_name: e.target.value })}
          required
          style={{ color: 'black', border: '1px solid #ced4da', borderRadius: '8px' }}
        />
      </Form.Group>
      <Form.Group controlId="formLastName">
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          value={editUserData.last_name}
          onChange={(e) => setEditUserData({ ...editUserData, last_name: e.target.value })}
          required
          style={{ color: 'black', border: '1px solid #ced4da', borderRadius: '8px' }}
        />
      </Form.Group>
      <Form.Group controlId="formIsStaff" className="mt-3">
  <div className="d-flex align-items-center mb-2">
    <div className="switch mr-2">
      <label>
        <input 
          type="checkbox" 
          checked={editUserData.is_staff}
          onChange={(e) => setEditUserData({ ...editUserData, is_staff: e.target.checked })}
        />
        <span className="slider"></span>
      </label>
    </div>
    <span className="switch-label">{editUserData.is_staff ? 'Staff' : 'Not Staff'}</span>
  </div>
</Form.Group>




      <Button variant="primary" type="submit" className="text-center d-block">Update</Button> {/* Ajout des classes Bootstrap pour centrer le bouton */}
    </Form>
  </Modal.Body>
</Modal>



      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Email:</strong> {viewUserData.email}</p>
          <p><strong>First Name:</strong> {viewUserData.first_name}</p>
          <p><strong>Last Name:</strong> {viewUserData.last_name}</p>
          <p><strong>Status:</strong> {viewUserData.is_active ? 'Active' : 'Inactive'}</p>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this user with ID: {userToDelete}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUpdateConfirmModal} onHide={() => setShowUpdateConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to update this user with the following details?</p>
          <p><strong>Email:</strong> {editUserData.email}</p>
          <p><strong>First Name:</strong> {editUserData.first_name}</p>
          <p><strong>Last Name:</strong> {editUserData.last_name}</p>
          <p><strong>Is Staff:</strong> {editUserData.is_staff ? 'Yes' : 'No'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmUpdateUser}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserList;
