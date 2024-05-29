import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'

const Home = () => (
  <div className='container mt-5'>
    <div class='jumbotron mt-5'>
      <h1 class='display-4'>TPM Focus</h1>
      <p class='lead centered-text smaller-paragraph'>
        Offering a streamlined approach for software testing management, from design to integration, ensuring efficient and seamless testing processes
      </p>
      <hr class='my-4' />
      <div class='centered-button'>
        <Link class='btn' to='/login' role='button'>Login</Link>
      </div>
    </div>
  </div>
);

export default Home;
