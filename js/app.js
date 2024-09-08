const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSidebar(){
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

function toggleSubMenu(button){

  if(!button.nextElementSibling.classList.contains('show')){
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if(sidebar.classList.contains('close')){
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

// Get all the theme buttons
const themeButtons = document.querySelectorAll('.sub-menu li a');

// Add an event listener to each button
themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the class of the button (e.g. emeraldmode, bluemode, etc.)
    const themeClass = button.className;

    // Remove any existing theme classes from the body
    document.body.classList.remove('emeraldmode', 'bluemode', 'purplemode', 'pinkmode');

    // Add the selected theme class to the body
    document.body.classList.add(themeClass);
  });
});

function closeAllSubMenus(){
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}

// Get the saved theme from local storage
const savedTheme = localStorage.getItem('theme');

// If a theme is saved, apply it
if (savedTheme) {
  document.body.classList.add(savedTheme);
}

// Add an event listener to each button
themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the class of the button (e.g. emeraldmode, bluemode, etc.)
    const themeClass = button.className;

    // Remove any existing theme classes from the body
    document.body.classList.remove('emeraldmode', 'bluemode', 'purplemode', 'pinkmode', 'redmode');

    // Add the selected theme class to the body
    document.body.classList.add(themeClass);

    // Save the selected theme to local storage
    localStorage.setItem('theme', themeClass);
  });
});