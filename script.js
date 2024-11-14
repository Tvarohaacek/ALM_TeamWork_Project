// Adjustable current date for task comparison
let currentDate = new Date();

class Member {
    constructor(name, role) {
        this.id = Date.now() + Math.random(); // Unique ID for each member
        this.name = name;
        this.role = role;
        this.isOverdue = false;
        this.messages = []; // Array for storing messages
    }

    markOverdue() {
        this.isOverdue = true;
    }

    clearOverdue() {
        this.isOverdue = false;
    }

    receiveMessage(message) {
        this.messages.push({
            text: message,
            timestamp: new Date(),
            read: false
        });
    }
}

class Task {
    constructor(title, description, dueDate, assignedMembers) {
        this.id = Date.now() + Math.random();
        this.title = title;
        this.description = description;
        this.dueDate = new Date(dueDate);
        this.assignedMembers = assignedMembers;
        this.isCompleted = false;
    }

    complete() {
        this.isCompleted = true;
    }

    isOverdue() {
        return currentDate > this.dueDate;
    }

    assignsToMember(memberId) {
        return this.assignedMembers.includes(memberId.toString());
    }
}

class TeamApp {
    constructor() {
        this.teamMembers = [];
        this.tasks = [];

        // DOM elements
        this.teamList = document.getElementById('team-list');
        this.taskList = document.getElementById('task-list');
        this.completedTaskList = document.getElementById('completed-task-list');
        this.currentDateDisplay = document.getElementById('current-date');
        this.memberCheckboxesContainer = document.getElementById('member-checkboxes');

        this.initializeEventListeners();
        this.updateDateDisplay();
        this.renderTeam();
        this.renderTasks();
    }

    initializeEventListeners() {
        document.getElementById('add-member-form').addEventListener('submit', (e) => this.addMember(e));
        document.getElementById('add-task-form').addEventListener('submit', (e) => this.addTask(e));
        document.getElementById('send-message').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    addMember(event) {
        event.preventDefault();
        const name = document.getElementById('member-name').value;
        const role = document.getElementById('member-role').value;

        const newMember = new Member(name, role);
        this.teamMembers.push(newMember);

        document.getElementById('member-name').value = '';
        this.renderTeam();
        this.populateMemberOptions();
        this.renderMemberCheckboxes();
    }

    renderTeam() {
        this.teamList.innerHTML = '';
        this.teamMembers.forEach(member => {
            const li = document.createElement('li');
            li.textContent = `${member.name} - ${member.role}`;
            li.style.color = member.isOverdue ? 'red' : 'black';

            // Add message count if there are any unread messages
            const unreadCount = member.messages.filter(msg => !msg.read).length;
            if (unreadCount > 0) {
                const msgCount = document.createElement('span');
                msgCount.textContent = ` (${unreadCount} new messages)`;
                msgCount.style.color = 'blue';
                li.appendChild(msgCount);
            }

            this.teamList.appendChild(li);
        });
    }

    addTask(event) {
        event.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const dueDate = document.getElementById('task-due-date').value;
        const assignedMembers = Array.from(document.getElementById('task-members').selectedOptions).map(option => option.value);

        const newTask = new Task(title, description, dueDate, assignedMembers);
        this.tasks.push(newTask);

        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';

        this.renderTasks();
    }

    populateMemberOptions() {
        const memberSelect = document.getElementById('task-members');
        memberSelect.innerHTML = '';
        this.teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
    }

    renderMemberCheckboxes() {
        this.memberCheckboxesContainer.innerHTML = '';

        this.teamMembers.forEach(member => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'member-checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `member-${member.id}`;
            checkbox.value = member.id;

            const label = document.createElement('label');
            label.htmlFor = `member-${member.id}`;
            label.textContent = member.name;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            this.memberCheckboxesContainer.appendChild(checkboxDiv);
        });
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        this.tasks.forEach(task => {
            if (!task.isCompleted) {
                const li = this.createTaskElement(task);
                this.taskList.appendChild(li);
            }
        });

        this.renderCompletedTasks();
        this.checkForOverdueTasks();
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        const assignedMembersNames = task.assignedMembers.map(memberId => {
            const member = this.teamMembers.find(m => m.id === parseFloat(memberId));
            return member ? member.name : '';
        }).join(', ');

        li.innerHTML = `
            <strong>${task.title}</strong>
            <p>${task.description}</p>
            <p>Due Date: ${this.formatDate(task.dueDate)}</p>
            <p><em>Assigned to: ${assignedMembersNames}</em></p>
            <button class="complete-btn" onclick="app.completeTask(${task.id})">Complete</button>
        `;

        if (task.isOverdue()) {
            li.classList.add('overdue');
        }

        return li;
    }

    renderCompletedTasks() {
        this.completedTaskList.innerHTML = '';
        this.tasks
            .filter(task => task.isCompleted)
            .forEach(task => {
                const li = document.createElement('li');
                const assignedMembersNames = task.assignedMembers.map(memberId => {
                    const member = this.teamMembers.find(m => m.id === parseFloat(memberId));
                    return member ? member.name : '';
                }).join(', ');
                li.innerHTML = `
                    <strong>${task.title}</strong>
                    <p>${task.description}</p>
                    <p><em>Assigned to: ${assignedMembersNames}</em></p>
                `;
                this.completedTaskList.appendChild(li);
            });
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.complete();

            task.assignedMembers.forEach(memberId => {
                const member = this.teamMembers.find(m => m.id === parseFloat(memberId));
                if (member) {
                    member.clearOverdue();
                    if (this.memberHasOverdueTasks(member.id)) {
                        member.markOverdue();
                    }
                }
            });

            this.renderTeam();
            this.renderTasks();
        }
    }

    memberHasOverdueTasks(memberId) {
        return this.tasks.some(task =>
            task.assignedMembers.includes(memberId.toString()) &&
            !task.isCompleted &&
            task.isOverdue()
        );
    }

    checkForOverdueTasks() {
        this.tasks.forEach(task => {
            if (!task.isCompleted && task.isOverdue()) {
                task.assignedMembers.forEach(memberId => {
                    const member = this.teamMembers.find(m => m.id === parseFloat(memberId));
                    if (member) member.markOverdue();
                });
            }
        });
        this.renderTeam();







        const selectedCheckboxes = this.memberCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedMembers = Array.from(selectedCheckboxes).map(checkbox => parseFloat(checkbox.value));

        // if (selectedMembers.length === 0) {
        //     alert('Please select at least one team member.');
        //     return;
        // }

        selectedMembers.forEach(memberId => {
            const member = this.teamMembers.find(m => m.id === memberId);
            if (member) {
                member.receiveMessage(messageText);
                console.log(`Message sent to ${member.name}:`, messageText);
            }
        });

        // Clear message input and uncheck all checkboxes
        document.getElementById('message_text').value = '';
        selectedCheckboxes.forEach(checkbox => checkbox.checked = false);

        // Update the team list to show new message counts
        this.renderTeam();
    }



    sendMessage() {
        const messageText = document.getElementById('message_text').value;
        if (!messageText) {
            alert('Please enter a message.');
            return;
        }

        // Získat všechny zaškrtnuté checkboxy
        const selectedCheckboxes = document.querySelectorAll('#member-checkboxes input[type="checkbox"]:checked');

        if (selectedCheckboxes.length === 0) {
            alert('Please select at least one team member.');
            return;
        }

        // Pro každý zaškrtnutý checkbox najít odpovídajícího člena a uložit zprávu
        selectedCheckboxes.forEach(checkbox => {
            const memberId = parseFloat(checkbox.value);
            const member = app.teamMembers.find(m => m.id === memberId);

            if (member) {
                // Uložení zprávy do pole člena
                member.messages.push({
                    text: messageText,
                    timestamp: new Date(),
                    read: false
                });
                console.log(`Message "${messageText}" saved for member ${member.name}`);
            }
        });

        // Vyčistit pole pro zprávu a odznačit checkboxy
        document.getElementById('message_text').value = '';
        selectedCheckboxes.forEach(checkbox => checkbox.checked = false);

        // Aktualizovat zobrazení týmu, aby se projevily nové zprávy
        app.renderTeam();
    }

    updateDateDisplay() {
        this.currentDateDisplay.textContent = this.formatDate(currentDate);
    }

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    adjustDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        this.updateDateDisplay();
        this.renderTasks();
    }


}

// Initialize the app and expose the date adjustment function globally
const app = new TeamApp();
window.adjustDate = (days) => app.adjustDate(days);

let sendMessageButton = document.getElementById('send-message-button');
sendMessageButton.onclick = app.sendMessage;
