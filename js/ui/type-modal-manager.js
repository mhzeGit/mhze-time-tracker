/**
 * Type Modal Manager
 * Handles the add/edit type modal
 */
const TypeModalManager = {
    /**
     * Open modal for adding new type
     */
    openAddModal() {
        const modal = document.getElementById('typeModal');
        const form = document.getElementById('typeForm');
        
        form.reset();
        
        // Set default color
        const defaultColor = '#3b82f6';
        document.getElementById('selectedColor').value = defaultColor;
        document.getElementById('typeColor').value = defaultColor;
        document.getElementById('colorPreview').style.backgroundColor = defaultColor;
        
        // Select the first color option by default
        this.selectPaletteColor(defaultColor);
        
        // Hide custom color picker
        document.getElementById('customColorPicker').style.display = 'none';
        
        document.getElementById('typeModalTitle').textContent = 'Add Type';
        
        App.editingTypeId = null;
        modal.classList.add('active');
        
        // Setup color palette event listeners
        this.setupColorPaletteListeners();
    },

    /**
     * Open modal for editing existing type
     */
    openEditModal(id) {
        const type = TypeManager.getTypeById(id);
        if (!type) return;
        
        const modal = document.getElementById('typeModal');
        
        document.getElementById('typeName').value = type.name;
        document.getElementById('selectedColor').value = type.color;
        document.getElementById('typeColor').value = type.color;
        document.getElementById('colorPreview').style.backgroundColor = type.color;
        document.getElementById('typeModalTitle').textContent = 'Edit Type';
        
        // Check if color is in palette
        const paletteOption = document.querySelector(`.color-option[data-color="${type.color}"]`);
        if (paletteOption) {
            this.selectPaletteColor(type.color);
            document.getElementById('customColorPicker').style.display = 'none';
        } else {
            // Custom color - show custom picker
            this.selectCustomColor();
        }
        
        App.editingTypeId = id;
        modal.classList.add('active');
        
        // Setup color palette event listeners
        this.setupColorPaletteListeners();
    },

    /**
     * Setup color palette event listeners
     */
    setupColorPaletteListeners() {
        // Remove existing listeners
        const palette = document.getElementById('colorPalette');
        const newPalette = palette.cloneNode(true);
        palette.parentNode.replaceChild(newPalette, palette);
        
        // Add listeners to color options
        const colorOptions = newPalette.querySelectorAll('.color-option:not(.custom-color-option)');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                this.selectPaletteColor(color);
                document.getElementById('customColorPicker').style.display = 'none';
            });
        });
        
        // Add listener to custom color option
        const customOption = newPalette.querySelector('.custom-color-option');
        customOption.addEventListener('click', () => {
            this.selectCustomColor();
        });
        
        // Add listener to custom color input
        const typeColorInput = document.getElementById('typeColor');
        const newTypeColorInput = typeColorInput.cloneNode(true);
        typeColorInput.parentNode.replaceChild(newTypeColorInput, typeColorInput);
        
        newTypeColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            document.getElementById('selectedColor').value = color;
            document.getElementById('colorPreview').style.backgroundColor = color;
        });
    },

    /**
     * Select a palette color
     */
    selectPaletteColor(color) {
        // Update selected color
        document.getElementById('selectedColor').value = color;
        document.getElementById('typeColor').value = color;
        document.getElementById('colorPreview').style.backgroundColor = color;
        
        // Update visual selection
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    },

    /**
     * Select custom color option
     */
    selectCustomColor() {
        // Show custom color picker
        document.getElementById('customColorPicker').style.display = 'block';
        
        // Update visual selection
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        document.querySelector('.custom-color-option').classList.add('selected');
        
        // Set custom color picker to current color
        const currentColor = document.getElementById('selectedColor').value;
        document.getElementById('typeColor').value = currentColor;
        document.getElementById('colorPreview').style.backgroundColor = currentColor;
    },

    /**
     * Close the modal
     */
    closeModal() {
        const modal = document.getElementById('typeModal');
        modal.classList.remove('active');
        App.editingTypeId = null;
    },

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('typeName').value,
            color: document.getElementById('selectedColor').value
        };
        
        if (App.editingTypeId) {
            TypeManager.updateType(App.editingTypeId, formData);
        } else {
            TypeManager.addType(formData);
        }
        
        this.closeModal();
    }
};

window.TypeModalManager = TypeModalManager;
