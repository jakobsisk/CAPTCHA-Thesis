
/*  User rating - value from 1-100 - probability of user being bot/human
    0 - high probability user is bot
    50 - uncertain
    100 - low probability user is a bot
*/

// Operators used in pattern recognition
const PATTERN_OPERATORS = {
  differences: function (c1, c2) { return +(Math.abs(c1 - c2).toFixed(3)) },
  quotients: function (c1, c2) { return (+(c1 / c2) != Infinity) ? +((c1 / c2).toFixed(3)) : 0 },
  squareRoot: function (c1, c2) { return +(Math.sqrt(c2).toFixed(3)) }
};

var mousemove_enable = true;
// How often (ms) should mousemovements be registered (can impact performance)
const MOUSEMOVE_TICK = 10;
// How many coordinates should be sent to analysis
const MOUSEMOVE_SIZE = 5;
// How often should coordinates be sent to analysis
const MOUSEMOVE_FREQ = 5;
// Perform test on mouse movements
const MOUSEMOVE_TEST = true;
// Test sequence size
const MOUSEMOVE_TEST_SIZE = 500;

var keystrokes_enable = true;
// How many keystroke timestamps should be sent to analysis
const KEYSTROKES_SIZE = 3;
// How often should keystrokes be sent for analysis
const KEYSTROKES_FREQ = 3;

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

  // --- Event listeners --- //

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

  // --- / Event listeners --- //


  // ----------------------------------------------- //
  // New CAPTCHA //

  if (page === 'new_captcha') {

    console.log('Rating change: ');
    console.log('  Cause - Reset');
    // Start with uncertain user rating
    var ratingOp = 'reset';
    var postData = {
      op: ratingOp
    };

    $.ajax({
      url: "rating.php",
      type: "post",
      data: postData,
      dataType: 'json',
      success: ratingChangeSuccess,
      error: ajaxFailure
    });

    // --- Event listeners --- //

    // Mouse movement analysis
    
    var pos = {
      x: 0,
      y: 0
    };
    var posArr = {
      x: [],
      y: []
    };

    var mousemoveCount = 0;
    var patterns = 0;
    var i = 0;

    $(document).on('mousemove', function (event) {
      if (mousemove_enable) {
        mouseMoved = true;
        mousemoveCount++;

        if (MOUSEMOVE_TEST) {
          console.log(mousemoveCount);
        }

        // Handle every nth mouse event (minimize performance impact)
        if (mousemoveCount % MOUSEMOVE_TICK === 0) {

          if (MOUSEMOVE_TEST) {
            console.log(i + '-' + mousemoveCount);
          }
          
          // Check for patterns in mouse movements

          pos.x = Math.round((-event.pageX > 0) ? -event.pageX : event.pageX, 0);
          pos.y = Math.round((-event.pageY > 0) ? -event.pageY : event.pageY, 0);
          posArr.x.push(pos.x);
          posArr.y.push(pos.y);

          // Analyze and compare last 10 recorded mousemove events
          if (i > 0 && ((i + 1) % MOUSEMOVE_SIZE) === 0) {
            if (patternCheck('Mouse coordinates - x', posArr.x, PATTERN_OPERATORS)) {
              
              patterns++;
            }
            if (patternCheck('Mouse coordinates - y', posArr.y, PATTERN_OPERATORS)) {
              patterns++;
            }
          }

          if ((i + 1) === MOUSEMOVE_FREQ) {
            posArr.x = [];
            posArr.y = [];
            i = 0;
          }
          else {
            i++;
          }
          
          var iTotal = mousemoveCount / 10;
          if (MOUSEMOVE_TEST && iTotal === MOUSEMOVE_TEST_SIZE) {
            alert('[TEST]');
            alert('  Sequence - mouse movements');
            alert('  Interval size - ' + MOUSEMOVE_SIZE);
            alert('  Intervals amount - ' + iTotal / MOUSEMOVE_SIZE * 2);
            alert('  Patterns found - ' + patterns);
            alert('  Successrate - ' + ((patterns / (iTotal / MOUSEMOVE_SIZE)) * 100) + '%');

            mousemove_enable = false;
          }
        }
      }
    });

    // Keystroke analysis  

    if (keystrokes_enable) {
      var keystrokeTimes = [];

      var keypressCount = 0;

      $(document).keypress(function (event) {
        var keystrokeTime = new Date();
        keystrokeTimes.push(keystrokeTime);

        if (keypressCount >= KEYSTROKES_FREQ) {
          console.log('');
          console.log('[Registering keystrokes]');

          operators = {
            differences: PATTERN_OPERATORS.differences
          };

          patternCheck('keystrokes', keystrokeTimes, operators);

          if (keypressCount >= KEYSTROKES_SIZE) {
            keystrokeTimes = [];
            keypressCount = 0;
          }
        }
        else {
          keypressCount++;
        }
      });
    }

    // --- / Event listeners --- //
  }

  // / New CATPTCHA //
  // ----------------------------------------------- //
}

function resetCounters() {
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

function patternCheck(arrName, arr, operators, depth) {
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

    console.log('');
  }

  $.each(operators, function (key, op) {

    console.log('[Pattern check]');
    console.log('  Array - ' + arrName);
    console.log('  Array - ' + arr);
    console.log('  Depth - ' + depth);
    console.log('  Operation - ' + key);

    relation = 0;
    relations = [];

    anomaly = 0;
    anomaliesTotal = 0;

    for (i = 0; i < arr.length - 1; i++) {
      relation = op(arr[i + 1], arr[i]);

      if (arrName == 'keystrokes' || arrName.substr(0, 9) == 'keystrokes') {
        relation = +(relation.toFixed(3));
      }
      relations[i] = relation;

      if (relations[i - 1]) {
        anomaly = Math.abs(relation - relations[i - 1]);
        anomaliesTotal += anomaly;
      }
    }

    var avgAnomaly = +(anomaliesTotal / relations.length).toFixed(3);
    console.log('---ANOMALYTOTAL: ' + anomaliesTotal);
    console.log('---AVERAGE ANOMALY: ' + avgAnomaly);

    // Look for randomized sequence
    if (depth > 0 && key == 'differences') {
      if (avgAnomaly > 100) {
        random = true;

        console.log('Found likely random sequence.');
      }
    }

    // If there is pattern or if numbers seem random
    if (avgAnomaly === 0) {
      pattern = true;

      console.log('Found pattern');
    }
    else if (!random && depth === 0) {
      console.log('>> Going deeper');

      pattern = patternCheck(arrName + '_' + key, relations, operators, depth + 1);

      console.log('>> Going up');
    }

    if (pattern || random) {
      return false;
    }
    else {
      console.log('No pattern found.');
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

    console.log('[Rating change] ');
    console.log('  Cause - pattern check.');
    console.log('  Amount - ' + ratingChange);

    var ratingOp = 'mod';
    var postData = {
      op: ratingOp,
      change: ratingChange
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

function submitForm() {
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
      test: page,
      attacker: $('#input_name').val(),
      attempts: attempts,
      successes: successes
    };

    saveTest(postData);

    updateStatus();

    refreshPage();
  }
  else if (page == 'new_captcha') { // --- New CAPTCHA --- //
    var rating;

    success = formCheck();

    getRating().done(function (response) {
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
        test: page,
        attacker: $('#input_name').val(),
        attempts: attempts,
        successes: successes
      };

      saveTest(postData);

      updateStatus();

      refreshPage();
    });
  }
}

function updateStatus() {
  console.log('STATUS:');
  console.log('  Attemps - ' + attempts);
  console.log('  Successes - ' + successes);
  console.log('  Failures - ' + (attempts - successes));

  $('#status_attempts_value').text(attempts);
  $('#status_successes_value').text(successes);
  $('#status_failures_value').text(attempts - successes);
}

function formCheck() {
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


// AJAX //
// ----------------------------------------------- //

function getRating() {
  var ratingOp = 'get';
  var postData = {
    op: ratingOp
  };

  return $.ajax({
    url: "rating.php",
    type: "post",
    data: postData,
    dataType: 'json',
    error: ajaxFailure
  });
}

function ratingChangeSuccess(response) {
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

function saveTestSuccess(response) {
  if (!phpErrorCheck(response)) {
    console.log(response['msg']);
  }
}

function phpErrorCheck(response) {
  var error = false;

  if (response['error'] != 'none') {
    console.log('PHP error: ');
    console.log('  ' + response['error']);

    error = true;
  }

  return error;
}

function ajaxFailure(jqXHR, textStatus, errorThrown) {
  console.log(jqXHR);
  console.log(textStatus);
  console.log(errorThrown);
}


// Control //
// ----------------------------------------------- //

function testPatternCheck(type, interv, n) {
  var name;
  var f;

  switch (type) {
    case 'arit':
      name = 'Arithmetic sequence';
      f = function (x, tail) {
        return x + 5
      };

      break;
    case 'geo':
      name = 'Geometric sequence';
      f = function (x, tail) {
        return x * 5
      };

      break;
    case 'sq':
      name = 'Square sequence';
      f = function (x, tail) {
        return x * x
      };

      break;

    case 'exp':
      name = 'Exponential sequence';
      f = function (x, tail) {
        return (x * x * x) + (2 * x) + 7
      };

      break;

    case 'fib':
      name = 'Fibonacci sequence';
      f = function (x, tail) {
        var prev = (x <= 1) ? 1 : tail[x - 2];
        var prev2 = (x <= 2) ? 0 : tail[x - 3]
        
        return prev + prev2;
      };

      break;

    case 'rand':
      name = 'Random sequence';
      f = function (x, tail) {
        return Math.floor((Math.random() * 1000) + 1);
      }

      break;
  }

  var seq = [];
  var tail = [];
  var patterns = 0;
  var i;
  var term;

  for (i = 1; i <= (n * interv); i++) {
    term = f(i, tail);
    seq.push(term);
    tail.push(term);

    if (i % interv === 0) {
      console.log('----');
      console.log('Interval #' + i / interv);
      console.log('----');

      if (patternCheck(name, seq, PATTERN_OPERATORS)) {
        patterns++;
      }

      seq = [];
    }
  }

  console.log('[TEST]');
  console.log('  Sequence - ' + name);
  console.log('  Function - ' + f);
  console.log('  Interval size - ' + interv);
  console.log('  Intervals amount - ' + n);
  console.log('  Patterns found - ' + patterns);
  console.log('  Successrate - ' + ((patterns / n) * 100) + '%');
}

function testPatternCheckCustom(arr) {
  console.log('');
  console.log('[TEST]');
  console.log('  Custom sequence');
  patternCheck('Custom sequence', arr, PATTERN_OPERATORS);
}

function testDeCastel(fidel, interv) {
  var seq = [];

  var x1 = 100;
  var x2 = 300;
  var x3 = 830;

  seq.push(x1);

  var pxa1 = (x2 - x1) / fidel;
  var pxa2 = (x3 - x2) / fidel;

  var p5x = x1;

  var p6x = x2;

  var p7x;

  stz = 1.0 / fidel;

  var lf = 0.0;
  var hf = 1.0;

  var lx = x1;

  var patterns = 0;

  for (var i = 1; i <= fidel; i++) {
    lf += stz;
    hf -= stz;

    p7x = (p6x * lf) + (p5x * hf);

    p5x += pxa1;

    p6x += pxa2;

    if (lx < x2 && p7x > x2) {
      seq.push(x2);
    }

    lx = p7x;

    seq.push(p7x.toFixed(3));

    if (i === fidel) {
      seq.push(x3);
    }

    if (i % interv === 0) {
      console.log('----');
      console.log('Interval #' + i / interv);
      console.log('----');

      if (patternCheck('De Casteljaus algorithm', seq, PATTERN_OPERATORS)) {
        patterns++;
      }

      console.log(seq);
      seq = [];
    }
  }

  console.log('[TEST]');
  console.log('  Sequence - De Casteljaus algorithm');
  console.log('  Interval size - ' + interv);
  console.log('  Intervals amount - ' + (i - 1) / interv);
  console.log('  Patterns found - ' + patterns);
  console.log('  Successrate - ' + ((patterns / ((i - 1) / interv)) * 100) + '%');
}

function simulateKeypress(interval) {
  setInterval(function () {
    $(document).keypress();
  }, interval);
}
