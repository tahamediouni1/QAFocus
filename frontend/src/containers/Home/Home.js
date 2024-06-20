import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'

const Home = () => (
  <div className='container mt-5'>
    <div class='jumbotron mt-5'>
      <h1 class='display-4'>QAFocus.ai</h1>
      <p class='lead centered-text smaller-paragraph'>
      QA meets AI-driven computer vision for precise, efficient testing in fast-paced software development.
      </p>
      <hr class='my-4' />
      <div class='centered-button'>
        <Link class='btn' to='/login' role='button'>Login</Link>
      </div>
    </div>
  </div>
);

export default Home;
