<?php
//********MySQLi connection file
require_once $_SERVER['DOCUMENT_ROOT'] . '/classes/cons/concfadminp.php';

function regUser($fname, $lname, $username, $email, $pswd){
        global $link;
        $pswd = sha1($pswd);

        $sql = "INSERT INTO $db.clients (cli_fname, cli_lname, cli_email, cli_password, cli_username) VALUES (?, ?, ?, ?, ?);";

            if ($stmt = $link->prepare($sql)) {
                $stmt->bind_param('sssss', $fname, $lname, $email, $pswd, $username);
                $success = $stmt->execute();

            if ($success) {
                $count = $link->affected_rows;
                $message = "<p>Thanks for registering, $fname! The administrator will have to manually
                                add content viewing permissions to your account. You'll be notified when
                                this happens.</p>";
            } else {

                $message = '<p>The insert failed.</p>';
            }

            $stmt->close(); 
        }

        return $message;
    }

    function members(){
        global $link;
        // A query that will result in multiple records being returned
        $sql = "SELECT cli_id, cli_fname, cli_lname, cli_username, cli_email FROM $db.clients";


        // Set up an if statement to insure the prepare was successful before proceeding
        // Initialize the prepared statement
        if ($stmt = $link->prepare($sql)) {

        // Run the prepared statement
        $stmt->execute();

        // Setup local variables that the results coming from the database will be
        // stored in using a bind_result function.
        $stmt->bind_result($uid, $first, $last, $user, $email);

        // Since multiple records are expected and each record has multiple fields
        // we will create two arrays to hold the data
        $person = array(); // Holds the individual record
        $people = array(); // Holds all of the records (a multi-dimensional array)

        // Setup a loop to retrieve the data for each record and store the
        // record into the larger array
        while ($stmt->fetch()) {

        // Store each field into the small array using a numeric index
         //$person[0] = $uid;
         $person[0] = $first;
         $person[1] = $last;
         $person[2] = $user;
         $person[3] = $email;
         $person[4] = '<a href="/classes/fdrel261/tools/?edit='.$uid.'">Edit</a>';
         $person[5] = '<a href="/classes/fdrel261/tools/?del='.$uid.'">Delete</a>';
        // Store the record (the small array) into the larger array (also using a
        // numeric index), repeat until there are no more records
         $people[] = $person;

        }// end the loop

        // End the prepared statement
        $stmt->close();

        
    }

    return $people;

    }
//************************Retrieve Record to Delete ***************************/
    function retrieveRecToDel($delid){
        global $link;
        $sql = "SELECT cli_id, cli_fname, cli_lname, cli_email FROM $db.clients WHERE cli_id = ?";


        if ($stmt = $link->prepare($sql)) {

            $stmt->bind_param('i', $delid);
            $stmt->execute();
            $stmt->bind_result($uid, $first, $last, $email);
            $person = array();

        while ($stmt->fetch()) {
            $person[0] = $first;
            $person[1] = $last;
            $person[2] = $email;
            $person[3] = $uid;
            $editflag = true;
        }

        $stmt->close();
    }

        return $person;
        
    }

//************************Delete Record ***************************************/
function delete($userid){
    global $link;
    $sql = "DELETE FROM $db.clients WHERE cli_id = ?";

 // Setup the prepared statement
 if($stmt = $link->prepare($sql)){
    $stmt->bind_param("i", $userid);
    $stmt->execute();
    $updateSuccess = $link->affected_rows;

    if($updateSuccess){
        $message = "Record deleted.";
        } else {
        $message = "Delete failed.";
        }
    }

    return $message;

}

//************************Retrieve Record to Edit *****************************/
function retrieveRecToEdit($userid){
    global $link;
    $sql = "SELECT cli_id, cli_fname, cli_lname, cli_email FROM $db.clients WHERE cli_id = ?";


    if ($stmt = $link->prepare($sql)) {

        $stmt->bind_param('i', $userid);

        $stmt->execute();
        $stmt->bind_result($uid, $first, $last, $email);
        $person = array();


        while ($stmt->fetch()) {
            $person[0] = $first;
            $person[1] = $last;
            $person[2] = $email;
            $person[3] = $uid;
        }

    $stmt->close();
    }

    return $person;
}

//************************Update Record ***************************************/
function editUser($fname, $lname, $email, $password, $userid){
    global $link;
    // IMPORTANT! Do not change the primary key value in the database
 if(!empty($password)){
 $sql = "UPDATE $db.clients SET cli_fname=?, cli_lname=?, cli_email=?, cli_password=? WHERE cli_id = ?";
 } else {
  $sql = "UPDATE $db.clients SET cli_fname=?, cli_lname=?, cli_email=? WHERE cli_id = ?";
 }

 // Setup the prepared statement
 if($stmt = $link->prepare($sql)){

  // Provide values for the question marks in the query
  if(isset ($password)){
      $password = sha1($password);
  $stmt->bind_param("ssssi", $fname, $lname, $email, $password, $userid);
  } else {
   $stmt->bind_param("sssi", $fname, $lname, $email, $userid);
  }

  //execute
  $stmt->execute();

  // Get the result from the database as to how many rows were changed, the answer should be 1
  $updateSuccess = $link->affected_rows;

  if($updateSuccess){
   $message = "The information for $fname $lname was successfully updated.";

   /* if i wanted to send an email notifiaction of changes:
   $to = $email;
   $from = 'From:coryfugate.com';
   $subject = "Change to your account on coryfugate.com has occured";
   $emailmessage = 'Your online profile account has been changed. If this is not correct, please let us know.';
   mail($to, $subject, $emailmessage, $from);
   */


  } else {
   $message = "Sorry, the update for $fname $lname failed.";
  }
 }
 // Send the confirmation to the user

    return $message;

}

function login($uname, $pswd){
        global $link;
        $sql = "SELECT cli_id, cli_fname, cli_lname, cli_email, level FROM $db.clients WHERE cli_username = ? AND cli_password = ?";
       

    if ($stmt = $link->prepare($sql)) {
        $pswd = sha1($pswd);
        $stmt->bind_param('ss', $uname, $pswd);
        
        $stmt->execute();
        $stmt->bind_result($uid, $first, $last, $email, $level);
        $person = array();
        

        while ($stmt->fetch()) {
            $person[0] = $uid;
            $person[1] = $first;
            $person[2] = $last;
            $person[3] = $email;
            $person[4] = $level;
        }
        


    $stmt->close();
    return $person;
    }

    
    
    }


?>
