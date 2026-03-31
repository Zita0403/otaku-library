document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-button');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const isConfirmed = confirm(`Are you sure you want to delete this code?: ${code}?`);

            if (isConfirmed) {
                this.closest('.delete-form').submit();
            }
        });
    });
});