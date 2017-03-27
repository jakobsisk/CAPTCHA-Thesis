<?php

  session_start();

  $errorMsg = 'none';

  if (!empty($_POST['op'])) {
    $op = $_POST['op'];
  }
  else {
    $errorMsg = 'Op is not set.';
  }

  if ($op == 'reset') {
    $_SESSION['rating'] = 50;
  }
  else if ($op == 'mod') {
    if (isset($_POST['change'])) {
      $change = $_POST['change'];

      $_SESSION['rating'] = $_SESSION['rating'] + $change;

      if ($_SESSION['rating'] > 100) {
        $_SESSION['rating'] = 100;
      }
      else if ($_SESSION['rating'] < 0) {
        $_SESSION['rating'] = 0;
      }
    }
    else {
      $errorMsg = 'Change is not set.';
    }
  }

  $response = [
    'error' => $errorMsg,
    'rating' => $_SESSION['rating']
  ];

  echo json_encode($response);
?>