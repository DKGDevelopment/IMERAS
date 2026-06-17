/* ============================================================
   Shared "Request Information" modal logic + HubSpot submission.

   HOW TO ENABLE HUBSPOT:
   1. In HubSpot create a form with these field internal names:
        email                 (Email)            – required
        firstname             (First name)
        phone                 (Phone number)
        message               (Message)
        property_of_interest  (single-line text custom property)
   2. Fill in the two values below (Portal/Hub ID and the Form GUID).

   Until both values are set, the form safely falls back to opening a
   pre-filled email to INQUIRY_EMAIL — so nothing breaks in the meantime.
   ============================================================ */
var HUBSPOT_PORTAL_ID = "";   // e.g. "1234567"
var HUBSPOT_FORM_GUID = "";   // e.g. "0a1b2c3d-4e5f-6789-abcd-ef0123456789"
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

  var payload = {
    fields: [
      { name: "email", value: email },
      { name: "firstname", value: name },
      { name: "phone", value: phone },
      { name: "message", value: message },
      { name: "property_of_interest", value: asset }
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
