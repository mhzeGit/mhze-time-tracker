/**
 * Event Listeners Setup
 * Sets up all DOM event listeners for the application
 */
const EventListeners = {
    /**
     * Setup all event listeners
     */
    setup() {
        this.setupTopBarButtons();
        this.setupFilterToggle();
        this.setupFilterControls();
        this.setupSortableHeaders();
        this.setupTaskModal();
        this.setupTypeModal();
        this.setupViewSwitcher();
        this.setupWindowResize();
    },

    /**
     * Setup filter section toggle
     */
    setupFilterToggle() {
        const filtersHeader = document.getElementById('filtersHeader');
        const filtersSection = filtersHeader.closest('.filters-section');
        const filtersToggleBtn = document.getElementById('filtersToggleBtn');

        // Initialize as collapsed
        filtersSection.classList.add('collapsed');

        // Toggle on header click
        filtersHeader.addEventListener('click', () => {
            filtersSection.classList.toggle('collapsed');
        });

        // Prevent toggle when clicking inside the container (when expanded)
        const filtersContainer = document.getElementById('filtersContainer');
        filtersContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    },

    /**
     * Setup top bar buttons
     */
    setupTopBarButtons() {
        if (typeof ModalManager === 'undefined') {
            console.error('ModalManager is not defined. Ensure the script is loaded correctly.');
            return;
        }

        document.getElementById('loadDataBtn').addEventListener('click', () => {
            DataManager.loadData();
        });
        
        document.getElementById('saveDataBtn').addEventListener('click', () => {
            DataManager.saveData();
        });
        
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            ModalManager.openAddModal();
        });
        
        document.getElementById('addTypeBtn').addEventListener('click', () => {
            TypeModalManager.openAddModal();
        });
    },

    /**
     * Setup filter controls
     */
    setupFilterControls() {
        const filterTypeSelect = document.getElementById('filterType');
        const filterTrigger = filterTypeSelect.querySelector('.custom-select-trigger');
        const filterDropdown = filterTypeSelect.querySelector('.custom-select-dropdown');
        
        // Toggle dropdown
        filterTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            filterTypeSelect.classList.toggle('open');
        });
        
        // Handle option selection
        filterDropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;
            
            const value = option.dataset.value;
            const text = option.querySelector('.option-text').textContent;
            
            App.filters.typeId = value;
            filterTrigger.querySelector('.selected-text').textContent = text;
            
            filterDropdown.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            filterTypeSelect.classList.remove('open');
            FilterManager.applyFilters();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterTypeSelect.contains(e.target)) {
                filterTypeSelect.classList.remove('open');
            }
        });
        
        // Keyboard support
        filterTypeSelect.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                filterTypeSelect.classList.toggle('open');
            } else if (e.key === 'Escape') {
                filterTypeSelect.classList.remove('open');
            }
        });

        // Date filter controls
        const filterDateStart = document.getElementById('filterDateStart');
        const filterDateEnd = document.getElementById('filterDateEnd');
        
        filterDateStart.addEventListener('click', function() {
            this.showPicker();
        });
        
        filterDateEnd.addEventListener('click', function() {
            this.showPicker();
        });
        
        filterDateStart.addEventListener('change', (e) => {
            App.filters.dateStart = e.target.value;
            FilterManager.applyFilters();
        });

        filterDateEnd.addEventListener('change', (e) => {
            App.filters.dateEnd = e.target.value;
            FilterManager.applyFilters();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            FilterManager.clearFilters();
        });
    },

    /**
     * Setup sortable table headers
     */
    setupSortableHeaders() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-sort');
                SortManager.sortEntries(column);
            });
        });
    },

    /**
     * Setup task modal event listeners
     */
    setupTaskModal() {
        document.getElementById('closeModal').addEventListener('click', () => {
            ModalManager.closeModal();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            ModalManager.closeModal();
        });
        
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                ModalManager.closeModal();
            }
        });
        
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            ModalManager.handleFormSubmit(e);
        });
        
        const taskDateInput = document.getElementById('taskDate');
        taskDateInput.addEventListener('click', function() {
            this.showPicker();
        });
        
        document.getElementById('taskStartTime').addEventListener('change', () => {
            ModalManager.updateDurationDisplay();
        });
        
        document.getElementById('taskEndTime').addEventListener('change', () => {
            ModalManager.updateDurationDisplay();
        });

        /**
         * Setup task type dropdown in the "Add Task" modal
         */
        this.setupTaskTypeDropdown();

        const durationDisplay = document.getElementById('durationDisplay');
        durationDisplay.addEventListener('input', () => {
            const startTime = document.getElementById('taskStartTime').value;
            const durationText = durationDisplay.textContent;

            // Parse duration text (e.g., "1h 30m") into minutes
            const durationMatch = durationText.match(/(\d+)h\s*(\d+)?m?/);
            if (startTime && durationMatch) {
                const hours = parseInt(durationMatch[1], 10) || 0;
                const minutes = parseInt(durationMatch[2], 10) || 0;
                const totalMinutes = hours * 60 + minutes;

                const [startHour, startMinute] = startTime.split(':').map(Number);
                const startDate = new Date();
                startDate.setHours(startHour, startMinute, 0, 0);

                const endDate = new Date(startDate.getTime() + totalMinutes * 60000); // Add duration in milliseconds
                const endTime = endDate.toTimeString().slice(0, 5);
                document.getElementById('taskEndTime').value = endTime;
            }
        });
    },

    /**
     * Setup task type dropdown in the "Add Task" modal
     */
    setupTaskTypeDropdown() {
        const taskTypeSelect = document.getElementById('taskType');
        const trigger = taskTypeSelect.querySelector('.custom-select-trigger');
        const dropdown = taskTypeSelect.querySelector('.custom-select-dropdown');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            taskTypeSelect.classList.toggle('open');
        });

        // Handle option selection
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-option');
            if (!option) return;

            const value = option.dataset.value;
            const text = option.querySelector('.option-text').textContent;

            App.editingTaskTypeId = value;
            trigger.querySelector('.selected-text').textContent = text;

            dropdown.querySelectorAll('.custom-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');

            taskTypeSelect.classList.remove('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!taskTypeSelect.contains(e.target)) {
                taskTypeSelect.classList.remove('open');
            }
        });
    },

    /**
     * Setup type modal event listeners
     */
    setupTypeModal() {
        document.getElementById('closeTypeModal').addEventListener('click', () => {
            TypeModalManager.closeModal();
        });
        
        document.getElementById('cancelTypeBtn').addEventListener('click', () => {
            TypeModalManager.closeModal();
        });
        
        document.getElementById('typeModal').addEventListener('click', (e) => {
            if (e.target.id === 'typeModal') {
                TypeModalManager.closeModal();
            }
        });
        
        document.getElementById('typeForm').addEventListener('submit', (e) => {
            TypeModalManager.handleFormSubmit(e);
        });
        
        document.getElementById('typeColor').addEventListener('input', (e) => {
            document.getElementById('colorPreview').style.backgroundColor = e.target.value;
        });
    },

    /**
     * Setup view switcher for time graph
     */
    setupViewSwitcher() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                App.currentTimeView = view;
                
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                ChartRenderer.renderTimeGraph();
            });
        });
    },

    /**
     * Setup window resize handler
     */
    setupWindowResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                UIRenderer.renderCharts();
            }, 250);
        });
    }
};

window.EventListeners = EventListeners;
