// Contact form handler. The form lives in src/contact.njk; this script
// is loaded after the page body and submits to web3forms.com.
//
// Localized strings come from window.contactStrings (injected by the
// page body so they participate in the i18n parity check). The
// web3forms access key determines the recipient list — that's
// configured in the web3forms dashboard, not in this file.
//
// All eight contact-form labels (validation, subjectFallback,
// contactEmailLabel, sending, generic, network, submit, …) have safe
// English fallbacks here so the form still works if strings injection
// ever fails.

(function () {
  var form       = document.getElementById('contactForm');
  if (!form) return; // page has no form — nothing to wire up
  var submitBtn  = document.getElementById('cf-submit');
  var errorBox   = document.getElementById('cf-error');
  var modal      = document.getElementById('cf-success-modal');
  var modalClose = document.getElementById('cf-modal-close');

  var WEB3FORMS_KEY = '888296f4-31a1-4744-9ed7-81c91fc5cefe';
  var STRINGS = (window.contactStrings || {});

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearError() {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
  }

  // Stable, language-independent topic key derived from the select
  // index. Order must match the <option> list in the form markup.
  // Sent to analytics only — never sent to the email backend, and
  // never includes any personal data.
  function topicKey() {
    var sel = document.getElementById('cf-topic');
    var keys = ['none','dc-air','ufs','ufs-ip67','oem','software','manufacturing','distribution','other'];
    return (sel && keys[sel.selectedIndex]) || 'other';
  }

  function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();

    var name    = document.getElementById('cf-name').value.trim();
    var email   = document.getElementById('cf-email').value.trim();
    var company = document.getElementById('cf-company').value.trim();
    var topic   = document.getElementById('cf-topic').value.trim();
    var message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message) {
      showError(STRINGS.validation || 'Please fill in your name, email address, and message.');
      return;
    }

    var subjectParts = [];
    if (topic)   subjectParts.push(topic);
    else         subjectParts.push(STRINGS.subjectFallback || 'General enquiry');
    if (company) subjectParts.push(company);
    var subject = subjectParts.join(' - ');

    var body = message + '\n\n' + name;
    if (company) body += '\n' + company;
    body += '\n\n' + (STRINGS.contactEmailLabel || 'Contact email') + ': ' + email;

    submitBtn.disabled = true;
    submitBtn.textContent = STRINGS.sending || 'Sending…';

    try {
      var formData = new FormData();
      formData.append('access_key',  WEB3FORMS_KEY);
      formData.append('subject',     subject);
      formData.append('message',     body);
      formData.append('from_name',   name);
      formData.append('replyto',     email);
      formData.append('redirect',    'false');

      var response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      var data = await response.json();

      if (data.success) {
        form.reset();
        openModal();
        if (window.athlosAnalytics) {
          window.athlosAnalytics.track('contact_form_submit', { form_name: 'contact', form_topic: topicKey() });
        }
      } else {
        showError(STRINGS.generic || 'Something went wrong. Please try again or email us directly at info@athlos.fi.');
        if (window.athlosAnalytics) {
          window.athlosAnalytics.track('contact_form_error', { form_name: 'contact', error_type: 'api' });
        }
      }
    } catch (err) {
      showError(STRINGS.network || 'Unable to send your message. Please try again or email us directly at info@athlos.fi.');
      if (window.athlosAnalytics) {
        window.athlosAnalytics.track('contact_form_error', { form_name: 'contact', error_type: 'network' });
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = STRINGS.submit || 'Send Message';
    }
  });
})();
