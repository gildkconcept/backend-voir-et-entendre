// app/routes/redirectRoutes.js
const express = require('express');
const router = express.Router();
const SocialLink = require('../models/SocialLink');

// ✅ Configuration des liens - AJOUT DE academiedelagrace
const appLinks = {
    'instagram': {
        scheme: 'instagram://user?username=eglise_mega',
        fallback: 'https://www.instagram.com/eglise_mega/'
    },
    'youtube': {
        scheme: 'vnd.youtube.com://channel/@m.e.g.amissionevangeliqueg3574',
        fallback: 'https://www.youtube.com/@m.e.g.amissionevangeliqueg3574'
    },
    'tiktok': {
        scheme: 'tiktok://user?username=eglisemega',
        fallback: 'https://www.tiktok.com/@eglisemega'
    },
    'facebook': {
        scheme: 'fb://page/MissionEvangeliqueGraceAbondante',
        fallback: 'https://www.facebook.com/MissionEvangeliqueGraceAbondante'
    },
    'whatsapp': {
        scheme: 'whatsapp://send?phone=',
        fallback: 'https://whatsapp.com/channel/0029Va9RIPNHrDZovr7mDN0E'
    },
    'telegram': {
        scheme: 'tg://resolve?domain=eglisemegaaudio',
        fallback: 'https://t.me/eglisemegaaudio'
    },
    'website': {
        scheme: null,
        fallback: 'https://www.messagedegrace.org/'
    },
    // ✅ NOUVEAU : academiedelagrace (site web)
    'academiedelagrace': {
        scheme: null,  // ← PAS d'application mobile
        fallback: 'https://academiedelagrace.org/'  // ← Mets le bon lien
    }
};

function getIconForPlatform(platform) {
    const icons = {
        'instagram': '📸',
        'youtube': '▶️',
        'tiktok': '🎵',
        'facebook': '👍',
        'whatsapp': '💬',
        'telegram': '✈️',
        'website': '🌐',
        'academiedelagrace': '🎓'  // ✅ Icône pour l'académie
    };
    return icons[platform] || '🔗';
}

// ✅ Route de redirection
router.get('/:platform', async (req, res) => {
    try {
        const { platform } = req.params;

        // ✅ SITES WEB → Redirection directe (website ET academiedelagrace)
        const webPlatforms = ['website', 'academiedelagrace'];
        if (webPlatforms.includes(platform)) {
            try {
                const { trackClick } = require('../controllers/clickController');
                await trackClick({
                    body: { platform },
                    ip: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0',
                    headers: req.headers
                });
            } catch (err) {
                console.error('Erreur enregistrement clic:', err.message);
            }
            // Rediriger vers l'URL correspondante
            const link = await SocialLink.findOne({
                where: { platform, is_active: true }
            });
            if (!link) {
                return res.status(404).json({ error: 'Lien non trouvé' });
            }
            return res.redirect(302, link.url);
        }

        // ... (reste du code inchangé)
        // Récupérer le lien dans la base de données
        const link = await SocialLink.findOne({
            where: { platform, is_active: true }
        });

        if (!link) {
            return res.status(404).json({ error: 'Lien non trouvé' });
        }

        // Enregistrer le clic
        try {
            const { trackClick } = require('../controllers/clickController');
            await trackClick({
                body: { platform },
                ip: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0',
                headers: req.headers
            });
        } catch (err) {
            console.error('Erreur enregistrement clic:', err.message);
        }

        // Détecter le type d'appareil
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(userAgent);
        const appInfo = appLinks[platform];

        // Desktop → redirection directe
        if (!isMobile || !appInfo?.scheme) {
            return res.redirect(302, link.url);
        }

        // ✅ MOBILE → Page de redirection avec boutons
        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Redirection ${link.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
            text-align: center;
            padding: 30px 25px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            max-width: 90%;
            width: 340px;
        }
        .icon { font-size: 56px; margin-bottom: 10px; }
        .loader {
            width: 48px;
            height: 48px;
            border: 4px solid #e8e8e8;
            border-top-color: ${link.color || '#2563EB'};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 16px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .title { font-size: 20px; font-weight: 700; color: #1a1a1a; }
        .subtitle { font-size: 14px; color: #888; margin: 6px 0 16px 0; }
        .btn {
            display: block;
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 14px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn:active { transform: scale(0.97); }
        .btn-primary {
            background: ${link.color || '#2563EB'};
            color: white;
            margin-bottom: 10px;
        }
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        .brand {
            font-size: 12px;
            color: #aaa;
            margin-top: 18px;
        }
        .brand span { color: ${link.color || '#2563EB'}; font-weight: 600; }
        .footer-text { font-size: 12px; color: #ccc; margin-top: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">${getIconForPlatform(platform)}</div>
        <div class="loader"></div>
        <div class="title">${link.title}</div>
        <div class="subtitle">Ouverture de l'application...</div>
        
        <button class="btn btn-primary" id="openAppBtn">📱 Ouvrir l'application</button>
        <button class="btn btn-secondary" id="openWebBtn">🌐 Ouvrir dans le navigateur</button>
        
        <div class="brand">Voir et Entendre • <span>${link.title}</span></div>
        <div class="footer-text">Redirection automatique...</div>
    </div>

    <script>
        const appScheme = '${appInfo.scheme}';
        const webLink = '${appInfo.fallback}';
        let appOpened = false;

        function openApp() {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = appScheme;
            document.body.appendChild(iframe);
            
            const visibilityHandler = () => {
                if (document.hidden) {
                    appOpened = true;
                    document.removeEventListener('visibilitychange', visibilityHandler);
                }
            };
            document.addEventListener('visibilitychange', visibilityHandler);
            
            setTimeout(() => {
                document.removeEventListener('visibilitychange', visibilityHandler);
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                if (!appOpened) {
                    window.location.href = webLink;
                }
            }, 600);
        }

        const autoTimer = setTimeout(openApp, 1000);

        document.getElementById('openAppBtn').addEventListener('click', function(e) {
            e.preventDefault();
            clearTimeout(autoTimer);
            openApp();
        });

        document.getElementById('openWebBtn').addEventListener('click', function(e) {
            e.preventDefault();
            clearTimeout(autoTimer);
            window.location.href = webLink;
        });
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('Erreur de redirection:', error);
        res.status(500).json({ error: 'Erreur de redirection' });
    }
});

module.exports = router;