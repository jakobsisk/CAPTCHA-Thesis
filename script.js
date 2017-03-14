
/*  User rating - value from 1-100 - probability of user being bot/human
    0 - high probability user is bot
    50 - uncertain
    100 - low probability user is a bot
*/
var userRating;

var attempts;
var successes; 

var timePageLoad; 
var timeFormStart; 
var timeFormEnd; 
var timeForm;

refreshPage();

function refreshPage() 
{
  // Start with uncertain user rating
  userRating = 50; 

  attempts = 0;
  successes = 0;
  timePageLoad = new Date();

  var h3s = $('h3');
  var lis = $('li','#nav_main');
  var submitButton = $('#input_submit');
  var nameInput = $('#input_name');
  var textInputs = $('.input_text');
  
  if (location.hash == '') {
    location.hash = 'start_page';
  }

  var page = location.hash.substring(1);
  h3s.text(page);

  console.log('LOADING:');
  console.log('  ' + page);

  // ----------------------------------------------- //
  // Event listeners //

  // Remove all old listeners (to avoid overlap)
  h3s.off();
  lis.off();
  submitButton.off();
  nameInput.off();
  textInputs.off();

  h3s.on('click', toggleNav);

  lis.on('click', function() 
  {
    var page = $(this).text();

    location.hash = page;

    refreshPage();
    toggleNav();
  });

  submitButton.on('click', submitForm);

  // --- New CAPTCHA --- //

  // Measure time spent on entire form
  if (page === 'new_captcha') { 
    nameInput.on('focus', function() 
    {
      console.log('ACTION:');
      console.log('  Focused name input.')

      timeFormStart = new Date();
    });

    submitButton.on('click', function() 
    {
      timeFormEnd = new Date();
      timeForm = timeFormEnd - timeFormStart;

      console.log('DATA:');
      console.log('  Form time - ' + timeForm + 'ms');
    });

    // Measure time spent on each text input
    textInputs.each(function(i, e) 
    {
      var timeInputStart;
      var timeInputEnd;
      var timeInput;

      $(e).on('focus', function() 
      {
        timeInputStart = new Date();
      });
      $(e).on('blur', function() 
      {
        timeInputEnd = new Date();
        timeInput = timeInputEnd - timeInputStart;

        console.log('DATA:');
        console.log('  Input "' + $(e).attr('name') + '" time - ' + timeInput + 'ms');

        var ratingChange = 0;
        if ($(e).val() != 'undefined' && $(e).val() != '') {
          // If user finishes input to quickly
          if (timeInput < 1000) {
            ratingChange = -5;
          }
          // User finished input slowly
          else {
            ratingChange = 5;
          }
        }
        // If input is finished empty
        else if (timeInput > 1000) {
          ratingChange = 10;
        }
        modRating(ratingChange);

        console.log('User data:');
        console.log('  Probability rating - ' + userRating);
      });
    });
  }

  // --- /New CAPTCHA --- //

  // /Event listeners //
  // ----------------------------------------------- //
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

function modRating(val) 
{
  userRating += val;

  // Keep rating between 0-100
  if (userRating > 100) {
    userRating = 100;
  }
  else if (userRating < 0) {
    userRating = 0;
  }
}

function submitForm() 
{
  console.log('ACTION:'); 
  console.log('  Activated submit button.');

  if (checkSuccess()) {
    successes++;
    console.log('  Completed form.');
  }
  else {
    console.log('  Failed to complete form.');
  }
  attempts++;
  console.log('STATUS:');
  console.log('  Attemps - ' + attempts);
  console.log('  Successes - ' + successes);
  console.log('  Failures - ' + (attempts - successes));
}

function checkSuccess() 
{
  var success = false;

  // Validate form
  var formValid = false;
  var formItems = $('.form_item');
  var formItemsValid = 0;

  formItems.each(function(i, e) 
  {
    var inputs = $('input', e);
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
  });

  formValid = (formItemsValid === formItems.length) ? true : false;

  // --- New CAPTCHA --- //

  

  // --- /New CAPTCHA --- //

  success = (formValid && userRating > 50) ? true : false;

  return success;
}