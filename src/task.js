import { pubsub } from "./pubsub";

let tasks = [];

const createTask = (title, description, dueDate, priority, isChecked) => {
  const getTitle = () => title;
  const setTitle = newTitle => title = newTitle;
  
  const getDescription = () => description;
  const setDescription = newDescription => description = newDescription;

  const getDueDate = () => dueDate;
  const setDueDate = newDueDate => dueDate = newDueDate;

  const getPriority = () => priority;
  const setPriority = newPriority => priority = newPriority;

  const getIsChecked = () => isChecked;
  const setIsChecked = newIsChecked => isChecked = newIsChecked;

  return {
    getTitle,
    setTitle,
    getDescription,
    setDescription,
    getDueDate,
    setDueDate,
    getPriority,
    setPriority,
    getIsChecked,
    setIsChecked
  };
};

function loadTasks(tasksToLoad) {
  if (tasksToLoad.tasks) {
    const tasks = (tasksToLoad.tasks).map(task => {
      return createTask(task.title, task.description, task.dueDate, 
        task.priority, task.isChecked);
    });
    pubsub.publish('loadProjects', {tasks, projectIndex: tasksToLoad.projectIndex});
  }
}

function addTask(task) {
  const newTask = createTask(task.title, task.description, task.dueDate, 
    task.priority, false);
  tasks.push(newTask);
  sendTasksArray();
}

function getTask(index) {
  const task = tasks[index];
  pubsub.publish('getTask', {
    title: task.getTitle(),
    description: task.getDescription(),
    dueDate: task.getDueDate(),
    priority: task.getPriority(),
    isChecked: task.getIsChecked()
  });
}

function updateTask(updatedTask) {
  const task = tasks[updatedTask.index];
  task.setTitle(updatedTask.title);
  task.setDescription(updatedTask.description);
  task.setDueDate(updatedTask.dueDate);
  task.setPriority(updatedTask.priority);
  sendTasksArray();
}

function updateIsChecked(updatedTask) {
  const task = tasks[updatedTask.index];
  task.setIsChecked(updatedTask.isChecked);
  sendTasksArray();
}

function updateTaskPriority(updatedTask) {
  const task = tasks[updatedTask.index];
  task.setPriority(updatedTask.priority);
  sendTasksArray();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  sendTasksArray();
}

// Publish so that projects receive the updated tasks array
function sendTasksArray() {
  pubsub.publish('updateProject', tasks);
}

// Update the task array to the corresponding project
function setTasksArray(newTasksArray) {
  tasks = newTasksArray;

  const tasksToRender = tasks.map(task => {
    return {
      title: task.getTitle(),
      description: task.getDescription(),
      dueDate: task.getDueDate(),
      priority: task.getPriority(),
      isChecked: task.getIsChecked()
    };
  })
  pubsub.publish('renderTasks', tasksToRender);
}

// Functions related to 'today' tasks
function getDueTasks(tasks) {
  let today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); 
  const yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  const tasksToRender = [];
  tasks.tasks.forEach((task, index) => {
    if (task.getDueDate() === today) {
      const taskToRender = {
        title: task.getTitle(),
        description: task.getDescription(),
        dueDate: task.getDueDate(),
        priority: task.getPriority(),
        isChecked: task.getIsChecked(),
        taskIndex: index,
        projectIndex: tasks.projectIndex,
        projectName: tasks.projectName
      };
      tasksToRender.push(taskToRender);
    };
  });
  pubsub.publish('renderTodayTasks', tasksToRender);
}

function getDueTaskDetails(tasks) {
  const task = tasks.tasks[tasks.index];
  pubsub.publish('getTask', {
    title: task.getTitle(),
    description: task.getDescription(),
    dueDate: task.getDueDate(),
    priority: task.getPriority()
  });
}

function setTodayIsChecked(currentTasks) {
  tasks = currentTasks.tasks;
  tasks[currentTasks.taskIndex].setIsChecked(currentTasks.isChecked);
  pubsub.publish('updateTodayProject', {tasks, projectIndex: currentTasks.projectIndex});
}

function setTodayTaskPriority(currentTasks) {
  tasks = currentTasks.tasks;
  tasks[currentTasks.taskIndex].setPriority(currentTasks.priority);
  pubsub.publish('updateTodayProject', {tasks, projectIndex: currentTasks.projectIndex});
}

function editTodayTask(currentTasks) {
  tasks = currentTasks.tasks;
  const task = tasks[currentTasks.taskIndex];
  task.setTitle(currentTasks.newTask.title);
  task.setDescription(currentTasks.newTask.description);
  task.setDueDate(currentTasks.newTask.dueDate);
  task.setPriority(currentTasks.newTask.priority);
  pubsub.publish('updateTodayProject', {tasks, projectIndex: currentTasks.projectIndex});
}

function deleteTodayDueTask(currentTasks) {
  tasks = currentTasks.tasks;
  tasks.splice(currentTasks.taskIndex, 1);
  pubsub.publish('updateTodayProject', {tasks, projectIndex: currentTasks.projectIndex});
}

// function related to localStorage
function getTasksForStorage(currentTasks) {
  const tasksForStorage = [];
  
  currentTasks.forEach(currentTask => {
    tasksForStorage.push({
      title: currentTask.getTitle(),
      description: currentTask.getDescription(),
      dueDate: currentTask.getDueDate(),
      priority: currentTask.getPriority(),
      isChecked: currentTask.getIsChecked()
    });
  });
  pubsub.publish('sendTasksForStorage', tasksForStorage);
}

export {
  loadTasks,
  addTask,
  getTask,
  updateTask,
  updateIsChecked,
  updateTaskPriority,
  deleteTask,
  sendTasksArray,
  setTasksArray,
  getDueTasks,
  getDueTaskDetails,
  setTodayIsChecked,
  setTodayTaskPriority,
  editTodayTask,
  deleteTodayDueTask,
  getTasksForStorage
};