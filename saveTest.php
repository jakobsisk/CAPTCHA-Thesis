<?php

  $servername = "localhost";
  $username = "root";
  $password = "adamjaksi";
  $dbname = "CAPTCHA_Thesis";

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
      die("Connection failed: " . $conn->connect_error);
  } 

  $errorMsg = 'none';

  if (!empty($_POST['test'])) {
    $test = $_POST['test'];
  }
  else {
    $errorMsg = 'Attacker is not set.';
  }

  if (!empty($_POST['attacker'])) {
    $atkr = $_POST['attacker'];
  }
  else {
    $errorMsg = 'Attacker is not set.';
  }
  if (isset($_POST['attempts'])) {
    $atmp = $_POST['attempts'];
  }
  else {
    $errorMsg = 'Attempts is not set.';
  }
  if (isset($_POST['successes'])) {
    $succ = $_POST['successes'];
  }
  else {
    $errorMsg = 'Successes is not set.';
  }

  $q = "INSERT INTO tests_" . $test . " (attacker, attempts, successes) 
    VALUES ('" . $atkr . "','" . $atmp . "','" . $succ . "');";

  if ($conn->query($q) === TRUE) {
    $msg = "New record created successfully";
  } else {
    $errorMsg = "Error: " . $sql . "<br>" . $conn->error;
  }


  $response = [
    'error' => $errorMsg,
    'msg' => $msg
  ];

  echo json_encode($response);

  $conn->close();

?>