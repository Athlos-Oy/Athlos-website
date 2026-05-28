// Contact form handler. The form lives in src/contact.njk; this
// script is loaded after the page body (defer) and submits to
// every Web3Forms access key listed below.
//
// Recipient delivery
// ------------------
// Each Web3Forms access key delivers to ONE recipient inbox. The
// `cc` field is Web3Forms Pro-only and silently ignored on the
// free plan, so to fan out to multiple inboxes we maintain one
// free account per recipient and submit to all keys in parallel.
// A submission counts as delivered when at least one account
// returns success. The current recipient list:
//   888296f4-… → info@athlos.fi
//   9f337c43-… → evangelos.spartiotis@athlos.fi
// To add or remove a recipient, edit WEB3FORMS_KEYS below.
//
// Localized strings
// -----------------
// window.contactStrings is populated by src/contact.njk before this
// script runs (the inline <script> sits earlier in the body). All
// validation, sending, generic and network error messages come
// from there, so the form speaks the user's language. Fallbacks
// are English so the form still works if injection ever fails.
//
// Analytics
// ---------
// Pushes contact_form_submit / contact_form_error directly to
// window.dataLayer (GTM). Topic is the language-independent stable
// key (`topicKey()`) so the GA4 dimension stays consistent across
// locales. Never pushes personal data.

(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return; // page has no form — nothing to wire up

  var submitBtn  = document.getElementById('cf-submit');
  var errorBox   = document.getElementById('cf-error');
  var modal      = document.getElementById('cf-success-modal');
  var modalClose = document.getElementById('cf-modal-close');

  var WEB3FORMS_KEYS = [
    '888296f4-31a1-4744-9ed7-81c91fc5cefe',  // info@athlos.fi
    '9f337c43-0578-4540-9d6f-9d77722bd3d0'   // evangelos.spartiotis@athlos.fi
  ];

  var STRINGS = (window.contactStrings || {});
  var dl = (window.dataLayer = window.dataLayer || []);

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
  // Sent to analytics only; never sent to the email backend, and
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

  function submitToWeb3Forms(key, subject, body, name, email) {
    var formData = new FormData();
    formData.append('access_key', key);
    formData.append('subject',    subject);
    formData.append('message',    body);
    formData.append('from_name',  name);
    formData.append('replyto',    email);
    formData.append('redirect',   'false');
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { return d && d.success === true; })
      .catch(function () { return false; });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();

    var name    = document.getElementById('cf-name').value.trim();
    var email   = document.getElementById('cf-email').value.trim();
    var company = document.getElementById('cf-company').value.trim();
    var topic   = document.getElementById('cf-topic').value.trim();
    var message = document.getElementById('cf-message').value.trim();

    if (!name || !email || !message) {
      dl.push({ event: 'contact_form_error', error_type: 'validation', form_topic: topicKey() });
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
      // Fan out to every recipient's Web3Forms account in parallel.
      // Delivery is considered successful when at least one account
      // returns success.
      var results = await Promise.all(
        WEB3FORMS_KEYS.map(function (key) {
          return submitToWeb3Forms(key, subject, body, name, email);
        })
      );

      if (results.some(function (ok) { return ok; })) {
        form.reset();
        openModal();
        dl.push({ event: 'contact_form_submit', form_topic: topicKey() });
      } else {
        showError(STRINGS.generic || 'Something went wrong. Please try again or email us directly at info@athlos.fi.');
        dl.push({ event: 'contact_form_error', error_type: 'send_failed', form_topic: topicKey() });
      }
    } catch (err) {
      showError(STRINGS.network || 'Unable to send your message. Please try again or email us directly at info@athlos.fi.');
      dl.push({ event: 'contact_form_error', error_type: 'network', form_topic: topicKey() });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = STRINGS.submit || 'Send Message';
    }
  });
})();
