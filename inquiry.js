/* ============================================================
   Shared "Request Information" modal logic + HubSpot submission.

   HOW TO ENABLE HUBSPOT:
   1. In HubSpot create a form with these field internal names:
        email      (Email)        – required
        firstname  (First name)
        lastname   (Last name)
        phone      (Phone number)
        message    (Message)
   2. Fill in the two values below (Portal/Hub ID and the Form GUID).

   The visitor's single "Your name" field is split into firstname + lastname.
   The asset they enquired about is prepended to the Message, so it's captured
   even though the form has no dedicated property field.

   Until both values are set, the form safely falls back to opening a
   pre-filled email to INQUIRY_EMAIL — so nothing breaks in the meantime.
   ============================================================ */
var HUBSPOT_PORTAL_ID = "48125838";                              // Portal / Hub ID
var HUBSPOT_FORM_GUID = "196de176-8ffd-42d8-a962-ee639c075bab";  // Form GUID
var INQUIRY_EMAIL     = "info@dkg-development.com";

function hubspotEnabled(){
  return !!(HUBSPOT_PORTAL_ID && HUBSPOT_FORM_GUID);
}
function defaultInquiryNote(){
  return hubspotEnabled()
    ? "Your details are sent securely to our team."
    : "This opens a pre-filled email to " + INQUIRY_EMAIL + ".";
}

function openInquiry(assetName){
  document.getElementById('inquiryAsset').textContent = 'Asset: ' + assetName;
  document.getElementById('inquiryForm').dataset.asset = assetName;
  // reset any previous submit state
  var btn = document.querySelector('#inquiryForm .btn-send');
  if(btn){ btn.disabled = false; btn.textContent = 'Send Inquiry'; }
  var note = document.querySelector('#inquiryForm .note-pending');
  if(note){ note.textContent = defaultInquiryNote(); }
  document.getElementById('inquiryWrap').classList.add('open');
}

function closeInquiry(){ document.getElementById('inquiryWrap').classList.remove('open'); }

function inquiryMailtoFallback(asset, name, email, phone, message){
  var subject = encodeURIComponent('Partner Inquiry: ' + asset);
  var body = encodeURIComponent('Asset: ' + asset + '\n' + 'Name: ' + name + '\n' + 'Email: ' + email + '\n' + 'Phone: ' + phone + '\n\n' + 'Message:\n' + message);
  window.location.href = 'mailto:' + INQUIRY_EMAIL + '?subject=' + subject + '&body=' + body;
}

function submitInquiry(e){
  e.preventDefault();
  var asset = document.getElementById('inquiryForm').dataset.asset || 'General';
  var name = document.getElementById('f-name').value;
  var email = document.getElementById('f-email').value;
  var phone = document.getElementById('f-phone').value;
  var message = document.getElementById('f-message').value;

  // HubSpot not configured yet -> fall back to email.
  if(!hubspotEnabled()){
    inquiryMailtoFallback(asset, name, email, phone, message);
    closeInquiry();
    return false;
  }

  var btn = document.querySelector('#inquiryForm .btn-send');
  var note = document.querySelector('#inquiryForm .note-pending');
  if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

  // Split the single "Your name" field into first/last name for HubSpot.
  var trimmed = (name || '').trim();
  var sp = trimmed.indexOf(' ');
  var firstName = sp === -1 ? trimmed : trimmed.slice(0, sp);
  var lastName  = sp === -1 ? ''      : trimmed.slice(sp + 1).trim();

  // The form has no dedicated property field, so record the asset in the message.
  var fullMessage = 'Property of interest: ' + asset + (message ? '\n\n' + message : '');

  var payload = {
    fields: [
      { name: "email", value: email },
      { name: "firstname", value: firstName },
      { name: "lastname", value: lastName },
      { name: "phone", value: phone },
      { name: "message", value: fullMessage }
    ],
    context: { pageUri: window.location.href, pageName: document.title }
  };

  fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HUBSPOT_PORTAL_ID + '/' + HUBSPOT_FORM_GUID, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(res){
    if(!res.ok) throw new Error('HubSpot ' + res.status);
    if(note){ note.textContent = 'Thank you — your request has been sent. Our team will be in touch shortly.'; }
    document.getElementById('inquiryForm').reset();
    if(btn){ btn.textContent = 'Sent ✓'; }
    setTimeout(closeInquiry, 1800);
  }).catch(function(){
    // Network/HubSpot error -> never lose the lead, fall back to email.
    if(btn){ btn.disabled = false; btn.textContent = 'Send Inquiry'; }
    inquiryMailtoFallback(asset, name, email, phone, message);
    closeInquiry();
  });

  return false;
}

document.addEventListener('DOMContentLoaded', function(){
  var wrap = document.getElementById('inquiryWrap');
  if(wrap){ wrap.addEventListener('click', function(e){ if(e.target === this) closeInquiry(); }); }
  var note = document.querySelector('#inquiryForm .note-pending');
  if(note){ note.textContent = defaultInquiryNote(); }
  document.querySelectorAll('.main-nav a').forEach(function(a){
    a.addEventListener('click', function(){ document.querySelector('.main-nav').classList.remove('open'); });
  });
});
