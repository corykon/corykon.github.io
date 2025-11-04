<?php
//********MySQLi connection file
require_once $_SERVER['DOCUMENT_ROOT'] . '/cons/concfadminp.php';

function addContent($title, $text){
        global $link;

        $sql = "INSERT INTO $db.bofrcontent (bofr_title, bofr_text) VALUES (?, ?);";

            if ($stmt = $link->prepare($sql)) {
                $stmt->bind_param('ss', $title, $text);
                $success = $stmt->execute();

            if ($success) {
                $count = $link->affected_rows;
                $message = '<p>Content Inserted into Database.</p>';
            } else {

                $message = '<p>The insert failed.</p>';
            }

            $stmt->close(); 
        }

        return $message;
    }

    function content(){
        global $link;
        // A query that will result in multiple records being returned
        $sql = "SELECT bofr_id, bofr_title FROM $db.bofrcontent";


        // Set up an if statement to insure the prepare was successful before proceeding
        // Initialize the prepared statement
        if ($stmt = $link->prepare($sql)) {

        // Run the prepared statement
        $stmt->execute();

        // Setup local variables that the results coming from the database will be
        // stored in using a bind_result function.
        $stmt->bind_result($bofr_id, $bofrcontent);

        // Since multiple records are expected and each record has multiple fields
        // we will create two arrays to hold the data
        $contentitem = array(); // Holds the individual record
        $contentlist = array(); // Holds all of the records (a multi-dimensional array)

        // Setup a loop to retrieve the data for each record and store the
        // record into the larger array
        while ($stmt->fetch()) {

        // Store each field into the small array using a numeric index
         //$person[0] = $uid;
         $contentitem[0] = $bofr_id;
         $contentitem[1] = $bofrcontent;
         $contentitem[2] = '<a href="/classes/fdrel261/history/?edit='.$bofr_id.'">Edit</a>';
         $contentitem[3] = '<a href="/classes/fdrel261/history/?del='.$bofr_id.'">Delete</a>';
        // Store the record (the small array) into the larger array (also using a
        // numeric index), repeat until there are no more records
         $contentlist[] = $contentitem;

        }// end the loop

        // End the prepared statement
        $stmt->close();

        
    }

    return $contentlist;

    }
//************************Retrieve Record to Delete ***************************/
    function retrieveContentToDel($bofrid){
        global $link;
        $sql = "SELECT bofr_id, bofr_title FROM $db.bofrcontent WHERE bofr_id = ?";


        if ($stmt = $link->prepare($sql)) {

            $stmt->bind_param('i', $bofrid);
            $stmt->execute();
            $stmt->bind_result($bid, $title);
            $contentitem = array();

        while ($stmt->fetch()) {
            $contentitem[0] = $bid;
            $contentitem[1] = $title;
        }

        $stmt->close();
    }

        return $contentitem;
        
    }

//************************Delete Record ***************************************/
function deleteContent($bofrid){
    global $link;
    $sql = "DELETE FROM $db.bofrcontent WHERE bofr_id = ?";

 // Setup the prepared statement
 if($stmt = $link->prepare($sql)){
    $stmt->bind_param("i", $bofrid);
    $stmt->execute();
    $updateSuccess = $link->affected_rows;

    if($updateSuccess){
        $message = "Content deleted.";
        } else {
        $message = "Delete failed.";
        }
    }

    return $message;

}

//************************Retrieve Record to Edit *****************************/
function retrieveContent($bofrid){
    global $link;
    $sql = "SELECT bofr_id, bofr_title, bofr_text FROM $db.bofrcontent WHERE bofr_id = ?";


    if ($stmt = $link->prepare($sql)) {

        $stmt->bind_param('i', $bofrid);

        $stmt->execute();
        $stmt->bind_result($bid, $title, $text);
        $person = array();


        while ($stmt->fetch()) {
            $contentitem[0] = $title;
            $contentitem[1] = $text;
            $contentitem[2] = $bid;
        }

    $stmt->close();
    }

    return $contentitem;
}

//************************Edit Content ***************************************/
function editContent($bofrid, $title, $text){
    global $link;
  
    $sql = "UPDATE $db.bofrcontent SET bofr_title=?, bofr_text=? WHERE bofr_id = ?";
 

 // Setup the prepared statement
 if($stmt = $link->prepare($sql)){

  // Provide values for the question marks in the query
  $stmt->bind_param("ssi", $title, $text, $bofrid);
  

  //execute
  $stmt->execute();

  // Get the result from the database as to how many rows were changed, the answer should be 1
  $updateSuccess = $link->affected_rows;

  if($updateSuccess){
   $message = "The content entitled: &quot;$title&quot; was successfully updated from the old content shown below.";


  } else {
   $message = "Sorry, the update for &quot;$title&quot; failed.";
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
