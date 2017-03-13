console.log('Script loaded.');

var attempts = 0;
var successes = 0;
var path = window.location.pathname;
console.log(path); 

$.ajax({
  type: 'POST',
  url: 'index.php',
  data:
  {
    action: encodeURI(action),
    query: encodeURI(query),
    startDate: encodeURI(startDate),
    endDate: encodeURI(endDate)
  },
  success: returnedBookings,
  error: errormsg,
  dataType: 'json'
});


elems = document.getElementsByTagName('h3');

for (var i = elems.length; i--;) {
  elems[i].innerHTML = '';
}

// ----------------------------------------------- //
// Event listeners //

var elems = document.getElementsByTagName('h3');

for (var i = elems.length; i--;) {
  elems[i].addEventListener('click', pageNav, false);
}

var el = document.getElementById('input_submit');
el.addEventListener('click', submitForm, false);

console.log('Listeners added.');

// /Event listeners //
// ----------------------------------------------- //

function pageNav(event) {
  var el = event.target.nextElementSibling;

  while (el.nodeName != 'NAV') {
    el = el.nextElementSibling;
  }

  if (el.style.height == '0px') {
    var lis = el.getElementsByTagName('li');

    el.style.height = (lis.length * 60) + 'px';
  }
  else {
    el.style.height = '0';
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