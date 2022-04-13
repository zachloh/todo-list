import { createElement } from './createElement';
import { retrieveFromStorage } from './storage';
import { pubsub } from './pubsub';
import ProjectIcon from './assets/images/list.svg';
import DeleteIcon from './assets/images/delete.svg';
import MoreIcon from './assets/images/more.svg';
import EditIcon from './assets/images/edit.svg';
import { format, parseISO } from 'date-fns';

const modal = document.querySelector('.add-project-modal');
const tasks = document.querySelector('.tasks');

function initialPageLoad() {
  homeUI.pageLoad();

  const projects = retrieveFromStorage();
  projects.forEach((project, index) => {
    if (index > 0) {
      pubsub.publish('pageLoad', { project, index });
      projectUI.addProject(project.name);
    }
  });

  homeUI.selectHome();
  todayUI.addEvent();
  todayUI.addFormSubmitEvent();
}

function addProjectEvents() {
  const addProjectBtn = document.querySelector('.projects-title img');
  addProjectBtn.addEventListener('click', () => {
    openModal(modal);
  });
  addProjectForm.formSubmitEvent();
}

function openModal(modal) {
  if (modal) {
    modal.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
  }
}

// 'Add Project' form module
const addProjectForm = (function () {
  const form = document.querySelector('.add-project-form');
  const projectName = document.querySelector('.add-project-name input');

  function formSubmitEvent() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = projectName.value;
      if (isValid(name)) {
        pubsub.publish('addProject', { name });
        projectUI.addProject(name);
        closeModal(modal);
        resetForm();
      } else {
        alert('This project name already exists');
      }
    });
  }

  function isValid(name) {
    const currentProjectNames = document.querySelectorAll('.project div');
    return ![...currentProjectNames].some(
      (projectName) => projectName.textContent === name
    );
  }

  function resetForm() {
    projectName.value = '';
  }

  return {
    formSubmitEvent,
  };
})();

// Home is the default project
const homeUI = (function () {
  const home = document.querySelector('.home');

  function pageLoad() {
    const projects = retrieveFromStorage();
    if (!projects) {
      pubsub.publish('addProject', { name: 'home' });
    } else {
      pubsub.publish('pageLoad', { project: projects[0], index: 0 });
    }

    selectHome();
    home.addEventListener('click', () => {
      selectHome();
    });
  }

  function selectHome() {
    home.classList.add('selected');
    projectUI.unselectProjects();
    todayUI.unselectToday();

    const projectTitle = document.querySelector('.tasks-title');
    projectTitle.textContent = 'Home';

    tasks.innerHTML = '';
    pubsub.publish('selectProject', 0);
  }

  function unselectHome() {
    home.classList.remove('selected');
  }

  return {
    pageLoad,
    selectHome,
    unselectHome,
  };
})();

const todayUI = (function () {
  const today = document.querySelector('.today');
  const addTaskBtn = document.querySelector('.add-task');
  const taskTitle = document.querySelector(
    '.edit-today-task-modal input[type=text]'
  );
  const taskDescription = document.querySelector(
    '.edit-today-task-modal textarea'
  );
  const taskDueDate = document.querySelector(
    '.edit-today-task-modal input[type=date]'
  );
  const taskPriority = document.querySelectorAll(
    '.edit-today-task-modal input[name="priority"]'
  );

  // To be used by the edit task function
  let taskIndex;
  let projectIndex;

  function addEvent() {
    today.addEventListener('click', () => {
      selectToday();
    });
  }

  function selectToday() {
    today.classList.add('selected');
    homeUI.unselectHome();
    projectUI.unselectProjects();

    const projectTitle = document.querySelector('.tasks-title');
    projectTitle.textContent = 'Today';

    // Get each project to get their tasks due today
    tasks.innerHTML = '';
    pubsub.publish('loopEachProject');

    addTaskBtn.style.display = 'none';
  }

  function unselectToday() {
    today.classList.remove('selected');
    addTaskBtn.style.display = 'flex';
  }

  function renderTodayTasks(tasks) {
    tasks.forEach((task, index) => {
      addTaskToUI(task, index);
    });
  }

  function addTaskToUI(task, taskUiIndex) {
    if (taskUiIndex === 0) {
      const taskTitle = createElement('div', ['tasks-title'], {});
      tasks.appendChild(taskTitle);
      taskTitle.textContent = `${task.projectName}:`;
    }

    const taskContainer = createElement('div', ['task'], {
      'data-task-id': task.taskIndex,
      'data-project-id': task.projectIndex,
    });
    tasks.appendChild(taskContainer);

    const checkbox = createElement('input', [], {
      type: 'checkbox',
      id: `${task.projectIndex}-${task.taskIndex}`,
    });
    taskContainer.appendChild(checkbox);

    const label = createElement('label', [], {
      for: `${task.projectIndex}-${task.taskIndex}`,
    });
    taskContainer.appendChild(label);

    const priority = createElement('div', ['tooltip'], {
      'data-tooltip': 'Toggle Priority',
    });
    taskContainer.appendChild(priority);

    const dueDate = createElement('div', ['due-date'], {});
    taskContainer.appendChild(dueDate);

    const options = createElement('div', ['options'], {});
    taskContainer.appendChild(options);

    const viewMoreIconContainer = createElement('div', ['tooltip'], {
      'data-tooltip': 'View Details',
    });
    options.appendChild(viewMoreIconContainer);

    const viewMoreIcon = document.createElement('img');
    viewMoreIcon.src = MoreIcon;
    viewMoreIcon.alt = 'view more icon';
    viewMoreIconContainer.appendChild(viewMoreIcon);

    const editIconContainer = createElement('div', ['tooltip'], {
      'data-tooltip': 'Edit',
    });
    options.appendChild(editIconContainer);

    const editIcon = document.createElement('img');
    editIcon.src = EditIcon;
    editIcon.alt = 'edit icon';
    editIconContainer.appendChild(editIcon);

    const deleteIconContainer = createElement('div', ['tooltip'], {
      'data-tooltip': 'Delete',
    });
    options.appendChild(deleteIconContainer);

    const deleteIcon = document.createElement('img');
    deleteIcon.src = DeleteIcon;
    deleteIcon.alt = 'delete icon';
    deleteIconContainer.appendChild(deleteIcon);

    if (task.isChecked) {
      checkbox.classList.add('checked');
      checkbox.checked = true;
    }
    label.textContent = task.title;
    setPriority(task.priority, priority);
    dueDate.textContent = format(parseISO(task.dueDate), 'dd/MM/yyyy');

    // add task functionalities
    addCheckEvent(checkbox);
    addTogglePriorityEvent(priority);
    addViewMoreEvent(viewMoreIcon);
    addEditEvent(editIcon);
    addDeleteEvent(deleteIcon);
  }

  function setPriority(priority, element) {
    if (priority === 'low') {
      element.textContent = '!';
      element.classList.add('low-priority');
    } else if (priority === 'medium') {
      element.textContent = '!!';
      element.classList.add('medium-priority');
    } else {
      element.textContent = '!!!';
      element.classList.add('high-priority');
    }
  }

  function addCheckEvent(checkbox) {
    checkbox.addEventListener('click', () => {
      checkbox.classList.toggle('checked');

      const projectIndex = checkbox.closest('.task').dataset.projectId;
      const taskIndex = checkbox.closest('.task').dataset.taskId;
      pubsub.publish('updateTodayIsChecked', {
        projectIndex,
        taskIndex,
        isChecked: checkbox.checked,
        function: 'setIsChecked',
      });
    });
  }

  function addTogglePriorityEvent(element) {
    element.addEventListener('click', () => {
      let priority;
      const projectIndex = element.closest('.task').dataset.projectId;
      const taskIndex = element.closest('.task').dataset.taskId;
      element.classList.value = '';
      element.classList.add('tooltip');

      if (element.textContent === '!') {
        priority = 'medium';
        setPriority(priority, element);
      } else if (element.textContent === '!!') {
        priority = 'high';
        setPriority(priority, element);
      } else {
        priority = 'low';
        setPriority(priority, element);
      }

      pubsub.publish('updateTodayTaskPriority', {
        projectIndex,
        taskIndex,
        priority,
        function: 'setPriority',
      });
    });
  }

  function addViewMoreEvent(button) {
    button.addEventListener('click', () => {
      const modal = document.querySelector('.task-details-modal');
      const projectIndex = button.closest('.task').dataset.projectId;
      const taskIndex = button.closest('.task').dataset.taskId;

      pubsub.publish('getDueTaskDetails', {
        projectIndex,
        taskIndex,
        function: 'viewMore',
      });
      openModal(modal);
    });
  }

  function addEditEvent(button) {
    button.addEventListener('click', () => {
      const modal = document.querySelector('.edit-today-task-modal');
      projectIndex = button.closest('.task').dataset.projectId;
      taskIndex = button.closest('.task').dataset.taskId;

      // publish
      pubsub.publish('openTodayEditModal', {
        projectIndex,
        taskIndex,
        function: 'openEditModal',
      });
      openModal(modal);
    });
  }

  function prefillForm(task) {
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskDueDate.value = task.dueDate;
    if (task.priority === 'low') {
      taskPriority[0].checked = true;
    } else if (task.priority === 'medium') {
      taskPriority[1].checked = true;
    } else {
      taskPriority[2].checked = true;
    }
  }

  function addDeleteEvent(button) {
    button.addEventListener('click', () => {
      const taskContainer = button.closest('.task');
      const projectIndex = button.closest('.task').dataset.projectId;
      const taskIndex = taskContainer.dataset.taskId;
      taskContainer.parentElement.removeChild(taskContainer);
      updateIndex(projectIndex);
      pubsub.publish('deleteTodayTask', {
        projectIndex,
        taskIndex,
        function: 'delete',
      });
    });
  }

  function updateIndex(projectIndex) {
    const tasks = document.querySelectorAll('.task');
    const currentProjectTasks = [...tasks].filter((task) => {
      return task.dataset.projectId === projectIndex;
    });
    currentProjectTasks.forEach((task, index) => {
      task.dataset.taskId = index;
    });

    const taskTitles = document.querySelectorAll('.tasks .tasks-title');
    if (currentProjectTasks.length === 0) {
      [...taskTitles].forEach((taskTitle) => {
        if (
          !taskTitle.nextElementSibling ||
          !taskTitle.nextElementSibling.classList.contains('task')
        )
          taskTitle.parentElement.removeChild(taskTitle);
      });
    }
  }

  function addFormSubmitEvent() {
    const form = document.querySelector('.edit-today-task-modal form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const priorityValue = [...taskPriority].find(
        (input) => input.checked
      ).value;
      const task = {
        title: taskTitle.value,
        description: taskDescription.value,
        dueDate: taskDueDate.value,
        priority: priorityValue,
      };
      const modal = document.querySelector('.edit-today-task-modal');

      // Check if the name is taken (only in the current project)
      const tasks = document.querySelectorAll('.task');
      const currentProjectTasks = [...tasks].filter((task) => {
        return task.dataset.projectId === projectIndex;
      });
      const filteredTasks = currentProjectTasks.filter(
        (task) => task.dataset.taskId !== taskIndex
      );

      if (isValid(task.title, filteredTasks)) {
        closeModal(modal);
        editTask(task);
      } else {
        alert('This task title already exists in this project');
      }
    });
  }

  function isValid(name, tasks) {
    const taskNames = tasks.map(
      (task) => task.querySelector('label').textContent
    );
    return !taskNames.some((taskName) => taskName === name);
  }

  function editTask(task) {
    pubsub.publish('updateTodayTask', {
      projectIndex,
      taskIndex,
      newTask: task,
      function: 'edit',
    });

    // Remove task from UI if date changed
    selectToday();
  }

  return {
    addEvent,
    selectToday,
    unselectToday,
    renderTodayTasks,
    prefillForm,
    addFormSubmitEvent,
  };
})();

const projectUI = (function () {
  let index;
  const projectContainer = document.querySelector('.projects');

  function addProject(name) {
    let projectCounter = projectContainer.childElementCount;

    const project = createElement('div', ['project'], {
      'data-id': projectCounter + 1,
    });
    projectContainer.appendChild(project);

    const projectIcon = document.createElement('img');
    projectIcon.src = ProjectIcon;
    projectIcon.alt = 'list icon';
    project.appendChild(projectIcon);

    const projectName = createElement('div', ['project-title'], {});
    projectName.textContent = name;
    project.appendChild(projectName);

    const projectOptions = createElement('div', ['project-options'], {});
    project.appendChild(projectOptions);

    const deleteIconWrapper = createElement('div', ['tooltip'], {
      'data-tooltip': 'Delete',
    });
    projectOptions.appendChild(deleteIconWrapper);

    const deleteIcon = document.createElement('img');
    deleteIcon.src = DeleteIcon;
    deleteIcon.alt = 'delete icon';
    deleteIconWrapper.appendChild(deleteIcon);

    selectProject(project, name);
    addSelectProjectEvent(project, name);

    // add project functionalities
    addDeleteEvent(deleteIcon);
  }

  function addSelectProjectEvent(projectElement, projectName) {
    projectElement.addEventListener('click', () => {
      selectProject(projectElement, projectName);
    });
  }

  function selectProject(projectSelected, projectName) {
    const allProjects = document.querySelectorAll('.project');
    [...allProjects].forEach((project) => {
      if (project === projectSelected) {
        project.classList.add('selected');
      } else {
        project.classList.remove('selected');
      }
    });

    const projectTitle = document.querySelector('.tasks-title');
    projectTitle.textContent = projectName;

    index = projectSelected.dataset.id;
    homeUI.unselectHome();
    todayUI.unselectToday();
    tasks.innerHTML = '';
    pubsub.publish('selectProject', index);
  }

  function unselectProjects() {
    const allProjects = document.querySelectorAll('.project');
    allProjects.forEach((project) => {
      project.classList.remove('selected');
    });
  }

  function addDeleteEvent(button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectContainer = button.closest('.project');
      const deletedIndex = projectContainer.dataset.id;
      projectContainer.parentElement.removeChild(projectContainer);
      updateIndex();
      pubsub.publish('deleteProject', deletedIndex);

      const allProjects = document.querySelectorAll('.project');

      // Select the project above or below the deleted project or home (default when no existing project)
      let selectedProject = [...allProjects].find(
        (project) => project.dataset.id === `${deletedIndex - 1}`
      );
      if (!selectedProject)
        selectedProject = [...allProjects].find(
          (project) => project.dataset.id === `${deletedIndex}`
        );
      if (!selectedProject) {
        homeUI.selectHome();
      } else {
        const projectName =
          selectedProject.querySelector('.project-title').textContent;
        selectProject(selectedProject, projectName);
      }
    });
  }

  function updateIndex() {
    const projects = document.querySelectorAll('.project');
    projects.forEach((project, index) => {
      project.dataset.id = index + 1;
    });
  }

  return {
    addProject,
    unselectProjects,
  };
})();

export { initialPageLoad, addProjectEvents, todayUI };
