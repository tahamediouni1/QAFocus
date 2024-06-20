document.addEventListener('DOMContentLoaded', function() {
    var startTestButton = document.getElementById('startTestButton');
    var createTestButton = document.getElementById('createTestButton');
    var urlInput = document.getElementById('urlInput');
  
    // Assuming there's a form element with the ID 'createTestForm'
    var createTestForm = document.getElementById('createTestForm');
  
    startTestButton.addEventListener('click', function() {
      var url = urlInput.value.trim();
      if (url) {
        window.location.href = '/index1';
      } else {
        alert('Please enter a URL to start the test.');
      }
    });
  
    createTestButton.addEventListener('click', function(event) {
      var url = urlInput.value.trim();
      if (url) {
        // Assuming you want to submit the form when a URL is entered
        createTestForm.submit();
      } else {
        alert('Please enter a URL to create a new test.');
        event.preventDefault(); // Prevent default form submission if no URL
      }
    });
  });
  