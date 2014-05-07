<?php
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=larideac_whispr', 'larideac_whispr', '@whispr2014_Cool');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare('INSERT INTO Testers (email) VALUES(:email)');
        $stmt->bindParam(":email", $_POST["email"], PDO::PARAM_STR,255);
        $stmt->execute();
        echo 'Everything is ok';
    } catch(PDOException $e) {
        echo 'Error: ' . $e->getMessage();
    }
?>