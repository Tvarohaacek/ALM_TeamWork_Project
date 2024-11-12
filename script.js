// Initial state
let teamMembers = [];
let tasks = [];
let currentDate = new Date(); // Adjustable date for comparison

// Adding team members
document.getElementById('add-member-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('member-name').value;
    const role = document.getElementById('member-role').value;

    const newMember = { id: Date.now(), name, role, isOverdue: false };
    teamMembers.push(newMember);

    document.getElementById('member-name').value = '';
    renderTeam();
    populateMemberOptions();
});

// Rendering team members with overdue status
function renderTeam() {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = '';
    teamMembers.forEach(member => {
        const li = document.createElement('li');
        li.textContent = `${member.name} - ${member.role}`;
        li.style.color = member.isOverdue ? 'red' : 'black';
        teamList.appendChild(li);
    });
}

// Populate the team members dropdown in the task form
function populateMemberOptions() {
    const memberSelect = document.getElementById('task-members');
    memberSelect.innerHTML = '';
    teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        memberSelect.appendChild(option);
    });
}

// Adding tasks with a due date
document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const dueDate = new Date(document.getElementById('task-due-date').value);
    const assignedMembers = Array.from(document.getElementById('task-members').selectedOptions).map(option => option.value);

    const newTask = { id: Date.now(), title, description, assignedMembers, dueDate, isCompleted: false };
    tasks.push(newTask);

    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    renderTasks();
});

// Rendering tasks
function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        if (!task.isCompleted) {
            const li = document.createElement('li');
            const assignedMembersNames = task.assignedMembers.map(memberId => {
                const member = teamMembers.find(member => member.id === parseInt(memberId));
                return member ? member.name : '';
            }).join(', ');
            li.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                <p>Due Date: ${task.dueDate.toLocaleDateString()}</p>
                <p><em>Assigned to: ${assignedMembersNames}</em></p>
                <button class="complete-btn" onclick="completeTask(${task.id})">Complete</button>
            `;
            taskList.appendChild(li);
        }
    });
    renderCompletedTasks();
    checkForOverdueTasks();
}

// Marking tasks as complete
function completeTask(taskId) {
    tasks = tasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: true } : task
    );

    const completedTask = tasks.find(task => task.id === taskId);
    if (completedTask) {
        completedTask.assignedMembers.forEach(memberId => {
            const memberHasOtherOverdueTasks = tasks.some(task =>
                task.assignedMembers.includes(memberId) &&
                !task.isCompleted &&
                task.dueDate < currentDate
            );

            if (!memberHasOtherOverdueTasks) {
                const member = teamMembers.find(m => m.id === parseInt(memberId));
                if (member) {
                    member.isOverdue = false;
                }
            }
        });
    }

    renderTasks();
}

// Rendering completed tasks
function renderCompletedTasks() {
    const completedTaskList = document.getElementById('completed-task-list');
    completedTaskList.innerHTML = '';
    tasks
        .filter(task => task.isCompleted)
        .forEach(task => {
            const li = document.createElement('li');
            const assignedMembersNames = task.assignedMembers.map(memberId => {
                const member = teamMembers.find(member => member.id === parseInt(memberId));
                return member ? member.name : '';
            }).join(', ');
            li.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                <p><em>Assigned to: ${assignedMembersNames}</em></p>
            `;
            completedTaskList.appendChild(li);
        });
}

// Check for overdue tasks based on adjustable currentDate
function checkForOverdueTasks() {
    tasks.forEach(task => {
        if (!task.isCompleted && task.dueDate < currentDate) {
            task.assignedMembers.forEach(memberId => {
                const member = teamMembers.find(m => m.id === parseInt(memberId));
                if (member) {
                    member.isOverdue = true;
                }
            });
        }
    });
    renderTeam();
}

// Update displayed adjustable date
function updateDateDisplay() {
    document.getElementById('current-date').textContent = formatDate(currentDate);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}. ${year}`;
}

function adjustDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    renderTasks();
}

// Initial render
updateDateDisplay();
renderTeam();
populateMemberOptions();
renderTasks();
