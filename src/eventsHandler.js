import { pubsub } from './pubsub';
import { loadTasks, addTask, getTask, updateTask, updateIsChecked, updateTaskPriority, deleteTask, setTasksArray, getDueTasks, getDueTaskDetails, setTodayIsChecked, setTodayTaskPriority, editTodayTask, deleteTodayDueTask, getTasksForStorage } from './task';
import { editTaskForm, taskUI } from './taskDisplayController';
import { pageLoad, loadProjects, addProject, selectProject, updateProject, deleteProject, loopEachProject, getTaskFromProject, updateTodayProject, retrieveTasks } from './projects';
import { todayUI } from './projectDisplayController';
import { addToStorage } from './storage';

function subscribeToEvents() {
  // Adding a new task
  pubsub.subscribe('addTask', addTask);

  // Viewing details of a task
  pubsub.subscribe('getTask', editTaskForm.prefillForm);
  pubsub.subscribe('openTaskDetailsModal', getTask);

  // Editing a task
  pubsub.subscribe('getTask', taskUI.fillViewMoreModal);
  pubsub.subscribe('openEditTaskModal', getTask);
  pubsub.subscribe('updateTask', updateTask);

  // Checking a task
  pubsub.subscribe('updateIsChecked', updateIsChecked);
  pubsub.subscribe('updateProject', updateProject);

  // Toggle priority
  pubsub.subscribe('updateTaskPriority', updateTaskPriority);

  // Deleting a task
  pubsub.subscribe('deleteTask', deleteTask);

  // Adding a new project
  pubsub.subscribe('addProject', addProject);

  // Selecting a project
  pubsub.subscribe('selectProject', selectProject);
  pubsub.subscribe('updateTasksArray', setTasksArray);
  pubsub.subscribe('renderTasks', taskUI.render);

  // Deleting a project
  pubsub.subscribe('deleteProject', deleteProject);

  // Get tasks due today
  pubsub.subscribe('loopEachProject', loopEachProject);
  pubsub.subscribe('getDueTasks', getDueTasks);
  pubsub.subscribe('renderTodayTasks', todayUI.renderTodayTasks);

  // Get today task description
  pubsub.subscribe('getDueTaskDetails', getTaskFromProject);
  pubsub.subscribe('getTaskDetails', getDueTaskDetails);

  // Update today isChecked
  pubsub.subscribe('updateTodayIsChecked', getTaskFromProject);
  pubsub.subscribe('setTodayIsChecked', setTodayIsChecked);
  pubsub.subscribe('updateTodayProject', updateTodayProject);

  // Update today task priority
  pubsub.subscribe('updateTodayTaskPriority', getTaskFromProject);
  pubsub.subscribe('setTodayTaskPriority', setTodayTaskPriority);

  // Edit today task
  pubsub.subscribe('openTodayEditModal', getTaskFromProject);
  pubsub.subscribe('getTask', todayUI.prefillForm);
  pubsub.subscribe('updateTodayTask', getTaskFromProject);
  pubsub.subscribe('editTodayTask', editTodayTask);

  // Delete today task
  pubsub.subscribe('deleteTodayTask', getTaskFromProject);
  pubsub.subscribe('deleteTodayDueTask', deleteTodayDueTask);

  // Add to local storage
  pubsub.subscribe('getTasksForStorage', getTasksForStorage);
  pubsub.subscribe('sendTasksForStorage', retrieveTasks);
  pubsub.subscribe('sendProjectsForStorage', addToStorage);

  // Page load
  pubsub.subscribe('pageLoad', pageLoad);
  pubsub.subscribe('loadTasks', loadTasks);
  pubsub.subscribe('loadProjects', loadProjects);
}

export {
  subscribeToEvents
};