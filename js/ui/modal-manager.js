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
        
        App.editingId = null;
        modal.classList.add('active');
        
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
     * Update duration display
     */
    updateDurationDisplay() {
        const startTime = document.getElementById('taskStartTime').value;
        const endTime = document.getElementById('taskEndTime').value;
        
        if (startTime && endTime) {
            const duration = Helpers.calculateDuration(startTime, endTime);
            document.getElementById('durationDisplay').textContent = 
                Helpers.formatDuration(duration);
        } else {
            document.getElementById('durationDisplay').textContent = '0h 0m';
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
        
        if (App.editingId) {
            EntryManager.updateEntry(App.editingId, formData);
        } else {
            EntryManager.addEntry(formData);
        }
        
        this.closeModal();
    }
};

window.ModalManager = ModalManager;
