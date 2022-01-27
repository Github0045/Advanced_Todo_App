// Quering The Dom
const tasksBoxEl = document.querySelector('.tasks-box');
const taskHeading = document.querySelector('.tasks-box header h2');
const listOfLists = document.querySelector('.lists-box .lists');
const listOfTasks = document.querySelector('.tasks-box .tasks');
const addListsForm = document.getElementById('addLists');
const addTasksForm = document.getElementById('addTasks');
const clearCompleteBtn = document.getElementById('clearComplete');
const deleteListBtn = document.getElementById('deleteList');

// Helping Variables
let mainArr = [];
let currListIdx;
let activeList = false;

// Get The Data From LocalStorage
let getStorage = localStorage.getItem('advanced_tasks_app');
if (getStorage) mainArr = JSON.parse(getStorage);
updateListsDom();

// "addListsForm" Listen To Submit Event
addListsForm.addEventListener('submit', e => {
  // Prevent The Default Action
  e.preventDefault();
  // Create The List Data Object
  let val = e.target.listsInput.value;
  if (val) {
    let obj = {
      id: Math.random().toString(36).substr(2, 8),
      listName: val,
      tasksArr: []
    };
    // Pushing The Data To "mainArr"
    mainArr.push(obj);
  }
  // Reseting The Input Feild
  e.target.listsInput.value = '';
  // Calling Functions
  updateListsDom();
});

// "addTasksForm" Listen To Submit Event
addTasksForm.addEventListener('submit', e => {
  // Prevent The Default Action
  e.preventDefault();
  // Create The Task Data Object
  let val = e.target.tasksInput.value;
  if (val) {
    let obj = {
      id: Math.random().toString(36).substr(2, 6),
      task: val,
      completed: false
    };
    // Reseting The Input Feild
    e.target.tasksInput.value = '';
    // Pushing The Data To A List From "mainArr"
    mainArr[currListIdx].tasksArr.push(obj);
    // Calling Functions
    updateTasksDom();
  }
});

// Update List Dom
function updateListsDom() {
  // Clear The List Before Adding The Data
  listOfLists.textContent = '';
  // Looping Throw The Data
  mainArr.forEach(item => {
    // Create HTML Template
    let html = `<li data-id="${item.id}">${item.listName}</li>`;
    // Appending The HTML Template
    listOfLists.innerHTML += html;
    // "active" Class Toggling ==> Fix A Bug
    if (mainArr[currListIdx]) {
      listOfLists.querySelectorAll('li').forEach(el => {
        if (el.dataset.id === mainArr[currListIdx].id) el.classList = activeList ? 'active' : '';
      })
    }
  });
  // No Data Message
  if (!listOfLists.querySelectorAll('li').length) listOfLists.innerHTML = `<div class="msg">You Have No Lists</div>`;
  // Calling Functions
  saveData();
  counter(listOfLists, 'Lists');
}

// Update Tasks Dom
function updateTasksDom() {
  // Update The Heading
  taskHeading.textContent = mainArr[currListIdx].listName;
  // Clear The List Before Adding The Data
  listOfTasks.textContent = '';
  // Looping Throw The Data
  mainArr[currListIdx].tasksArr.forEach(item => {
    // Create HTML Template
    let html = `
      <li data-id="${item.id}">
        <input type="checkbox" ${item.completed ? 'checked' : ''}>
        <span>${item.task}</span>
        <i class="fas fa-edit"></i>
      </li>
    `;
    // Appending The HTML Template
    listOfTasks.innerHTML += html;
  });
  // No Data Message
  if (!listOfTasks.querySelectorAll('li').length) listOfTasks.innerHTML = `<div class="msg">You Have No Tasks</div>`;
  // Calling Functions
  saveData();
  counter(listOfTasks, 'Tasks');
}

// Target The Edit Icon
listOfTasks.addEventListener('click', e => {
  if (e.target.classList.contains('fas', 'fa-edit')) {
    createEditFeild(e);
  }
});

// Create The Edit Input Function
function createEditFeild(e) {
  // Helping Variables
  const parent = e.target.parentElement;
  const val = parent.querySelector('span').textContent;
  const inputEl = document.createElement('input');
  // Setting Attributes
  inputEl.classList = 'edit-input';
  inputEl.type = 'text';
  inputEl.value = val;
  // Removing The Children
  [...parent.children].forEach(el => el.remove());
  // Appending The Input To The "parent"
  parent.appendChild(inputEl);
  inputEl.select();
  window.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
      // Update The "mainArr"
      mainArr[currListIdx].tasksArr[mainArr[currListIdx].tasksArr.findIndex(item => item.id === parent.dataset.id)].task = inputEl.value;
      // Update The LocalStorage
      saveData();
      // Update The Dom
      updateTasksDom();
    }
  });
  // Remove The Edit Input Function
  inputEl.addEventListener('blur', () => updateTasksDom());
}



// "listOfLists" Listen To Click Event
listOfLists.addEventListener('click', e => {
  // Check If Target Element If A ListItem
  if (e.target.tagName === 'LI') {
    // Toggle "active" Class
    if (!e.target.classList.contains('active')) {
      [...listOfLists.children].forEach(el => el.classList.remove('active'));
      e.target.classList.add('active');
    } else e.target.classList.remove('active');
    // Get The "currListIdx"
    currListIdx = mainArr.findIndex(item => item.id === e.target.dataset.id);
    // Active Numbers
    if (listOfLists.querySelectorAll('li.active').length) {
      activeList = true;
    } else activeList = false;
    // Hide And Show "listOfTasks"
    tasksBoxEl.classList = `tasks-box ${listOfLists.querySelectorAll('.active').length ? '' : 'hide'}`;
    // Focus On Task Input
    addTasksForm.tasksInput.focus();
    // Calling Functions
    updateTasksDom();
  }
});

// "listOfTasks" Listen To Click Event
listOfTasks.addEventListener('click', e => {
  // Check If Target Element If A ListItem
  if (e.target.tagName === 'LI') {
    // Click CheckBox
    let checkbox = e.target.querySelector('input[type="checkbox"]');
    // Check If There Is A Checkbox
    if (checkbox) {
      checkbox.click()
      // Get The Current Tasks Arr
      let currTasksArr = mainArr[currListIdx].tasksArr;
      currTasksArr[currTasksArr.findIndex(item => item.id === e.target.dataset.id)].completed = checkbox.checked;
    };
    // Update The LocalStorage
    saveData();
  }
});

// "listOfTasks" Listen To Contextmenu Event
listOfTasks.addEventListener('contextmenu', e => {
  // Check If Target Element If A ListItem
  if (e.target.tagName === 'LI') {
    // Prevent The Default Action
    e.preventDefault();
    // Get The Current Tasks Arr
    let currTasksArr = mainArr[currListIdx].tasksArr.filter(item => item.id !== e.target.dataset.id);
    mainArr[currListIdx].tasksArr = currTasksArr;
    // Calling Functions
    updateTasksDom();
  }
});

// "clearCompleteBtn" Listen To Click Event
clearCompleteBtn.addEventListener('click', () => {
  let filteredTasksArr = mainArr[currListIdx].tasksArr.filter(item => !item.completed);
  mainArr[currListIdx].tasksArr = filteredTasksArr;
  // Calling Functions
  updateTasksDom();
});

// "deleteListBtn" Listen To Click Event
deleteListBtn.addEventListener('click', () => {
  mainArr = mainArr.filter(item => item.id !== mainArr[currListIdx].id);
  // Hide The Tasks List
  tasksBoxEl.classList.add('hide');
  // Remove Actives From "listOfLists" Children
  [...listOfLists.children].forEach(el => el.classList.remove('active'));
  activeList = false;
  // Calling Functions
  updateListsDom();
});

// Count Lists And Tasks
function counter(el, word) {
  el.parentElement.querySelector('header .num').textContent = `${el.querySelectorAll('li').length} ${word}`;
}

// Saving Data To LocalStorage
function saveData() {
  localStorage.setItem('advanced_tasks_app', JSON.stringify(mainArr));
}