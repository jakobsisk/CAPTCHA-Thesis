
/*  User rating - value from 1-100 - probability of user being bot/human
    0 - high probability user is bot
    50 - uncertain
    100 - low probability user is a bot
*/

// Descides how arithmetic progression is defined on mouse movement
const ARIT_LIMIT = 2;
// Defines how much arithmetic progression effects the user rating
const ARIT_STRNGTH = 2;

// Descides how geometric progression is defined on mouse movement
const GEO_LIMIT = 0.0010;
// Defines how much geometric progression effects the user rating
const GEO_STRNGTH = 5;

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
  $(document).off();
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

  if (page === 'new_captcha') { 

    // Measure time spent on entire form

    nameInput.on('focus', function() 
    {
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
    textInputs.each(inputTimer);

    // Mouse movement analysis

    var i = 0;
    var arrX = new Array();
    var arrY = new Array();

    $(document).on('mousemove', function(event)
    {
      // Handle every 10th mouse event (minimize performance impact)

      if ((i + 1) % 10 === 0) {
        arrX[(i + 1) / 10] = (-event.pageX > 0) ? -event.pageX : event.pageX;
        arrY[(i + 1) / 10] = (-event.pageY > 0) ? -event.pageY : event.pageY;

        // Analayze if mouse movements follow arithmetic progression
        aritProgrCheck(i, arrX, arrY);
        geoProgrCheck(i, arrX, arrY);
      }

      if (i >= 99) {
        diff = new Array();
        i = 0;
      }
      else {
        i++;
      }
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

function inputTimer(i, e)
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
  });
}

function aritProgrCheck(i, arrX, arrY) 
{
  var diffs = new Array();
  var diffsDiffs = new Array();

  if (i > 0 && ((i + 1) % 100) === 0) {

    // Get mean difference of mouse movement progression 
    //    or difference of difference of mouse coordinates
    // Low difference = arithmetic progression = bot-like behaviour

    var subtr;
    var diff;
    var diffsDiff;
    var meanX;
    var meanY;
    var mean;
    var sum = 0;

    // X mean difference

    for (j = 1; j < (i + 1) / 10; j++) {
      subtr = arrX[j + 1] - arrX[j];
      diff = (-subtr > 0) ? -subtr : subtr;
      diffs.push(diff);
    }

    for (j = 0; j < diffs.length - 1; j++) {
      subtr = diffs[j + 1] - diffs[j];
      diffsDiff = (-subtr > 0) ? -subtr : subtr;
      diffsDiffs.push(diffsDiff);
    }

    for (j = 0; j < diffsDiffs.length; j++) {
      sum += diffsDiffs[j];
    }

    meanX = sum / diffsDiffs.length;
    meanX = (-meanX > 0) ? -meanX: meanX;

    // Y mean difference

    for (j = 1; j < (i + 1) / 10; j++) {
      subtr = arrY[j + 1] - arrY[j];
      diff = (-subtr > 0) ? -subtr : subtr;
      diffs.push(diff);
    }

    for (j = 0; j < diffs.length - 1; j++) {
      subtr = diffs[j + 1] - diffs[j];
      diffsDiff = (-subtr > 0) ? -subtr : subtr;
      diffsDiffs.push(diffsDiff);
    }

    sum = 0;
    
    for (j = 0; j < diffsDiffs.length; j++) {
      sum += diffsDiffs[j];
    }

    meanY = sum / diffsDiffs.length;
    meanY = (-meanY > 0) ? -meanY: meanY;

    mean = (meanX + meanY) / 2;
    mean = Math.round(mean * 100) / 100; // Limit to 2 decimals

    console.log('DATA:');
    console.log('  Mouse movement difference - ' + mean);

    ratingChange = (mean < ARIT_LIMIT) ? -ARIT_STRNGTH : 1;
    modRating(ratingChange);
  }
}

function geoProgrCheck(i, arrX, arrY) 
{
  var quots = new Array();
  var quotsDiffs = new Array();

  if (i > 0 && ((i + 1) % 100) === 0) {

    // Get mean quotient of mouse movement progression 
    //    or difference of quotient of mouse coordinates
    // Low quotient = geometric progression = bot-like behaviour

    var quot;
    var quotsDiff;
    var meanX;
    var meanY;
    var mean;
    var sum = 0;

    // X mean quotient

    for (j = 1; j < (i + 1) / 10; j++) {
      quot = arrX[j + 1] / arrX[j];
      quots.push(quot);
    }

    for (j = 0; j < quots.length - 1; j++) {
      quotsDiff = quots[j + 1] - quots[j];
      quotsDiffs.push(quotsDiff);
    }

    for (j = 0; j < quotsDiffs.length; j++) {
      sum += quotsDiffs[j];
    }

    meanX = sum / quotsDiffs.length;

    // Y mean quotient

    for (j = 1; j < (i + 1) / 10; j++) {
      quot = arrY[j + 1] / arrY[j];
      quots.push(quot);
    }

    for (j = 0; j < quots.length - 1; j++) {
      quotsDiff = quots[j + 1] - quots[j];
      quotsDiffs.push(quotsDiff);
    }

    for (j = 0; j < quotsDiffs.length; j++) {
      sum += quotsDiffs[j];
    }

    meanY = sum / quotsDiffs.length;

    mean = (meanX + meanY) / 2;
    mean = Math.round(mean * 10000) / 10000; // Limit to 2 decimals
    mean = (-mean > 0) ? -mean : mean;

    console.log('DATA:');
    console.log('  Mouse movement quotient - ' + mean);

    ratingChange = (mean < GEO_LIMIT) ? -GEO_STRNGTH : 1;
    modRating(ratingChange);
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

  console.log('User data:');
  console.log('  Probability rating - ' + userRating);
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