<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>URL Shortener</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif;}
        body{background:linear-gradient(135deg,#1e3c72,#2a5298);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#333;}
        .card{background:#fff;border-radius:16px;padding:30px;width:380px;box-shadow:0 10px 30px rgba(0,0,0,0.2);text-align:center;}
        h1{font-size:24px;margin-bottom:8px;color:#1e3c72;}
        p{font-size:14px;color:#666;margin-bottom:20px;}
        input{width:100%;padding:14px;margin:10px 0;border:1px solid #ddd;border-radius:8px;font-size:16px;}
        button{width:100%;padding:14px;background:#007bff;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:0.3s;}
        button:hover{background:#0056b3;}
        .error{color:#e74c3c;margin-top:10px;font-size:14px;}
    </style>
</head>
<body>
<div class="card">
    <h1>URL Shortener</h1>
    <p>Create and manage short links with ease. Developed by
        <a href="https://www.facebook.com/paramjotsingh.cheema/" target="_blank" class="dev-link">Paramjot Singh</a>.
    </p>
    <form method="post">
        <input name="u" placeholder="Username" required>
        <input name="p" type="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
   <?php
if ($_POST) {
    $u = $_POST['u']; $p = $_POST['p'];
    $users = json_decode(file_get_contents("users.json"), true) ?: [];
    if (isset($users[$u]) && password_verify($p, $users[$u])) {
        $_SESSION['user'] = $u;
        header("Location: dashboard.php"); exit;
    } else {
        echo '<div class="error">Wrong username or password!</div>';
    }
}
?>
</div>
</body>
</html>
