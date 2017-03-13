
var attempts = 0;
var successes = 0;

refreshPage();

// ----------------------------------------------- //
// Event listeners //

var elems = document.getElementsByTagName('h3');

for (var i = elems.length; i--;) {
  elems[i].addEventListener('click', toggleNav, false);
}

var nav = document.getElementsByTagName('nav')[0];
elems = nav.getElementsByTagName('li');

for (var i = elems.length; i--;) {
  elems[i].addEventListener('click', function(event) 
  {
    var page = event.target.innerHTML;

    location.hash = page;

    refreshPage();
  }, false);
}

var el = document.getElementById('input_submit');
el.addEventListener('click', submitForm, false);

console.log('Listeners added.');

// /Event listeners //
// ----------------------------------------------- //

function refreshPage() 
{
  if (location.hash == '') {
    location.hash = 'start_page';
  }

  if (location.hash === '#start_page') {
    console.log('Loading start_page');
    elems = document.getElementsByTagName('h3');

    for (var i = elems.length; i--;) {
      elems[i].innerHTML = 'start_page';
    }
  }
  else if (location.hash === '#baseline') {
    console.log('Loading baseline');
    elems = document.getElementsByTagName('h3');

    for (var i = elems.length; i--;) {
      elems[i].innerHTML = 'baseline';
    }
  }
  else if (location.hash === '#new_captcha') {
    console.log('Loading new_captcha');
    elems = document.getElementsByTagName('h3');

    for (var i = elems.length; i--;) {
      elems[i].innerHTML = 'new_captcha';
    }
  }
}

function toggleNav(event) 
{
  var el = event.target.nextElementSibling;

  while (el.nodeName != 'NAV') {
    el = el.nextElementSibling;
  }

  if (el.style.height == '0px' || el.style.height == '') {
    // Show nav
    var lis = el.getElementsByTagName('li');

    el.style.height = (lis.length * 32) + 'px';
    console.log('Showing navigation.');
  }
  else {
    // Hide nav
    el.style.height = '0';
    console.log('Hiding navigation.');
  }
}

function submitForm() 
{
  console.log('ACTION:'); 
  console.log('  [Activate] Submit button');

  if (validateForm()) {
    successes++;
    console.log('Form is valid.');
  }
  else {
    console.log('Form is not valid.');
  }
  attempts++;
  console.log('STATUS:');
  console.log('  Attemps - ' + attempts);
  console.log('  Successes - ' + successes);
}

function validateForm() 
{
  var validate = false;
  var formItems = document.getElementsByClassName('form_item');
  var formItemsValid = 0;

  for (var i = formItems.length; i--;) {
    inputs = formItems[i].getElementsByTagName('input');
    var inputValid = false;

    for (var j = inputs.length; j--;) {
      var input = inputs[j];

      if (input.type == 'radio' && input.checked) {
        inputValid = true;
      }
      else if (input && input.value) {
        inputValid = true;
      }
    }
    if (inputValid) {
      formItemsValid++;
    }
  }

  if (formItemsValid === formItems.length) {
    validate = true;
  }
  return validate;
}