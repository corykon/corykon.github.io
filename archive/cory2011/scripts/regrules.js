/* 
 * Rules to validate the login page
 */

$(document).ready(function() {
 $("#regform").validate({
  submitHandler:function(form) {
   SubmittingForm();
  },
  rules: {
   txtfname: {
    required: true
   },
   txtlname: {
    required: true
   },
   username: {
    required: true
   },

   emailaddress: {
    required: true,
    email: true
   },
   pswd: {
    required: true,
    minLength:8
   }
  },
  messages: {
   txtfname: "Please provide your first name.",
   txtlname: "Please provide your last name.",
   username: "Please provide a username.",
   emailaddress: "Please enter your email address.",
   pswd: "Please enter your password of at least 8 characters."
  }
 });
})

