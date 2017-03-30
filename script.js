
/*  User rating - value from 1-100 - probability of user being bot/human
    0 - high probability user is bot
    50 - uncertain
    100 - low probability user is a bot
*/

// Operators used to analyze relations between coordinates in mouse movements 
const PATTERN_OPERATORS = {
  'differences' : function (c1, c2) { return makePositive(c1 - c2) },
  'quotients' : function (c1, c2) { return c1 / c2 },
  'square roots' : function (c1, c2) { return Math.sqrt(c2) }
};

var attempts = 0;
var successes = 0;

var mouseMoved = false;

refreshPage();

function refreshPage() {

  // Reset form
  $('form').trigger('reset');

  mouseMoved = false;

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
    resetCounters();
    toggleNav();
  });

  submitButton.on('click', submitForm);


  // --- New CAPTCHA --- //

  if (page === 'new_captcha') {

    console.log('Rating change: ');
    console.log('  Cause - Reset');
    // Start with uncertain user rating
    var ratingOp = 'reset';
    var postData = {
      'op': ratingOp
    };

    $.ajax({
      url: "rating.php",
      type: "post",
      data: postData,
      dataType: 'json',
      success: ratingChangeSuccess,
      error: ajaxFailure
    });

    // Mouse movement analysis

    var i = 0;
    var pos = {
      x: 0,
      y: 0
    };
    var posArr = {
      x: [],
      y: []
    };
    var pattern = false;

    $(document).on('mousemove', function (event) {

      mouseMoved = true;

      // Handle every 10th mouse event (minimize performance impact)
      if ((i + 1) % 10 === 0) {

        // Check for patterns in mouse movements

        pos.x = Math.round((-event.pageX > 0) ? -event.pageX : event.pageX); 
        pos.y = Math.round((-event.pageY > 0) ? -event.pageY : event.pageY);
        posArr.x.push(pos.x);
        posArr.y.push(pos.y);
        
        // Analyze and compare last 10 recorded mousemove events
        if (i > 0 && ((i + 1) % 100) === 0) {
          console.log('Mouse movement:');
          pattern = patternCheck('x', posArr.x, PATTERN_OPERATORS) || patternCheck('y', posArr.y, PATTERN_OPERATORS);
        }
      }

      if (i >= 99) {
        posArr.x = [];
        posArr.y = [];
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

function resetCounters() 
{
  attempts = 0;
  successes = 0;
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

function patternCheck(arrName, arr, operators, depth) 
{
  console.log('  Pattern check ');
  console.log('  Array - ' + arrName);

  var pattern = false;
  var random = false;
  var status = '';

  // Relations (relative to operator) between numbers in array
  var relation;
  var relations;

  // Anomaly: Difference between relations. 
  // 0 = no difference = no anomaly = pattern
  var anomaly;
  var anomaliesTotal;

  // If no depth is passed set depth to 0
  if (typeof depth == 'undefined') {

    // console.log('Pattern check.');

    depth = 0;
  }

  $.each(operators, function (key, op) {

    console.log('  Depth - ' + depth);
    console.log('  Operation - ' + key);

    relation = 0;
    relations = [];

    anomaly = 0;
    anomaliesTotal = 0;

    for (i = 0; i < arr.length - 1; i++) {
      relation = op(arr[i + 1], arr[i]);
      relations.push(relation);

      if (i > 0) {
        anomaly = makePositive(relations[i] - relations[i - 1]);
        anomaliesTotal += anomaly;
      }
    }
    
    // Look for randomized sequence
    if (depth > 0 && key == 'differences' && arrName.substr(2) == 'differences') {
      console.log(anomaliesTotal / (relations.length - 1));
      if (Math.round(anomaliesTotal / (relations.length - 1)) > 100) {
        random = true;

        console.log('  Found likely random sequence.');
      }
    }

    // If there is pattern or if numbers seem random
    if (anomaliesTotal === 0) {
      pattern = true;

      console.log('Found pattern');
    }
    else if (!random && depth === 0) {
      pattern = patternCheck(arrName + '_' + key, relations, operators, depth + 1);
    }

    if (pattern || random) {
      return false;
    }
  });

  var ratingChange = 0; 

  if (depth === 0) {
    if (pattern) {
      ratingChange = -30;
    }
    else if (random) {
      ratingChange = -15;
    }
    else {
      ratingChange = 5;
    }

    console.log('Rating change: ');
    console.log('  Cause - pattern check.');

    var ratingOp = 'mod';
    var postData = {
      'op': ratingOp, 
      'change': ratingChange
    };

     $.ajax({
        url: "rating.php",
        type: "post",
        data: postData,
        dataType: 'json',
        success: ratingChangeSuccess,
        error: ajaxFailure
    });
  }

  return pattern || random;
}

function makePositive(num) 
{
  return (-num > 0) ? -num : num;
}

function submitForm() 
{
  console.log('ACTION:');
  console.log('  Activated submit button.');

  var page = location.hash.substr(1);  
  var success;

  if (page == 'baseline') { // --- Baseline --- //
    // Standard form check
    success = formCheck();

    if (success) {
      successes++;
      console.log('  Completed form.');
    }
    else {
      console.log('  Failed to complete form.');
    }

    attempts++;

    var postData = {
      'test': page,
      'attacker': $('#input_name').val(),
      'attempts': attempts,
      'successes': successes
    };

    saveTest(postData); 
    
    updateStatus();

    refreshPage();
  }
  else if (page == 'new_captcha') // --- New CAPTCHA --- //
  {
    var rating; 

    success = formCheck();

    getRating().done(function(response)
    {
      if (!phpErrorCheck(response)) {
        console.log('Rating check:');
        rating = response['rating'];
        console.log('Rating: ' + rating);
        
        if (!mouseMoved) {
          console.log('Rating change:');
          console.log('  Cause - No mouse movement.');
          
          rating += -10;
        } 
        else {
          console.log('Rating change:');
          console.log('  Cause - Some mouse movement.');

          rating += 5;
        }
        
        success = success && ((rating > 50) ? true : false);
      }

      if (success) {
      successes++;
      console.log('  Completed form.');
      }
      else {
        console.log('  Failed to complete form.');
      }

      attempts++;

      var postData = {
        'test': page,
        'attacker': $('#input_name').val(),
        'attempts': attempts,
        'successes': successes
      };

      saveTest(postData); 

      updateStatus();

      refreshPage();
    });
  }
}

function updateStatus()
{
  console.log('STATUS:');
  console.log('  Attemps - ' + attempts);
  console.log('  Successes - ' + successes);
  console.log('  Failures - ' + (attempts - successes));

  $('#status_attempts_value').text(attempts);
  $('#status_successes_value').text(successes);
  $('#status_failures_value').text(attempts - successes);
}

function formCheck() 
{
  console.log('Form check:');

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

  return formValid;
}

// Control //
// ----------------------------------------------- //

function testPatternCheck(arr) {
  patternCheck('test', arr, PATTERN_OPERATORS);
}


// AJAX //
// ----------------------------------------------- //

function getRating() {
  var ratingOp = 'get';
  var postData = {
    'op': ratingOp
  };

  return $.ajax({
    url: "rating.php",
    type: "post",
    data: postData,
    dataType: 'json',
    error: ajaxFailure
  });
}

function ratingChangeSuccess(response)
{
  if (!phpErrorCheck(response)) {
    console.log('Rating: ' + response['rating']); 
  }
}

function saveTest(postData) {
  $.ajax({
    url: "saveTest.php",
    type: "post",
    data: postData,
    dataType: 'json',
    success: saveTestSuccess,
    error: ajaxFailure
  });
}

function saveTestSuccess(response) 
{
  if (!phpErrorCheck(response)) {
    console.log(response['msg']);
  }
}

function phpErrorCheck(response) 
{
  var error = false;

  if (response['error'] != 'none') {
    console.log('PHP error: ');
    console.log('  ' + response['error']);

    error = true;
  }

  return error;
}

function ajaxFailure(jqXHR, textStatus, errorThrown)
{
  console.log(jqXHR);
  console.log(textStatus);
  console.log(errorThrown);
}