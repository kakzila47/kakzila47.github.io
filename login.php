<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if ($username === 'Admin' && $password === 'Nyangcat0621?!') {
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username;
        header("Location: index.html");
        exit;
    } else {
        echo "사용자 이름 또는 비밀번호가 올바르지 않습니다.";
    }
}
?>
