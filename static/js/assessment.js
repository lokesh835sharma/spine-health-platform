/* ============================================================
   ASSESSMENT.JS — Form validation, progress, submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form          = document.getElementById('assessmentForm');
  const submitBtn     = document.getElementById('submitBtn');
  const progressBar   = document.getElementById('progressBar');
  const progressCount = document.getElementById('progressCount');
  const validationMsg = document.getElementById('formValidationMsg');

  // All required field names
  const REQUIRED_RADIO = [
    'gender', 'morning_stiffness', 'persistent_pain',
    'sitting_posture', 'sleeping_posture', 'sleep_turning',
    'sleep_quality', 'physical_activity', 'ott_usage',
    'family_backpain', 'gut_infection'
  ];
  const REQUIRED_TEXT = ['age', 'sitting_hours'];
  const TOTAL = 13; // 14 questions but spondylitis is optional, and age+sitting together = 2 text + 11 radio = 13 required

  /* ---- Progress tracking ---- */
  function countAnswered() {
    let count = 0;
    REQUIRED_TEXT.forEach(name => {
      const el = form.elements[name];
      if (el && el.value.trim() !== '') count++;
    });
    REQUIRED_RADIO.forEach(name => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      if (checked) count++;
    });
    return count;
  }

  function updateProgress() {
    const answered = countAnswered();
    const pct = Math.round((answered / TOTAL) * 100);
    progressBar.style.width = pct + '%';
    progressCount.textContent = `${answered} / ${TOTAL}`;
  }

  // Listen to all inputs
  form.addEventListener('change', updateProgress);
  form.addEventListener('input', updateProgress);

  /* ---- Visual feedback: radio card selection ---- */
  form.querySelectorAll('.radio-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function () {
      // Remove active state from siblings
      const name = this.name;
      form.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.radio-card').classList.remove('selected');
      });
      this.closest('.radio-card').classList.add('selected');
      clearError(name);
    });
  });

  /* ---- Text input feedback ---- */
  REQUIRED_TEXT.forEach(name => {
    const el = form.elements[name];
    if (el) {
      el.addEventListener('input', () => clearError(name));
      el.addEventListener('blur', () => validateField(name));
    }
  });

  /* ---- Error helpers ---- */
  function showError(name, msg) {
    const errEl = document.getElementById(`${name}-error`);
    const inputEl = form.elements[name];
    if (errEl) errEl.textContent = msg;
    // Only add class to single elements, not RadioNodeList
    if (inputEl && inputEl.classList) inputEl.classList.add('error');
  }

  function clearError(name) {
    const errEl = document.getElementById(`${name}-error`);
    const inputEl = form.elements[name];
    if (errEl) errEl.textContent = '';
    if (inputEl && inputEl.classList) inputEl.classList.remove('error');
  }

  function validateField(name) {
    const el = form.elements[name];
    if (!el) return false;
    const val = el.value.trim();
    if (val === '') {
      showError(name, 'This field is required.');
      return false;
    }
    if (name === 'age') {
      const n = parseFloat(val);
      if (isNaN(n) || n < 10 || n > 100) {
        showError(name, 'Please enter a valid age between 10 and 100.');
        return false;
      }
    }
    if (name === 'sitting_hours') {
      const n = parseFloat(val);
      if (isNaN(n) || n < 0 || n > 24) {
        showError(name, 'Please enter hours between 0 and 24.');
        return false;
      }
    }
    clearError(name);
    return true;
  }

  function validateRadio(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      showError(name, 'Please select an option.');
      return false;
    }
    clearError(name);
    return true;
  }

  /* ---- Full form validation ---- */
  function validateForm() {
    let valid = true;
    let firstError = null;

    REQUIRED_TEXT.forEach(name => {
      if (!validateField(name)) {
        valid = false;
        if (!firstError) firstError = form.elements[name];
      }
    });

    REQUIRED_RADIO.forEach(name => {
      if (!validateRadio(name)) {
        valid = false;
        if (!firstError) {
          const card = form.querySelector(`input[name="${name}"]`);
          if (card) firstError = card.closest('.form-card');
        }
      }
    });

    if (!valid && firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  /* ---- Collect form data ---- */
  function collectData() {
    const data = {};
    REQUIRED_TEXT.forEach(name => {
      data[name] = form.elements[name].value.trim();
    });
    REQUIRED_RADIO.forEach(name => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      data[name] = checked ? checked.value : '';
    });
    // Optional
    const spondylitis = form.querySelector('input[name="spondylitis"]:checked');
    data.spondylitis = spondylitis ? spondylitis.value : 'Not answered';
    return data;
  }

  /* ---- Submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    validationMsg.textContent = '';

    if (!validateForm()) {
      validationMsg.textContent = 'Please answer all required questions before submitting.';

      return;
    }



    // Loading state
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    try {
      const payload = collectData();


      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });


      const result = await res.json();


      if (!res.ok || result.error) {
        throw new Error(result.error || 'Prediction failed. Please try again.');
      }

      // Store result in localStorage as backup
      if (result.result_data) {
        localStorage.setItem('spineai_result', JSON.stringify(result.result_data));
      }

      // Navigate to results

      window.location.assign(result.redirect || '/result');

    } catch (err) {

      validationMsg.textContent = err.message || 'An error occurred. Please try again.';
      btnText.style.display    = 'inline-flex';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  });



  /* ---- Initial progress ---- */
  updateProgress();
});
