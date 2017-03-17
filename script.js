
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

function refreshPage() {
  // Start with uncertain user rating
  userRating = 50;

  attempts = 0;
  successes = 0;
  timePageLoad = new Date();

  var h3s = $('h3');
  var lis = $('li', '#nav_main');
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

  lis.on('click', function () {
    var page = $(this).text();

    location.hash = page;

    refreshPage();
    toggleNav();
  });

  submitButton.on('click', submitForm);


  // --- New CAPTCHA --- //

  if (page === 'new_captcha') {

    // Measure time spent on entire form

    nameInput.on('focus', function () {
      timeFormStart = new Date();
    });

    submitButton.on('click', function () {
      timeFormEnd = new Date();
      timeForm = timeFormEnd - timeFormStart;

      console.log('DATA:');
      console.log('  Form time - ' + timeForm + 'ms');
    });


    // Measure time spent on each text input
    textInputs.each(inputTimer);

    // Mouse movement analysis

    var i = 0;
    var posX = 0;
    var posY = 0;
    var arrX = new Array();
    var arrY = new Array();

    $(document).on('mousemove', function (event) {

      // Handle every 10th mouse event (minimize performance impact)
      if ((i + 1) % 10 === 0) {

        // Check for patterns in mouse movements

        x = Math.round((-event.pageX > 0) ? -event.pageX : event.pageX); 
        y = Math.round((-event.pageY > 0) ? -event.pageY : event.pageY);
        arrX[((i + 1) / 10) - 1] = x;
        arrY[((i + 1) / 10) - 1] = y;

        // Analyze and compare last 10 recorded mousemove events
        if (i > 0 && ((i + 1) % 100) === 0) {
          patternCheck(arrX);
          patternCheck(arrY);
        }
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

function toggleNav() {
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

function inputTimer(i, e) {
  var timeInputStart;
  var timeInputEnd;
  var timeInput;

  $(e).on('focus', function () {
    timeInputStart = new Date();
  });
  $(e).on('blur', function () {
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

function patternCheck(arr, depth) {
  if (typeof depth == 'undefined') {
    depth = 0;
  }
 
  console.log('Pattern check.');
  console.log('Array: ' + arr);
  console.log('  DEPTH | OPERATION');

  var pattern = false;  
  var relation;
  var anomalies = 0;
  var anomaly;

  var operators = {
    'differences' : function (c1, c2) { return makePositive(c1 - c2) },
    'quotients' : function (c1, c2) { return c1 / c2 },
    'square roots' : function (c1, c2) { return Math.sqrt(c2) }
  };

  var i = 0;
  
  $.each(operators, function (key, op) {
    if (depth === 0 || i <= depth) {
      console.log('  ' + depth + '| Looking at ' + key + '.')
      relation = new Array();

      for (j = 0; j < arr.length - 1; j++) {
        relation.push(op(arr[j + 1], arr[j]));
      }

      anomalies = 0;

      for (j = 0; j < relation.length - 1; j++) {
        anomaly = (makePositive(relation[j + 1] - relation[j]) !== 0) ? 1 : 0;
        anomalies += anomaly;
      }

      if (anomalies === 0) {
        console.log('  Pattern found using ' + key + '.');
        pattern = true;
        return false; // Break loop
      }
      else if (anomalies > 0 && depth <= i && !pattern) {
        console.log('  No pattern found yet. Going deeper...')
        pattern = patternCheck(relation, (depth + 1));
        return !pattern;
      }
    } 
    else {
      console.log('  No pattern found. Going back up.');
      return false;
    }

    i++;
  });

  if (depth === 0 && pattern) {
    console.log('Pattern check complete. Found pattern.');
    console.log(' ');
  }  
  else if (depth === 0 & !pattern) {
    console.log('Pattern check complete. Found no pattern.');
    console.log(' ');
  }  

  return pattern;
}

function makePositive(num) {
  return (-num > 0) ? -num : num;
}

function modRating(val) {
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

function submitForm() {
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

function checkSuccess() {
  var success = false;

  // Validate form
  var formValid = false;
  var formItems = $('.form_item');
  var formItemsValid = 0;

  formItems.each(function (i, e) {
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

// Control functions //
// ----------------------------------------------- //

function testPatternCheck() {
  patternCheck([1, 2, 3, 4, 5, 6]); // Test arithmetic progression
  patternCheck([4, 5, 7, 11, 19, 35]); // Test geometric progrssion
  patternCheck([12, 29, 70, 147, 272, 457]); // Test power progression
}

// /Control functions //
// ----------------------------------------------- //

