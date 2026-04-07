/* ===================================================
   ANVIKSHI SOLUTIONS — Form Email Handler
   Uses Web3Forms API (https://web3forms.com)
   =================================================== */

/*
  ┌──────────────────────────────────────────────────┐
  │  SETUP INSTRUCTIONS                              │
  │  1. Visit https://web3forms.com                  │
  │  2. Enter: Hr@anvikshisolutions.com       │
  │  3. You will receive an Access Key via email      │
  │  4. Replace the key below with your access key    │
  └──────────────────────────────────────────────────┘
*/
const WEB3FORMS_ACCESS_KEY = '89f648e9-65ec-4cdb-96e4-d967041f3123'; // ← Replace with your Web3Forms access key

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Format current date as DD-MMM-YYYY
 */
function getFormattedDate() {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

/**
 * Validate email address format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (at least 10 digits)
 */
function isValidPhone(phone) {
  return /[\d]{10,}/.test(phone.replace(/[\s\-\+\(\)]/g, ''));
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

/**
 * Set button to loading state
 */
function setButtonLoading(btn, loading) {
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Submitting...';
    btn.classList.add('btn-loading');
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Submit';
    btn.classList.remove('btn-loading');
  }
}

/**
 * Show form message (success or error)
 */
function showFormMessage(container, message, type) {
  // Remove existing messages
  const existing = container.querySelector('.form-message');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = `form-message form-message-${type}`;
  el.innerHTML = message;
  container.appendChild(el);

  // Auto-hide after 8 seconds
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 400);
  }, 8000);
}

/**
 * Initialize a form with validation and Web3Forms submission
 *
 * @param {Object} config
 * @param {string} config.formId        - DOM id of the <form>
 * @param {string} config.subjectPrefix - e.g. "Resume Submission", "Hiring Requirement", "Contact Inquiry"
 * @param {string} config.nameField     - Name of the form field to use in subject (field name attr)
 * @param {string} config.successMessage- Message shown on success
 * @param {Array}  config.requiredFields- Array of { name, label, type } for validation
 * @param {string} [config.fileField]   - Name of file input field (optional)
 * @param {number} [config.maxFileSizeMB] - Max file size in MB (default 10)
 */
function initFormHandler(config) {
  const form = document.getElementById(config.formId);
  if (!form) return;

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Validate required fields
    const errors = [];
    for (const field of config.requiredFields) {
      const input = form.querySelector(`[name="${field.name}"]`);
      if (!input) continue;

      const value = input.value.trim();
      if (!value) {
        errors.push(`${field.label} is required.`);
        input.classList.add('field-error');
        continue;
      }
      input.classList.remove('field-error');

      if (field.type === 'email' && !isValidEmail(value)) {
        errors.push('Please enter a valid email address.');
        input.classList.add('field-error');
      }
      if (field.type === 'tel' && !isValidPhone(value)) {
        errors.push('Please enter a valid mobile number (at least 10 digits).');
        input.classList.add('field-error');
      }
      if (field.type === 'url' && !isValidUrl(value)) {
        errors.push('Please enter a valid URL (e.g. https://drive.google.com/...');
        input.classList.add('field-error');
      }
    }

    // Validate file if present
    if (config.fileField) {
      const fileInput = form.querySelector(`[name="${config.fileField}"]`);
      if (fileInput) {
        const maxSize = (config.maxFileSizeMB || 10) * 1024 * 1024;
        if (fileInput.files.length === 0) {
          errors.push('Please upload your resume (PDF).');
        } else {
          const file = fileInput.files[0];
          if (file.type !== 'application/pdf') {
            errors.push('Only PDF files are accepted.');
          }
          if (file.size > maxSize) {
            errors.push(`File size must be under ${config.maxFileSizeMB || 10}MB.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      showFormMessage(form, errors.join('<br>'), 'error');
      return;
    }

    // Build FormData
    const formData = new FormData(form);
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);

    // Build subject line
    const nameValue = formData.get(config.nameField) || 'Unknown';
    const dateStr = getFormattedDate();
    const subject = `${config.subjectPrefix} – ${nameValue} – ${dateStr}`;
    formData.append('subject', subject);

    // Set recipient
    formData.append('from_name', 'Anvikshi Solutions Website');

    // Start loading
    isSubmitting = true;
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showFormMessage(form, config.successMessage, 'success');
        form.reset();

        // Reset file label if present
        const fileLabel = form.querySelector('.file-upload-label span');
        if (fileLabel) {
          fileLabel.textContent = 'Click to upload or drag PDF here';
        }
      } else {
        // If file upload caused the error, retry without file and notify user
        if (config.fileField && formData.has(config.fileField)) {
          console.warn('Retrying without file attachment...');
          formData.delete(config.fileField);

          // Add note about the file
          const fileInput = form.querySelector(`[name="${config.fileField}"]`);
          const fileName = fileInput && fileInput.files[0] ? fileInput.files[0].name : 'resume.pdf';
          formData.append('Resume_File_Name', fileName);
          formData.append('Note', 'Resume file was too large for auto-attach. Please request it from the candidate directly.');

          const retryResponse = await fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            body: formData
          });
          const retryResult = await retryResponse.json();

          if (retryResult.success) {
            showFormMessage(form, config.successMessage + '<br><small style="opacity:0.7">Note: Your resume file was too large to attach automatically. Our team will request it from you via email.</small>', 'success');
            form.reset();
            const fl = form.querySelector('.file-upload-label span');
            if (fl) fl.textContent = 'Click to upload or drag PDF here';
          } else {
            throw new Error(retryResult.message || 'Submission failed.');
          }
        } else {
          throw new Error(result.message || 'Submission failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormMessage(
        form,
        `Something went wrong: ${error.message}<br>Please try again or email us directly at Hr@anvikshisolutions.com`,
        'error'
      );
    } finally {
      setButtonLoading(submitBtn, false);
      isSubmitting = false;
    }
  });

  // Remove field-error class on input
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('field-error'));
  });
}
