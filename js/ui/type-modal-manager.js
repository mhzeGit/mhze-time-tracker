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
        document.getElementById('typeColor').value = '#3b82f6';
        document.getElementById('colorPreview').style.backgroundColor = '#3b82f6';
        document.getElementById('typeModalTitle').textContent = 'Add Type';
        
        App.editingTypeId = null;
        modal.classList.add('active');
    },

    /**
     * Open modal for editing existing type
     */
    openEditModal(id) {
        const type = TypeManager.getTypeById(id);
        if (!type) return;
        
        const modal = document.getElementById('typeModal');
        
        document.getElementById('typeName').value = type.name;
        document.getElementById('typeColor').value = type.color;
        document.getElementById('colorPreview').style.backgroundColor = type.color;
        document.getElementById('typeModalTitle').textContent = 'Edit Type';
        
        App.editingTypeId = id;
        modal.classList.add('active');
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
            color: document.getElementById('typeColor').value
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
