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
        document.getElementById('offDayStartDate').value = '';
        document.getElementById('offDayEndDate').value = '';
        document.getElementById('modalTitle').textContent = 'Add Task';
        
        // Reset Off Day state
        const isOffDayCheckbox = document.getElementById('taskIsOffDay');
        if (isOffDayCheckbox) {
            isOffDayCheckbox.checked = false;
            this.handleOffDayToggle(false);
            
            // Add listener if not already added (simple check to avoid duplicate listeners conceptually, though pure JS might stack them if not careful. Ideally, setup listeners once in setup() or remove them.)
            // For now, simpler to re-attach or ensure idempotency. 
            // Better strategy: The event listener should be set up in EventListeners.js or once here. 
            // Let's attach it here but remove old one if possible? No, EventListeners.js is better place for static elements.
            // But since I'm here, I will attach it and use `onclick` to prevent stacking, or check current implementation.
            isOffDayCheckbox.onclick = (e) => this.handleOffDayToggle(e.target.checked);
        }

        // Set button text to "Add"
        document.getElementById('submitBtn').textContent = 'Add';

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
        document.getElementById('taskDate').value = entry.date;
        document.getElementById('taskStartTime').value = entry.startTime;
        document.getElementById('taskEndTime').value = entry.endTime;
        
        // Handle Off Day state
        const isOffDayCheckbox = document.getElementById('taskIsOffDay');
        if (isOffDayCheckbox) {
            const isOffDay = entry.isOffDay || false;
            isOffDayCheckbox.checked = isOffDay;
            this.handleOffDayToggle(isOffDay);
            isOffDayCheckbox.onclick = (e) => this.handleOffDayToggle(e.target.checked);
        }

        // Update task type dropdown
        const taskTypeDropdown = document.getElementById('taskType');
        const trigger = taskTypeDropdown.querySelector('.custom-select-trigger .selected-text');
        const colorPreview = taskTypeDropdown.querySelector('.custom-select-trigger .color-preview');
        const options = taskTypeDropdown.querySelectorAll('.custom-option');

        options.forEach(option => {
            if (option.dataset.value === entry.typeId) {
                option.classList.add('selected');
                trigger.textContent = option.querySelector('.option-text').textContent;
                if (colorPreview) {
                    const selectedType = App.data.types.find(t => t.id === entry.typeId);
                    colorPreview.style.backgroundColor = selectedType ? selectedType.color : 'transparent';
                }
            } else {
                option.classList.remove('selected');
            }
        });

        this.updateDurationDisplay();
        document.getElementById('modalTitle').textContent = 'Edit Task';

        // Set button text to "Save"
        document.getElementById('submitBtn').textContent = 'Save';

        App.editingId = id;
        modal.classList.add('active');
    },

    /**
     * Handle Off Day toggle
     */
    handleOffDayToggle(isOffDay) {
        const regularFields = document.getElementById('regularTaskFields');
        const titleInput = document.getElementById('taskTitle');
        const singleDateGroup = document.getElementById('singleDateGroup');
        const rangeDateGroup = document.getElementById('rangeDateGroup');
        const typeSelect = document.getElementById('taskType');
        const startTimeInput = document.getElementById('taskStartTime');
        const endTimeInput = document.getElementById('taskEndTime');
        const durationDisplay = document.getElementById('durationDisplay');
        const isEditing = !!App.editingId; // Check if we are in edit mode
        
        if (isOffDay) {
            // Hide regular title field
            if (regularFields) regularFields.style.display = 'none';
            if (titleInput) titleInput.required = false;

            // Disable Type Selection
            typeSelect.classList.add('disabled');
            typeSelect.style.pointerEvents = 'none';
            typeSelect.style.opacity = '0.6';
            
            // Set 00:00 - 00:00 & Disable
            startTimeInput.value = '00:00';
            startTimeInput.disabled = true;
            endTimeInput.value = '00:00';
            endTimeInput.disabled = true;
            if (durationDisplay) {
                durationDisplay.value = '00:00';
                durationDisplay.disabled = true;
            }

            // Visual update for dropdown trigger
            const trigger = typeSelect.querySelector('.custom-select-trigger .selected-text');
            const colorPreview = typeSelect.querySelector('.custom-select-trigger .color-preview');
            if (trigger) trigger.textContent = 'Off Day';
            if (colorPreview) colorPreview.style.backgroundColor = '#cccccc';

            // Date Input Logic: Range vs Single
            if (isEditing) {
                // Edit Mode: Keep single date
                if (singleDateGroup) singleDateGroup.style.display = 'block';
                if (rangeDateGroup) rangeDateGroup.style.display = 'none';
                
                document.getElementById('taskDate').required = true;
                document.getElementById('offDayStartDate').required = false;
                document.getElementById('offDayEndDate').required = false;
            } else {
                // Add Mode: Use Range
                if (singleDateGroup) singleDateGroup.style.display = 'none';
                if (rangeDateGroup) rangeDateGroup.style.display = 'flex';
                
                document.getElementById('taskDate').required = false;
                document.getElementById('offDayStartDate').required = true;
                document.getElementById('offDayEndDate').required = true;
            }

        } else {
            // Show regular fields
            if (regularFields) regularFields.style.display = 'block';
            if (titleInput) titleInput.required = true;
            
            // Enable Inputs
            typeSelect.classList.remove('disabled');
            typeSelect.style.pointerEvents = 'auto';
            typeSelect.style.opacity = '1';
            
            // Restore Type Dropdown
            UIRenderer.updateTypeDropdown();

            startTimeInput.disabled = false;
            endTimeInput.disabled = false;
            
            if (durationDisplay) {
                durationDisplay.disabled = false;
                this.updateDurationDisplay();
            }

            // Reset Date Inputs to Single
            if (singleDateGroup) singleDateGroup.style.display = 'block';
            if (rangeDateGroup) rangeDateGroup.style.display = 'none';

            document.getElementById('taskDate').required = true;
            document.getElementById('offDayStartDate').required = false;
            document.getElementById('offDayEndDate').required = false;
        }
    },

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const isOffDay = document.getElementById('taskIsOffDay').checked;
        // Use system off day type ID if isOffDay is true
        const typeId = isOffDay ? App.SYSTEM_OFF_DAY_TYPE_ID : App.editingTaskTypeId;
        
        // Validation for normal entries
        if (!isOffDay && !typeId) {
            alert('Please select a type');
            return;
        }

        const titleInput = document.getElementById('taskTitle');
        const titleValue = (isOffDay) ? 'Off Day' : titleInput.value;

        // Base data structure
        const baseData = {
            title: titleValue,
            typeId: typeId,
            startTime: isOffDay ? '00:00' : document.getElementById('taskStartTime').value,
            endTime: isOffDay ? '00:00' : document.getElementById('taskEndTime').value,
            isOffDay: isOffDay
        };
        
        if (App.editingId) {
            // Edit Mode: Single Entry Update
            // When editing, we stick to the single date input
            const taskDate = document.getElementById('taskDate').value;
            const formData = { ...baseData, date: taskDate };
            // If editing an off-day range, we should preserve endDate but editing logic needs review
            // For now, editing assumes single entry. If user edits a range, it converts to single.
            EntryManager.updateEntry(App.editingId, formData);
        } else {
            // Add Mode
            if (isOffDay) {
                // Check if we are using the range inputs
                const startStr = document.getElementById('offDayStartDate').value;
                const endStr = document.getElementById('offDayEndDate').value;
                
                if (startStr && endStr) {
                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);
                    
                    if (startDate > endDate) {
                        alert('Start date must be before end date');
                        return;
                    }
                    
                    // Create ONE entry representing the range
                    EntryManager.addEntry({
                        ...baseData,
                        date: startStr,
                        endDate: endStr
                    });
                } else {
                    // Fallback or validation error. Required fields should catch this.
                    // If user didn't pick range, try single regular date field (if UI broke)
                     EntryManager.addEntry({
                        ...baseData,
                        date: document.getElementById('taskDate').value
                    });
                }
            } else {
                // Normal Single Entry
                EntryManager.addEntry({
                    ...baseData,
                    date: document.getElementById('taskDate').value
                });
            }
        }
        
        // Save recent title if not off-day
        if (!isOffDay && baseData.title) {
            const recentTitles = JSON.parse(localStorage.getItem('recentTitles') || '[]');
            if (!recentTitles.includes(baseData.title)) {
                recentTitles.unshift(baseData.title);
                if (recentTitles.length > 50) recentTitles.pop();
                localStorage.setItem('recentTitles', JSON.stringify(recentTitles));
            }
        }
        
        this.closeModal();
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
        // durationInput seems to not exist in previous code or usage? 
        // In lines 1-150 I saw durationDisplay being used.
        // But this method 'handleDurationChange' is also looking suspicious like leftover code.
        // However, I should focus on removing the Duplicate handleFormSubmit first.
        const duration = parseInt(durationInput?.value || '0', 10);

        if (startTime && !isNaN(duration)) {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(startHour, startMinute, 0, 0);

            const endDate = new Date(startDate.getTime() + duration * 60000); // Add duration in milliseconds
            const endTime = endDate.toTimeString().slice(0, 5);
            document.getElementById('taskEndTime').value = endTime;

            this.updateDurationDisplay();
        }
    }
};

window.ModalManager = ModalManager;
