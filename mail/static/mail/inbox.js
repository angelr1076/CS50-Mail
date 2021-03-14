
  document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});
// ------------------------------------------------------------------------------

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  // Clear inbox on Compose
  document.querySelector('#container').innerHTML = '';
  // Send email
  document.querySelector('#compose-form').addEventListener('submit', send_mail);
}
// ------------------------------------------------------------------------------

// Mailbox: When a user visits their Inbox, Sent mailbox, or Archive, load the appropriate mailbox.

async function load_mailbox(mailbox) {
  const emailUrl = `/emails/${mailbox}`;
  // Clear inbox each time Inbox button is pressed
  document.querySelector('#container').innerHTML = '';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Send a GET request to the URL
  await fetch(emailUrl)
      .then(response => response.json())
      .then(emails => {
          for (const email of emails) {
            const container = document.querySelector('#container');
            // const element = document.createElement('div');
            const element = document.createElement('a');
            const emailId = `#email-${email.id}`;
            // element.href=`${email.id}`;
            element.style.textDecoration = 'none';
            element.classList.add('HoverClass1');
            element.setAttribute('id', `email-${email.id}`);
            element.classList.add('d-flex', 'justify-content-between', 'p-3', 'm-1');
            element.style.border = '3px solid black';
            element.style.color = 'black';
            element.innerHTML = 
             `<div class="bd-highlight font-weight-bolder mr-5">${email.sender}</div>
              <div class="flex-fill bd-highlight">${email.subject}</div>
              <div class="bd-highlight">${email.timestamp}</div>`;
            
            // If the email has been read, make its background grey
            if (email.read == true) {
              element.classList.add('bg-secondary', 'text-light');
            }
            // Add the new line item element to the container
            container.append(element);
            const lineEmail = document.querySelector(emailId);
            // Click to view email
            lineEmail.addEventListener('click', () => {
              // Pass the emailId in the event listener. If it's called in view_email from event.target, there will be an asynchronous issue
              view_email(emailId);
            });
        }
      })
    .catch(error => {
      console.log(error);
    });
    return false;
}
// ------------------------------------------------------------------------------

// View Email: When a user clicks on an email, the user should be taken to a view where they see the content of that email

const view_email = async(Id) => {
  const emailId = Id.split("-")[1];
  const emailURL = `/emails/${emailId}`;

  await fetch(emailURL)
  .then(response => response.json())
  .then(email => {
    if (emailId != undefined) {
      document.querySelector('#container').innerHTML = '';
      document.querySelector('#emails-view').innerHTML = '';
      const container = document.querySelector('#container');
      const element = document.createElement('div');
      
      // Create and style Archive button
      const btnArchive = document.createElement('BUTTON');
      btnArchive.classList.add('btn', 'btn-outline-danger', 'ml-3', 'mr-3');
      let btnArchiveText = document.createTextNode('');
      
      // Set button label depending on the status of the archived property
      email.archived == true ? btnArchiveText.textContent = 'Unarchive' : btnArchiveText.textContent = 'Archive';
      btnArchive.appendChild(btnArchiveText);
      
      // Create and style Reply button
      const btnReply = document.createElement('BUTTON');
      btnReply.classList.add('btn', 'btn-outline-primary');
      let btnReplyText = document.createTextNode('Reply');
      btnReply.appendChild(btnReplyText);
      
      // Create an unread button
      const btnUnread = document.createElement('BUTTON');
      btnUnread.classList.add('btn', 'btn-outline-info');
      let btnUnreadText = document.createTextNode('Mark As Unread');
      btnUnread.appendChild(btnUnreadText);
      
      // Create single email layout
      element.innerHTML = 
       `<div class="bd-highlight font-weight-bolder mr-5"><b>From:</b> ${email.sender}</div>
        <div class="flex-fill bd-highlight"><b>To:</b> ${email.recipients}</div>
        <div class="flex-fill bd-highlight"><b>Subject:</b> ${email.subject}</div>
        <div class="flex-fill bd-highlight"><b>Body:</b> ${email.body}</div>
        <div class="bd-highlight"><b>Date/Time</b> ${email.timestamp}</div>
        <hr>`;
      // Add element to the container div
      container.append(element);
      
      // Call archive_emails and pass email object to check if archived
      btnArchive.addEventListener('click', () => {
        archive_emails(email, emailId);
        window.location.reload(true);
        });
        
      btnReply.addEventListener('click', () => {
        reply_email(email);
      });
      // Call mark as read function to flip read flag to true
      mark_as_read(emailURL);
      
      // Add Reply and Archive buttons to new element inside of container
      element.appendChild(btnReply);
      element.appendChild(btnArchive);
      
      email.read == true ? element.appendChild(btnUnread) : false;
      if (email.read == true) {
        btnUnread.addEventListener('click', () => {
          mark_as_unread(emailURL);
          window.location.reload(true);
        });
      }
      
      
    } else {
      console.log(`error retrieving emailId ${emailId}`);
    }
  })
  .catch(error => {
      console.log(error);
  });
  return false;
};

// ------------------------------------------------------------------------------

// Mark email as read 

const mark_as_read = async (email) => {
  const csrftoken = getCookie('csrftoken');

  await fetch(email, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify({
      "read": true,
    }) 
  });
  return false;
};

// ------------------------------------------------------------------------------

// Mark email as unread 

const mark_as_unread = async (email) => {
  const csrftoken = getCookie('csrftoken');

  await fetch(email, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify({
      "read": false,
    }) 
  });
  return false;
};

// ------------------------------------------------------------------------------

// Archive and Unarchive: Allow users to archive and unarchive emails that they have received.

const archive_emails = async (email, emailId) => {
  const emailURL = `/emails/${emailId}`; 
  const csrftoken = getCookie('csrftoken');
  
  email.archived === false ? 
    await fetch(emailURL, {
    method: 'PUT',
    headers: {
            "Content-Type": "application/json",
            'X-CSRFToken': csrftoken,
        },
    body: JSON.stringify({
      "archived": true,
    })
  }) :
    await fetch(emailURL, {
    method: 'PUT',
    headers: {
            "Content-Type": "application/json",
            'X-CSRFToken': csrftoken,
        },
    body: JSON.stringify({
      "archived": false,
    })
  });
  return false;
};

// ------------------------------------------------------------------------------

const reply_email = async (message) => {
  // Load email template
  compose_email();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: "2-digit", minute: "2-digit" });
  const date = new Date();
  const day = date.getDate();
  const year = date.getFullYear();
  
  document.querySelector('#compose-recipients').value = message.sender;
  message.subject.includes('Re:') ? document.querySelector('#compose-subject').value =`${message.subject}` : document.querySelector('#compose-subject').value =`Re: ${message.subject}`;
  document.querySelector('#compose-body').value = `On ${monthNames[date.getMonth()]} ${day} ${year}, ${time} ${message.recipients} wrote:`;
  
};

// ------------------------------------------------------------------------------

// Send Mail: When a user submits the email composition form, add JavaScript code to actually send the email.

const send_mail = async (e) => {

  e.preventDefault();
  // Set query selectors for recipients, subject and body
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  const csrftoken = getCookie('csrftoken');

  // Add email components into one object
  const emailData = {
    recipients,
    subject,
    body
  };
  
  // Send a POST request to the URL
  await fetch('/emails', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(emailData) 
      })
      .then(response => response.json())
      .then(result => { 
        // Find 201 status message from views.py then load sent mailbox
        if ("message" in result) {
          console.log("message");
          load_mailbox('sent');
        }
    })
    .catch(error => {
      console.log(error);
    });
    return false;
};

// ------------------------------------------------------------------------------

// Cookie handler from Django docs
const getCookie = name => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};