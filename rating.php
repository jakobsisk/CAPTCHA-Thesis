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