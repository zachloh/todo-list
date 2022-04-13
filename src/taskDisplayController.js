import { createElement } from './createElement';
import { pubsub } from './pubsub';
import More from './assets/images/more.svg';
import Edit from './assets/images/edit.svg';
import Delete from './assets/images/delete.svg';
import { format, parseISO } from 'date-fns';

const addTaskBtn = document.querySelector('.add-task');
const overlay = document.querySelector('#overlay');
const closeModalBtns = document.querySelectorAll('.close-modal');
const tasks = document.querySelector('.tasks');

// Handle opening and closing of modals
function addModalEvents() {
  addTaskBtn.addEventListener('click', () => {
    const modal = document.querySelector('.add-task-modal');
    openModal(modal);
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  overlay.addEventListener('click', () => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach((modal) => {
      closeModal(modal);
    });
  });
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

function addTaskFormSubmitEvents() {
  addTaskForm.formSubmitEvent();
  editTaskForm.formSubmitEvent();
}

// 'Add Task' form module
const addTaskForm = (function () {
  const form = document.querySelector('.add-task-modal form');
  const taskTitle = document.querySelector('.add-task-modal input[type=text]');
  const taskDescription = document.querySelector('.add-task-modal textarea');
  const taskDueDate = document.querySelector(
    '.add-task-modal input[type=date]'
  );
  const taskPriority = document.querySelectorAll(
    '.add-task-modal input[name="priority"]'
  );

  function formSubmitEvent() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const priority = [...taskPriority].find((input) => input.checked).value;
      const task = {
        title: taskTitle.value,
        description: taskDescription.value,
        dueDate: taskDueDate.value,
        priority: priority,
      };
      const modal = document.querySelector('.add-task-modal');

      if (isValid(taskTitle.value)) {
        closeModal(modal);
        resetForm();
        taskUI.addTask(task);
        pubsub.publish('addTask', task);
      } else {
        alert('This task title already exists');
      }
    });
  }

  function isValid(name) {
    const currentTaskNames = document.querySelectorAll('.tasks label');
    return ![...currentTaskNames].some(
      (taskName) => taskName.textContent === name
    );
  }

  function resetForm() {
    taskTitle.value = '';
    taskDescription.value = '';
    taskDueDate.value = '';
    taskPriority[0].checked = true;
  }

  return {
    formSubmitEvent,
  };
})();

// 'Edit Task' form module
const editTaskForm = (function () {
  const form = document.querySelector('.edit-task-modal form');
  const title = document.querySelector('.edit-task-modal input[type=text]');
  const description = document.querySelector('.edit-task-modal textarea');
  const dueDate = document.querySelector('.edit-task-modal input[type=date]');
  const priority = document.querySelectorAll(
    '.edit-task-modal input[name="priority"]'
  );

  function formSubmitEvent() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const priorityValue = [...priority].find((input) => input.checked).value;
      const task = {
        title: title.value,
        description: description.value,
        dueDate: dueDate.value,
        priority: priorityValue,
      };
      const modal = document.querySelector('.edit-task-modal');

      // Get a list of all the existing task names, but filter out the name of the current edited task name
      const allTasks = document.querySelectorAll('.task');
      const filteredTasks = [...allTasks].filter(
        (task) => task.dataset.index !== taskUI.getIndex()
      );

      if (isValid(task.title, filteredTasks)) {
        closeModal(modal);
        taskUI.editTask(task);
      } else {
        alert('This task title already exists');
      }
    });
  }

  function isValid(name, tasks) {
    const taskNames = tasks.map((task) => {
      const taskName = task.querySelector('label').textContent;
      return taskName;
    });
    return !taskNames.some((taskName) => taskName === name);
  }

  function prefillForm(task) {
    title.value = task.title;
    description.value = task.description;
    dueDate.value = task.dueDate;
    if (task.priority === 'low') {
      priority[0].checked = true;
    } else if (task.priority === 'medium') {
      priority[1].checked = true;
    } else {
      priority[2].checked = true;
    }
  }

  return {
    formSubmitEvent,
    prefillForm,
  };
})();

// Task UI module
const taskUI = (function () {
  let index;

  function render(tasksToRender) {
    tasksToRender.forEach((task) => {
      addTask(task);
    });
  }

  function addTask(task) {
    let taskCounter = tasks.childElementCount;

    const taskContainer = createElement('div', ['task'], {
      'data-index': taskCounter,
    });
    tasks.appendChild(taskContainer);

    const checkbox = createElement('input', [], {
      type: 'checkbox',
      id: `task-${taskCounter}`,
    });
    taskContainer.appendChild(checkbox);

    const label = createElement('label', [], { for: `task-${taskCounter}` });
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
    viewMoreIcon.src = More;
    viewMoreIcon.alt = 'view more icon';
    viewMoreIconContainer.appendChild(viewMoreIcon);

    const editIconContainer = createElement('div', ['tooltip'], {
      'data-tooltip': 'Edit',
    });
    options.appendChild(editIconContainer);

    const editIcon = document.createElement('img');
    editIcon.src = Edit;
    editIcon.alt = 'edit icon';
    editIconContainer.appendChild(editIcon);

    const deleteIconContainer = createElement('div', ['tooltip'], {
      'data-tooltip': 'Delete',
    });
    options.appendChild(deleteIconContainer);

    const deleteIcon = document.createElement('img');
    deleteIcon.src = Delete;
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

      const index = checkbox.closest('.task').dataset.index;
      pubsub.publish('updateIsChecked', { index, isChecked: checkbox.checked });
    });
  }

  function addTogglePriorityEvent(element) {
    element.addEventListener('click', () => {
      let priority;
      const index = element.closest('.task').dataset.index;
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

      pubsub.publish(
        'updateTaskPriority',
        Object.assign({}, { index }, { priority })
      );
    });
  }

  function addEditEvent(button) {
    button.addEventListener('click', () => {
      const modal = document.querySelector('.edit-task-modal');
      index = button.closest('.task').dataset.index;
      pubsub.publish('openEditTaskModal', index);
      openModal(modal);
    });
  }

  function addViewMoreEvent(button) {
    button.addEventListener('click', () => {
      const modal = document.querySelector('.task-details-modal');
      const index = button.closest('.task').dataset.index;
      pubsub.publish('openTaskDetailsModal', index);
      openModal(modal);
    });
  }

  function fillViewMoreModal(task) {
    const taskTitle = document.querySelector(
      '.task-details-modal .task-title-content'
    );
    const taskDescription = document.querySelector(
      '.task-details-modal .task-description-content'
    );

    taskTitle.textContent = task.title;
    taskDescription.textContent = task.description;
  }

  function editTask(task) {
    const taskContainers = document.querySelectorAll('.task');
    const taskContainer = [...taskContainers].find(
      (element) => element.dataset.index === index
    );

    const taskTitle = taskContainer.querySelector('label');
    taskTitle.textContent = task.title;

    const taskPriority = taskContainer.querySelector('.tooltip');
    taskPriority.classList.value = '';
    taskPriority.classList.add('tooltip');
    setPriority(task.priority, taskPriority);

    const taskDate = taskContainer.querySelector('.due-date');
    taskDate.textContent = format(parseISO(task.dueDate), 'dd/MM/yyyy');

    pubsub.publish('updateTask', Object.assign({}, task, { index }));
  }

  function addDeleteEvent(button) {
    button.addEventListener('click', () => {
      const taskContainer = button.closest('.task');
      const index = taskContainer.dataset.index;
      taskContainer.parentElement.removeChild(taskContainer);
      updateIndex();
      pubsub.publish('deleteTask', index);
    });
  }

  function updateIndex() {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach((task, index) => {
      task.dataset.index = index;
    });
  }

  function getIndex() {
    return index;
  }

  return {
    render,
    addTask,
    editTask,
    fillViewMoreModal,
    getIndex,
  };
})();

export { addModalEvents, addTaskFormSubmitEvents, editTaskForm, taskUI };
