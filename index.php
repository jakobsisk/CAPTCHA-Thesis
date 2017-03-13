<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="utf-8">

  <title>Workshop: CAPTCHA Experiment - Template</title>
  <meta name="description" content="">
  <meta name="author" content="Jakob Sisk">

  <link rel="stylesheet" href="style.css">

  <!--[if lt IE 9]>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script>
  <![endif]-->
</head>

<body>
 
  <header>
    <h1>Workshop</h1>
    <h2>The robustness of a new non-visible CAPTCHA</h2>
    <h3>error<!-- js --></h3>

    <nav> <!-- Expanding -->
      <ul>
        <li>start_page</li>
        <li>baseline</li>
        <li>new_captcha</li>
      </ul>
    </nav>
  </header>

  <form>
    <div class="form_item">
      <label for="input_name">Name </label>
      <input type="text" name="name" placeholder="John Doe" id="input_name">
    </div>
    
    <div class="form_item">
      <label for="input_email">Email </label>
      <input type="email" name="email" placeholder="johndoe@email.com" id="i
    nput_email">
    </div>

    <div class="form_item">
      <label for="input_pswd">Password </label>
      <input type="password" name="pswd" placeholder="Password" id="input_pswd">
    </div>

    <div class="form_item">
      <label for="input_tel">Telephone </label>
      <input type="tel" name="tel" placeholder="+46 70 444 55 66" id="input_tel">
    </div>

    <div class="form_item">
      <label>Have you seen Battlestar Galactica?</label>
      <div class="radio_options_wrapper">
        <input type="radio" name="bsg" value="true" id="input_bsg_y"> 
        <label for="input_bsg_y" class="radio_option_label">Yes</label>
        <input type="radio" name="bsg" value="false" id="input_bsg_n">
        <label for="input_bsg_n" class="radio_option_label">No</label>
      </div>
    </div>

    <button type="button" id="input_submit">Submit</button>
  </form>

  <footer>
    Created by Jakob Sisk
  </footer>


  <script src="script.js"></script>

</body>
</html>