function addToStorage(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

function retrieveFromStorage() {
  const projects = JSON.parse(localStorage.getItem('projects'));
  return projects;
}

export { addToStorage, retrieveFromStorage };
