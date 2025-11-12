<?php header('Content-Type: text/html; charset=utf-8');
session_start();
if (!$_SESSION['user']) { header("Location: index.php"); exit; }
$user = $_SESSION['user'];
$links = json_decode(file_get_contents("links.json"), true) ?: [];
$userLinks = array_filter($links, fn($v) => $v['user'] == $user);

if ($_POST['url']) {
    $url = $_POST['url'];
    if (!preg_match("~^https?://~", $url)) $url = "https://$url";
    $slug = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
    $links[$slug] = ['url' => $url, 'user' => $user];
    file_put_contents("links.json", json_encode($links));
    header("Location: dashboard.php"); exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif;}
        body{background:linear-gradient(135deg,#1e3c72,#2a5298);min-height:100vh;color:#333;padding:20px;}
        .card{background:#fff;border-radius:16px;padding:25px;margin:0 auto;max-width:600px;box-shadow:0 10px 30px rgba(0,0,0,0.2);}
        h1{font-size:22px;margin-bottom:10px;color:#1e3c72;}
        .logout{float:right;font-size:14px;color:#007bff;text-decoration:none;}
        input,button{width:100%;padding:14px;margin:10px 0;border-radius:8px;font-size:16px;}
        input{border:1px solid #ddd;}
        button{background:#007bff;color:#fff;border:none;font-weight:600;cursor:pointer;}
        button:hover{background:#0056b3;}
        table{width:100%;margin-top:20px;border-collapse:collapse;}
        th,td{padding:12px;text-align:left;border-bottom:1px solid #eee;}
        a{color:#007bff;text-decoration:none;}
    </style>
</head>
<body>
<div class="card">
    <h1>Dashboard <a href="logout.php" class="logout">Logout</a></h1>
    <form method="post">
        <input name="url" placeholder="Enter long URL" required>
        <button>Shorten</button>
    </form>

    <h3 style="margin-top:25px;">Your Short Links</h3>
    <table>
        <tr><th>Short URL</th><th>Original</th></tr>
        <?php foreach ($userLinks as $s => $v): ?>
        <tr>
            <td><a href="/<?= $s ?>" target="_blank">link.mvr.cam/<?= $s ?></a></td>
            <td><?= htmlspecialchars($v['url']) ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
</div>
</body>

</html>

