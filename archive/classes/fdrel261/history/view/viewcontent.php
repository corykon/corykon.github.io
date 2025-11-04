<?php

    include '../../modules/phphead.inc';


    if (isset($_SESSION['contenttoedit'])){
        $contentitem = $_SESSION['contenttoedit'];
    }

     if (isset($_SESSION['content'])){
        $contentlist = $_SESSION['content'];
    }

    if (isset($_SESSION['errors'])){
        $errors = $_SESSION['errors'];
    }

    if (isset($_SESSION['message'])){
        $message = $_SESSION['message'];
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title><?php echo $contentitem[0]; ?> | BofR</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="../../css/borstyle.css" />
    </head>
    <body>
        <header>
        <h1><span>Cory K. Fugate</span></h1>
        <h2><span>Book of Remembrance</span></h2>

        </header>

    <div id="flourish"></div>
    <section id="content">
        <h3><?php echo $contentitem[0]; ?></h3>
        <?php echo $contentitem[1]; ?>

        <?php
            foreach($contentlist as $item){
                
                if($grabnextid){
                    $nextid=$item[0];
                    $nexttitle=$item[1];
                    $grabnextid= false;
                }
                if($item[0] == $contentitem[2]){
                    $grabnextid  = true;
                }

            }
        ?>
        <?php if($nexttitle){?>
         <p><a href="../?view=<?php echo $nextid; ?>" title="<?php echo $nexttitle; ?>"> Continue to &quot;<?php echo $nexttitle; ?>&quot; &gt;&gt; </a></p>
         <?php }?>
         <footer>

             <?php include '../../modules/borfooter.inc'; ?>

         </footer>

</section>

<div id="side">
    <?php include '../../modules/bornav3.inc'; ?>
    <div id="flourish2"></div>
</div>
    </body>

</html>