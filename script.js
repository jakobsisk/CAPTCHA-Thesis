
var attempts, successes, timePageLoad, timeFormStart;

refreshPage();

function refreshPage() 
{
  attempts = 0;
  successes = 0;
  timePageLoad = new Date();
  timeFormStart;

  // ----------------------------------------------- //
  // Event listeners //

  var h3s = $('h3');
  var lis = $('li','#nav_main');
  var submitButton = $('#input_submit');

  // Remove all old listeners (to avoid overlap)
  h3s.off();
  lis.off();
  submitButton.off();
  nameInput.off();

  h3s.on('click', toggleNav);

  lis.on('click', function() 
  {
    var page = $(this).text();

    location.hash = page;

    refreshPage();
    toggleNav();
  });

  submitButton.on('click', submitForm);

  // /Event listeners //
  // ----------------------------------------------- //

  if (location.hash == '') {
    location.hash = 'start_page';
  }

  console.log('LOADING:');
  console.log('  ' + page);

  var page = location.hash.substring(1);
  h3s.text(page);

  if (page === 'new_captcha') {
    $.getScript("new_captcha.js", function()
    {
      console.log("LOADED:");
      console.log('  new_captcha.js');
    });
  }
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
  console.log('  Activated submit button.');

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