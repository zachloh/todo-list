import './style.css';
import { addModalEvents, addTaskFormSubmitEvents } from './taskDisplayController';
import { subscribeToEvents } from './eventsHandler';
import { initialPageLoad, addProjectEvents } from './projectDisplayController';

// Prevent modals from animating on page load
window.addEventListener('load', () => {
  const body = document.querySelector('body');
  body.classList.remove('preload');
});

addModalEvents();
addTaskFormSubmitEvents();
subscribeToEvents();
initialPageLoad();
addProjectEvents();