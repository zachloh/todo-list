import { pubsub } from './pubsub';

const projects = [];
let index;
let tasksForStorage;

const createProject = (name) => {
  let tasks = [];

  const getName = () => name;
  const setName = (newName) => (name = newName);

  const getTasks = () => tasks;
  const setTasks = (newTasks) => (tasks = newTasks);

  return {
    getName,
    setName,
    getTasks,
    setTasks,
  };
};

function pageLoad(project) {
  const newProject = createProject(project.project.name);
  projects.push(newProject);
  pubsub.publish('loadTasks', {
    tasks: project.project.tasks,
    projectIndex: project.index,
  });
}

function loadProjects(project) {
  projects[project.projectIndex].setTasks(project.tasks);
}

function addProject(project) {
  const newProject = createProject(project.name);
  projects.push(newProject);
  addProjectsToStorage();
}

function selectProject(selectedIndex) {
  index = selectedIndex;
  const tasks = projects[index].getTasks();
  pubsub.publish('updateTasksArray', tasks);
}

function updateProject(tasks) {
  projects[index].setTasks(tasks);
  addProjectsToStorage();
}

function deleteProject(index) {
  projects.splice(index, 1);
  addProjectsToStorage();
}

// Functions related to 'today' tasks
function loopEachProject() {
  projects.forEach((project, index) => {
    const tasks = {
      tasks: project.getTasks(),
      projectIndex: index,
      projectName: project.getName(),
    };
    pubsub.publish('getDueTasks', tasks);
  });
}

function getTaskFromProject(index) {
  const tasks = projects[index.projectIndex].getTasks();
  if (index.function === 'viewMore')
    pubsub.publish('getTaskDetails', { tasks, index: index.taskIndex });
  if (index.function === 'setIsChecked')
    pubsub.publish('setTodayIsChecked', {
      tasks,
      taskIndex: index.taskIndex,
      projectIndex: index.projectIndex,
      isChecked: index.isChecked,
    });
  if (index.function === 'setPriority')
    pubsub.publish('setTodayTaskPriority', {
      tasks,
      taskIndex: index.taskIndex,
      projectIndex: index.projectIndex,
      priority: index.priority,
    });
  if (index.function === 'openEditModal')
    pubsub.publish('getTaskDetails', { tasks, index: index.taskIndex });
  if (index.function === 'edit')
    pubsub.publish('editTodayTask', {
      tasks,
      taskIndex: index.taskIndex,
      projectIndex: index.projectIndex,
      newTask: index.newTask,
    });
  if (index.function === 'delete')
    pubsub.publish('deleteTodayDueTask', {
      tasks,
      taskIndex: index.taskIndex,
      projectIndex: index.projectIndex,
    });
}

function updateTodayProject(newTasks) {
  index = newTasks.projectIndex;
  projects[index].setTasks(newTasks.tasks);
  addProjectsToStorage();
}

// Functions related to localStorage
function addProjectsToStorage() {
  const allProjects = [];
  projects.forEach((project) => {
    const projectDetails = {};
    projectDetails.name = project.getName();

    const tasks = project.getTasks();
    pubsub.publish('getTasksForStorage', tasks);
    projectDetails.tasks = tasksForStorage;

    allProjects.push(projectDetails);
  });

  pubsub.publish('sendProjectsForStorage', allProjects);
}

function retrieveTasks(tasks) {
  tasksForStorage = tasks;
}

export {
  pageLoad,
  loadProjects,
  addProject,
  selectProject,
  updateProject,
  deleteProject,
  loopEachProject,
  getTaskFromProject,
  updateTodayProject,
  retrieveTasks,
};
