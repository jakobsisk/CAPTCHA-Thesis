
var attempts = 0;
var successes = 0;

refreshPage();

function refreshPage() 
{
  // ----------------------------------------------- //
  // Event listeners //

  var h3s = $('h3');
  var lis = $('li','#nav_main');
  var submit_button = $('#input_submit');

  h3s.on('click', toggleNav);

  lis.on('click', function() 
  {
    var page = $(this).text();

    location.hash = page;

    refreshPage();
    toggleNav();
  });

  submit_button.on('click', submitForm);

  console.log('Listeners added.');

  // /Event listeners //
  // ----------------------------------------------- //

  if (location.hash == '') {
    location.hash = 'start_page';
  }

  var page = location.hash.substring(1);
  console.log('LOADING:');
  console.log('  ' + page);
  h3s.text(page);
}

function toggleNav() 
{
  var nav = $('#nav_main');
  var lis = $('li', '#nav_main');

  if (nav.css('height') == '0px') {
    // Show nav
    nav.css('height', (lis.length * 32) + 'px');
  }
  else {
    // Hide nav
    nav.css('height', 0);
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
  var formItems = $('.form_item');
  var formItemsValid = 0;

  for (var i = formItems.length; i--;) {
    var inputs = $('input', formItems[i]);
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