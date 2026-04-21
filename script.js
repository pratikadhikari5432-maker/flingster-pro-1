document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('player');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const currentTimeDisplay = document.getElementById('currentTime');
    const totalTimeDisplay = document.getElementById('totalTime');
    const playhead = document.getElementById('playhead');
    const mediaPool = document.getElementById('mediaPool');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const exportBtn = document.getElementById('exportBtn');
    const langSelect = document.getElementById('langSelect');

    let isPlaying = false;
    let duration = 0;

    // Persist language from main app
    const savedSession = localStorage.getItem('lumina_session');
    if (savedSession) {
        const user = JSON.parse(savedSession);
        if (user.language) langSelect.value = user.language;
    }

    const localTranslations = {
        en: { brand: "LUMINA Standalone", render: "Render MP4", media: "Media Pool", inspector: "Node Inspector", transform: "Transform", cloud: "Cloud Node", opacity: "Opacity", scale: "Scale", start: "Start Offset (s)", end: "End Offset (s)", apply: "Apply Local Trim", cloudTrans: "Cloud Transformation", sync: "Sync & Transform", master: "Master Output" },
        bn: { brand: "লুমিনা স্ট্যান্ডআলোন", render: "রেন্ডার MP4", media: "মিডিয়া পুল", inspector: "ইন্সপেক্টর", transform: "ট্রান্সফর্ম", cloud: "ক্লাউড নোড", opacity: "অস্বচ্ছতা", scale: "স্কেল", start: "শুরু (s)", end: "শেষ (s)", apply: "ট্রিম প্রয়োগ করুন", cloudTrans: "ক্লাউড ট্রান্সফর্ম", sync: "সিঙ্ক ও ট্রান্সফর্ম", master: "মাস্টার আউটপুট" },
        hi: { brand: "लुमिना स्टैंडअलोन", render: "रेंडर MP4", media: "मीडिया पूल", inspector: "निरीक्षक", transform: "ट्रांसफॉर्म", cloud: "क्लाउड नोড", opacity: "अपारदर्शिता", scale: "स्केल", start: "प्रारंभ (s)", end: "अंत (s)", apply: "ट्रिम लागू करें", cloudTrans: "क्लाउड ट्रांसफॉर्म", sync: "सिंक और ट्रांसफॉर्म", master: "मास्टर आउटपुट" },
        es: { brand: "LUMINA Standalone", render: "Renderizar MP4", media: "Pool de Medios", inspector: "Inspector", transform: "Transformar", cloud: "Nodo Nube", opacity: "Opacidad", scale: "Escala", start: "Inicio (s)", end: "Fin (s)", apply: "Aplicar Recorte", cloudTrans: "Transformación Nube", sync: "Sincronizar", master: "Salida Maestra" },
        ar: { brand: "لومينا المستقل", render: "تصدير MP4", media: "مجمع الوسائط", inspector: "المفتش", transform: "تحويل", cloud: "نظام السحاب", opacity: "الشفافية", scale: "الحجم", start: "البداية", end: "النهاية", apply: "تطبيق القص", cloudTrans: "تحويل السحاب", sync: "مزامنة", master: "المخرج الرئيسي" },
        fr: { brand: "LUMINA Standalone", render: "Rendre MP4", media: "Médiathèque", inspector: "Inspecteur", transform: "Transformer", cloud: "Nœud Cloud", opacity: "Opacité", scale: "Échelle", start: "Début (s)", end: "Fin (s)", apply: "Appliquer Découpe", cloudTrans: "Transformation Cloud", sync: "Sync & Transform", master: "Sortie Maître" },
        ru: { brand: "LUMINA Standalone", render: "Рендер MP4", media: "Медиатека", inspector: "Инспектор", transform: "Трансформ", cloud: "Облако", opacity: "Прозрачность", scale: "Масштаб", start: "Начало (s)", end: "Конец (s)", apply: "Обрезать", cloudTrans: "Облачный трансформ", sync: "Синхронизация", master: "Мастер Выход" },
        ja: { brand: "LUMINA スタンドアロン", render: "レンダリング", media: "メディアプール", inspector: "インスペクター", transform: "変形", cloud: "クラウドノード", opacity: "不透明度", scale: "スケール", start: "開始位置", end: "終了位置", apply: "トリム適用", cloudTrans: "クラウド変換", sync: "同期して変換", master: "マスター出力" },
        zh: { brand: "LUMINA 独立版", render: "渲染视频", media: "媒体库", inspector: "检查器", transform: "变换", cloud: "云节点", opacity: "透明度", scale: "缩放", start: "起始时间", end: "结束时间", apply: "应用裁剪", cloudTrans: "云端转换", sync: "同步并转换", master: "主输出" },
        pt: { brand: "LUMINA Standalone", render: "Renderizar MP4", media: "Pool de Mídia", inspector: "Inspetor", transform: "Transformar", cloud: "Nó Nuvem", opacity: "Opacidade", scale: "Escala", start: "Início (s)", end: "Fim (s)", apply: "Aplicar Corte", cloudTrans: "Transformação Nuvem", sync: "Sincronizar", master: "Salida Mestra" }
    };

    function updateLanguage() {
        const lang = langSelect.value;
        const t = localTranslations[lang] || localTranslations.en;
        document.getElementById('txt-brand').textContent = t.brand;
        document.getElementById('txt-render').textContent = t.render;
        document.getElementById('txt-media-pool').textContent = t.media;
        document.getElementById('txt-inspector').textContent = t.inspector;
        document.getElementById('tab-transform').textContent = t.transform;
        document.getElementById('tab-cloud').textContent = t.cloud;
        document.getElementById('lbl-opacity').textContent = t.opacity;
        document.getElementById('lbl-scale').textContent = t.scale;
        document.getElementById('lbl-start').textContent = t.start;
        document.getElementById('lbl-end').textContent = t.end;
        document.getElementById('btn-apply-trim').textContent = t.apply;
        document.getElementById('lbl-cloud-trans').textContent = t.cloudTrans;
        document.getElementById('txt-sync').textContent = t.sync;
        document.getElementById('txt-master').textContent = t.master;
    }

    langSelect.addEventListener('change', updateLanguage);

    window.renderVideo = async function() {
        const videoUrl = videoPlayer.src;
        if (!videoUrl || videoUrl.includes('unsplash')) {
            alert("Active video asset required for cluster rendering.");
            return;
        }

        const start = Number(startTimeInput.value) || 0;
        const end = Number(endTimeInput.value) || 10;

        exportBtn.innerHTML = '<i data-lucide="refresh-cw" class="animate-spin"></i> Initializing Cluster...';
        lucide.createIcons();

        try {
            const response = await fetch("http://localhost:3000/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "user1", videoUrl, start, end })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            alert(`Cluster Success: Credits remaining: ${data.remainingCredits}. Job ID: ${data.response?.id || 'SYNTH-ACK'}`);
        } catch (err) {
            alert("Critical Node Error: " + err.message);
        } finally {
            exportBtn.innerHTML = '<i data-lucide="download"></i> Render MP4';
            lucide.createIcons();
        }
    };

    exportBtn.addEventListener('click', renderVideo);

    playPauseBtn.addEventListener('click', () => {
        isPlaying ? videoPlayer.pause() : videoPlayer.play();
        isPlaying = !isPlaying;
        playPauseBtn.innerHTML = isPlaying ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
        lucide.createIcons();
    });

    videoPlayer.addEventListener('loadedmetadata', () => { duration = videoPlayer.duration; totalTimeDisplay.textContent = formatTime(duration); });
    videoPlayer.addEventListener('timeupdate', () => {
        currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
        if (duration > 0) playhead.style.left = `calc(100px + ${(videoPlayer.currentTime / duration) * 100}%)`;
    });

    function formatTime(s) { return [Math.floor(s/3600), Math.floor((s%3600)/60), Math.floor(s%60)].map(v => v.toString().padStart(2, '0')).join(':'); }
    
    window.switchTab = (id) => {
        document.querySelectorAll('.property-stack').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const target = id === 'filters' ? 'filtersTab' : 'transformTab';
        document.getElementById(target).classList.add('active');
        document.getElementById('tab-' + (id === 'filters' ? 'cloud' : 'transform')).classList.add('active');
    };

    updateLanguage();
    lucide.createIcons();
});