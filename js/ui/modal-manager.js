/**
 * Task Entry Modal Manager
 * Handles the add/edit task modal
 */
const ModalManager = {
    /**
     * Open modal for adding new task
     */
    openAddModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');

        form.reset();
        document.getElementById('taskDate').valueAsDate = new Date();
        document.getElementById('modalTitle').textContent = 'Add Task';

        // Populate recent titles
        const recentTitles = JSON.parse(localStorage.getItem('recentTitles') || '[]');
        const titleInput = document.getElementById('taskTitle');
        titleInput.setAttribute('list', 'recentTitlesList');

        let dataList = document.getElementById('recentTitlesList');
        if (!dataList) {
            dataList = document.createElement('datalist');
            dataList.id = 'recentTitlesList';
            document.body.appendChild(dataList);
        }

        dataList.innerHTML = recentTitles.map(title => `<option value="${title}"></option>`).join('');

        modal.classList.add('active');

        // Delay accessing elements to ensure they are rendered
        setTimeout(() => {
            const taskStartTime = document.getElementById('taskStartTime');
            const taskEndTime = document.getElementById('taskEndTime');
            const durationDisplay = document.getElementById('durationDisplay');

            if (!taskStartTime) {
                console.error('Element with id "taskStartTime" not found in the DOM.');
            }

            if (!taskEndTime) {
                console.error('Element with id "taskEndTime" not found in the DOM.');
            }

            if (!taskStartTime || !taskEndTime) {
                return; // Exit early if elements are missing
            }

            // Set default start time to current time rounded to nearest 5 minutes
            const now = new Date();
            now.setSeconds(0, 0);
            const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
            now.setMinutes(roundedMinutes);
            const startTime = now.toTimeString().slice(0, 5);
            taskStartTime.value = startTime;

            // Set default end time to 30 minutes after start time
            now.setMinutes(now.getMinutes() + 30);
            const endTime = now.toTimeString().slice(0, 5);
            taskEndTime.value = endTime;

            // Update duration display based on start and end time
            this.updateDurationDisplay();

            // Update duration when start or end time changes
            taskStartTime.addEventListener('change', () => {
                this.updateDurationDisplay();
            });

            taskEndTime.addEventListener('input', () => {
                this.updateDurationDisplay();
            });

            // Update end time when duration changes
            durationDisplay.addEventListener('input', () => {
                const startTime = taskStartTime.value;
                const duration = durationDisplay.value;

                if (startTime && duration) {
                    const [hours, minutes] = duration.split(':').map(Number);
                    const totalMinutes = hours * 60 + minutes;

                    const [startHour, startMinute] = startTime.split(':').map(Number);
                    const startDate = new Date();
                    startDate.setHours(startHour, startMinute, 0, 0);

                    const endDate = new Date(startDate.getTime() + totalMinutes * 60000);
                    const endTime = endDate.toTimeString().slice(0, 5);
                    taskEndTime.value = endTime;
                }
            });
        }, 0);

        App.editingId = null;

        UIRenderer.updateTypeDropdown();
    },

    /**
     * Open modal for editing existing task
     */
    openEditModal(id) {
        const entry = App.data.entries.find(e => e.id === id);
        if (!entry) return;

        const modal = document.getElementById('taskModal');

        document.getElementById('taskTitle').value = entry.title;
        document.getElementById('taskType').value = entry.typeId;
        document.getElementById('taskDate').value = entry.date;
        document.getElementById('taskStartTime').value = entry.startTime;
        document.getElementById('taskEndTime').value = entry.endTime;

        this.updateDurationDisplay();
        document.getElementById('modalTitle').textContent = 'Edit Task';

        App.editingId = id;
        modal.classList.add('active');
    },

    /**
     * Close the modal
     */
    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        App.editingId = null;
    },

    /**
     * Update duration display and allow manual editing
     */
    updateDurationDisplay() {
        const startTime = document.getElementById('taskStartTime').value;
        const endTime = document.getElementById('taskEndTime').value;
        const durationDisplay = document.getElementById('durationDisplay');

        if (!durationDisplay) {
            console.error('Element with id "durationDisplay" not found in the DOM.');
            return; // Exit early if the element is missing
        }

        if (startTime && endTime) {
            const duration = Helpers.calculateDuration(startTime, endTime);
            const hours = Math.floor(duration / 60).toString().padStart(2, '0');
            const minutes = (duration % 60).toString().padStart(2, '0');
            durationDisplay.value = `${hours}:${minutes}`; // Update duration display in hh:mm format
        } else {
            durationDisplay.value = '00:00';
        }

        // Ensure duration input is validated and formatted
        durationDisplay.addEventListener('input', () => {
            const startTime = document.getElementById('taskStartTime').value;
            const duration = durationDisplay.value;

            if (startTime && duration) {
                const [hours, minutes] = duration.split(':').map(Number);
                const totalMinutes = hours * 60 + minutes;

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const startDate = new Date();
                startDate.setHours(startHour, startMinute, 0, 0);

                const endDate = new Date(startDate.getTime() + totalMinutes * 60000);
                const endTime = endDate.toTimeString().slice(0, 5);
                document.getElementById('taskEndTime').value = endTime;
            }
        });
    },

    /**
     * Handle duration input changes
     */
    handleDurationChange() {
        const startTime = document.getElementById('taskStartTime').value;
        const durationInput = document.getElementById('durationInput');
        const duration = parseInt(durationInput.value, 10);

        if (startTime && !isNaN(duration)) {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(startHour, startMinute, 0, 0);

            const endDate = new Date(startDate.getTime() + duration * 60000); // Add duration in milliseconds
            const endTime = endDate.toTimeString().slice(0, 5);
            document.getElementById('taskEndTime').value = endTime;

            this.updateDurationDisplay();
        }
    },

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('taskTitle').value,
            typeId: document.getElementById('taskType').value,
            date: document.getElementById('taskDate').value,
            startTime: document.getElementById('taskStartTime').value,
            endTime: document.getElementById('taskEndTime').value
        };

        if (!formData.typeId) {
            alert('Please select a type!');
            return;
        }

        const duration = Helpers.calculateDuration(formData.startTime, formData.endTime);
        if (duration <= 0) {
            alert('End time must be after start time!');
            return;
        }

        // Save recent titles
        const recentTitles = JSON.parse(localStorage.getItem('recentTitles') || '[]');
        const titleIndex = recentTitles.indexOf(formData.title);
        if (titleIndex !== -1) {
            recentTitles.splice(titleIndex, 1); // Remove existing title
        }
        recentTitles.unshift(formData.title); // Add to the top
        if (recentTitles.length > 10) {
            recentTitles.pop(); // Limit to 10 titles
        }
        localStorage.setItem('recentTitles', JSON.stringify(recentTitles));

        if (App.editingId) {
            EntryManager.updateEntry(App.editingId, formData);
        } else {
            EntryManager.addEntry(formData);
        }

        this.closeModal();
    }
};

window.ModalManager = ModalManager;
