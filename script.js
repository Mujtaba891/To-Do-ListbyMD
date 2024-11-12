
const taskList = document.getElementById('taskList');
const addIcon = document.getElementById('addIcon');
const inputSection = document.getElementById('inputSection');
const taskInput = document.getElementById('taskInput');
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const bellSound = document.getElementById('bellSound');
const clockElement = document.getElementById('clock');
let activeTimers = {};

// Show input section when add icon is clicked
addIcon.addEventListener('click', () => {
  inputSection.style.display = 'flex';
});

// Add task to the list
addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (taskText && totalSeconds > 0) {
    addTask(taskText, totalSeconds);
    taskInput.value = '';
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
    inputSection.style.display = 'none';
  } else {
    alert("Please enter a task and a valid timer duration.");
  }
});

function addTask(taskText, totalSeconds) {
  const taskId = Date.now();
  const taskItem = document.createElement('li');
  taskItem.classList.add('task-item');
  taskItem.setAttribute('data-id', taskId);

  const taskTextElement = document.createElement('span');
  taskTextElement.classList.add('task-text');
  taskTextElement.textContent = taskText;

  const timerDisplay = document.createElement('span');
  timerDisplay.classList.add('timer-display');
  timerDisplay.textContent = formatTime(totalSeconds);

  const stopBellBtn = document.createElement('button');
  stopBellBtn.textContent = 'Stop Bell';
  stopBellBtn.classList.add('stop-bell');
  stopBellBtn.style.display = 'none';
  stopBellBtn.addEventListener('click', () => stopBell(taskId));

  taskItem.appendChild(taskTextElement);
  taskItem.appendChild(timerDisplay);
  taskItem.appendChild(stopBellBtn);
  taskList.appendChild(taskItem);

  startTimer(taskId, totalSeconds, timerDisplay, stopBellBtn);
}

function startTimer(taskId, totalSeconds, display, stopBellBtn) {
  let secondsRemaining = totalSeconds;
  const interval = setInterval(() => {
    if (secondsRemaining > 0) {
      secondsRemaining--;
      display.textContent = formatTime(secondsRemaining);
    } else {
      clearInterval(interval);
      bellSound.play();
      stopBellBtn.style.display = 'inline';
      activeTimers[taskId] = interval;
    }
  }, 1000);

  activeTimers[taskId] = interval;
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function stopBell(taskId) {
  bellSound.pause();
  bellSound.currentTime = 0;
  removeTask(taskId);
}

function removeTask(taskId) {
  const taskItem = document.querySelector(`[data-id="${taskId}"]`);
  if (taskItem) taskList.removeChild(taskItem);
  clearInterval(activeTimers[taskId]);
  delete activeTimers[taskId];
}

function updateClock() {
  const now = new Date();
  clockElement.textContent = now.toLocaleTimeString();
}

setInterval(updateClock, 1000);

/*
// new
// Save timer state in local storage
function saveTimerState(taskId, endTime) {
  const timers = JSON.parse(localStorage.getItem('timers')) || [];
  timers.push({ taskId, endTime });
  localStorage.setItem('timers', JSON.stringify(timers));
}

// Start timer and save its state
function startTimer(seconds, timerElement, stopButton, taskId) {
  const endTime = Date.now() + seconds * 1000;
  saveTimerState(taskId, endTime);

  const interval = setInterval(() => {
    const remainingTime = Math.floor((endTime - Date.now()) / 1000);
    if (remainingTime <= 0) {
      clearInterval(interval);
      timerElement.textContent = "00:00:00";
      bellSound.play();
      // Remove timer from local storage
      removeTimerState(taskId);
    } else {
      const hrs = Math.floor(remainingTime / 3600);
      const mins = Math.floor((remainingTime % 3600) / 60);
      const secs = remainingTime % 60;
      timerElement.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }, 1000);

  // Stop button functionality
  stopButton.addEventListener('click', () => {
    bellSound.pause();
    bellSound.currentTime = 0;
    clearInterval(interval);
    removeTimerState(taskId);  // Remove from local storage
  });
}

// Remove timer state from local storage
function removeTimerState(taskId) {
  const timers = JSON.parse(localStorage.getItem('timers')) || [];
  const updatedTimers = timers.filter(timer => timer.taskId !== taskId);
  localStorage.setItem('timers', JSON.stringify(updatedTimers));
}


// Restore timers from local storage
function restoreTimers() {
  const timers = JSON.parse(localStorage.getItem('timers')) || [];
  timers.forEach(timer => {
    const remainingTime = Math.floor((timer.endTime - Date.now()) / 1000);
    if (remainingTime > 0) {
      // Restore the task with the remaining time
      const taskItem = document.createElement('li');
      taskItem.classList.add('task-item');
      taskItem.innerHTML = `
        <span class="task-text">Restored Task</span>
        <span class="timer-display" id="timer-${timer.taskId}">00:00:00</span>
        <button class="stop-bell" id="stop-${timer.taskId}">Stop Bell</button>
      `;
      taskList.appendChild(taskItem);
      startTimer(remainingTime, taskItem.querySelector(`#timer-${timer.taskId}`), taskItem.querySelector(`#stop-${timer.taskId}`), timer.taskId);
    } else {
      removeTimerState(timer.taskId); // Cleanup expired timers
    }
  });
}

window.addEventListener('load', restoreTimers);

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(registration => {
    console.log('Service Worker registered:', registration);
  }).catch(error => {
    console.error('Service Worker registration failed:', error);
  });
}

// Request notification permission
if (Notification.permission === "default") {
  Notification.requestPermission();
}
// Notify user when the timer ends
function notifyUser(title, message) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: message,
        icon: 'icon.png'
      });
    });
  }
} */