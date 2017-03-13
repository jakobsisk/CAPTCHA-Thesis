  
var nameInput = $('#input_name');

// Remove old listeners (to avoid overlap)
nameInput.off();

nameInput.focus(function() 
{
  timeFormStart = new Date();

  console.log('ACTION:')
  console.log('  Focused name input.')
});