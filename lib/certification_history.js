// certification_history.js
document.addEventListener("DOMContentLoaded", function () {
    // Fungsi untuk mendapatkan NIK dari Session Storage
    function getNikFromSession() {
        return sessionStorage.getItem('selectedNik');
    }

    // Fungsi untuk mendapatkan nama dari Session Storage  
    function getNameFromSession() {
        return sessionStorage.getItem('selectedName');
    }

    // Fungsi untuk clear session data setelah digunakan
    function clearSessionData() {
        sessionStorage.removeItem('selectedNik');
        sessionStorage.removeItem('selectedName');
    }
    // Fungsi untuk mendapatkan parameter date dari URL
    function getDateFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('date');
    }

    // Fungsi untuk memuat daftar tanggal sertifikasi
    async function loadCertificationDates(nik) {
        try {
            console.log(`📅 Loading certification dates for NIK: ${nik}`);

            const response = await fetch(`/hri_iab/api/certification/history/dates?nik=${nik}`);

            if (!response.ok) {
                let errorMessage = `Failed to load dates: ${response.statusText}`;

                // Coba parse error detail dari response
                try {
                    const errorData = await response.json();
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // Jika response bukan JSON, gunakan status text
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log(`✅ Found ${data.dates ? data.dates.length : 0} certification dates`);

            if (!data.dates || data.dates.length === 0) {
                console.warn(`⚠️ No certification history found for NIK: ${nik}`);
                showInfo('Tidak ada riwayat sertifikasi untuk operator ini');

                // Tetap render sidebar kosong
                renderDateList([], nik);

                // Tampilkan pesan di dashboard
                updateOperatorInfo(data.operator || { nik: nik, name: 'Unknown' });
                resetAllScores();
                return [];
            }

            // Render daftar tanggal di sidebar
            renderDateList(data.dates, nik);

            // Jika ada parameter date di URL, load data untuk date tersebut
            const selectedDate = getDateFromURL();
            if (selectedDate && data.dates.includes(selectedDate)) {
                loadCertificationData(nik, selectedDate);
            } else if (data.dates.length > 0) {
                // Load data untuk tanggal pertama
                loadCertificationData(nik, data.dates[0]);
            }

            return data.dates;

        } catch (error) {
            console.error('❌ Error loading certification dates:', error);

            // Tampilkan error yang lebih spesifik
            let userMessage = 'Gagal memuat riwayat sertifikasi';
            if (error.message.includes('Operator not found')) {
                userMessage = 'Operator tidak ditemukan';
            } else if (error.message.includes('No certification history')) {
                userMessage = 'Tidak ada riwayat sertifikasi untuk operator ini';
            }

            showError(userMessage);

            // Tetap render UI dengan state kosong
            renderDateList([], nik);
            updateOperatorInfo({ nik: nik, name: 'Data tidak tersedia' });
            resetAllScores();

            return [];
        }
    }

    // Fungsi untuk merender daftar tanggal di sidebar
    function renderDateList(dates, nik) {
        const dateListContainer = document.getElementById('dateList');
        if (!dateListContainer) return;

        dateListContainer.innerHTML = '';

        dates.forEach((dateStr, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            if (index === 0) navItem.classList.add('active');
            navItem.textContent = dateStr;
            navItem.dataset.date = dateStr;

            navItem.addEventListener('click', function () {
                // Update URL tanpa reload page
                const url = new URL(window.location);
                url.searchParams.set('date', dateStr);
                window.history.pushState({}, '', url);

                // Load data untuk tanggal yang dipilih
                loadCertificationData(nik, dateStr);

                // Update active state
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
            });

            dateListContainer.appendChild(navItem);
        });
    }

    // Fungsi untuk memuat data sertifikasi berdasarkan tanggal
    async function loadCertificationData(nik, dateStr) {
        try {
            console.log(`📊 Loading certification data for NIK: ${nik}, Date: ${dateStr}`);

            showLoading(true);

            const response = await fetch(`/hri_iab/api/certification/history/by_date?nik=${nik}&date_str=${encodeURIComponent(dateStr)}`);
            if (!response.ok) {
                throw new Error(`Failed to load certification data: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Certification data loaded:', {
                id: data.certification?.id,
                nik: data.certification?.nik,
                date: data.certification?.certification_date
            });

            // Update informasi operator
            updateOperatorInfo(data.operator);

            // Update skor sertifikasi - PASTIKAN certification ID termasuk
            updateCertificationScores(data.certification);

            // Setup event listeners untuk tombol mata (👁️‍🗨️)
            // PASS certification object yang lengkap
            setupEyeButtons(data.certification);

            showLoading(false);

        } catch (error) {
            console.error('❌ Error loading certification data:', error);
            showError('Failed to load certification data');
            showLoading(false);
        }
    }

    // Di fungsi updateOperatorInfo, sesuaikan dengan field baru:
    function updateOperatorInfo(operator) {
        const elements = {
            name: document.getElementById('infoName'),
            nik: document.getElementById('infoNik'),
            line: document.getElementById('infoLine'),
            job: document.getElementById('infoJob'),
            range: document.getElementById('contractRange') // Ini akan menampilkan range tanggal
        };

        if (operator && elements.name) {
            elements.name.textContent = operator.name || '-';
            elements.nik.textContent = `NIK: ${operator.nik || '-'}`;
            elements.line.textContent = operator.line || '-';
            elements.job.textContent = operator.job_level || '-';

            // Format contract range menggunakan tanggal sertifikasi
            const start = operator.start_certification_date || 'Tanggal tidak tersedia';
            const end = operator.end_certification_date || 'Sekarang';

            // Tampilkan dengan format yang jelas
            if (start === 'Tanggal tidak tersedia' && end === 'Sekarang') {
                elements.range.textContent = 'Data tanggal tidak tersedia';
            } else {
                elements.range.textContent = `${start} — ${end}`;
            }
        }
    }

    // Fungsi untuk update skor sertifikasi
    function updateCertificationScores(certification) {
        if (!certification) {
            // Jika tidak ada data sertifikasi, set semua ke '-'
            resetAllScores();
            return;
        }

        // Helper function untuk set skor dengan styling
        function setScore(elementId, value, isInverse = false) {
            const element = document.getElementById(elementId);
            if (!element) return;

            element.textContent = value !== null && value !== undefined ? value : '-';
            element.className = 'metric-val';

            // Hanya terapkan styling untuk nilai numerik
            if (typeof value === 'number' || !isNaN(parseFloat(value))) {
                const num = parseFloat(value);

                if (isInverse) {
                    // Untuk Miss Rate dan False Alarm (lebih kecil lebih baik)
                    if (num <= 2) element.classList.add('good');
                    else if (num > 5) element.classList.add('bad');
                } else {
                    // Untuk nilai lainnya (lebih besar lebih baik)
                    if (num >= 80) element.classList.add('good');
                    else if (num < 60) element.classList.add('bad');
                }
            }
        }

        // Screwing
        setScore('screwTech', certification.screwing_technique);
        setScore('screwWork', certification.screwing_work);

        // Soldering
        setScore('solderWritten', certification.soldering_written);
        setScore('solderPractical', certification.soldering_practical);

        // MSA Assessment
        setScore('msaAcc', certification.msaa_accuracy);
        setScore('msaMiss', certification.msaa_missrate, true);
        setScore('msaFalse', certification.msaa_falsealarm, true);
        setScore('msaConf', certification.msaa_confidence);

        // Line Simulation
        const lineProcessEl = document.getElementById('lineProcess');
        if (lineProcessEl) lineProcessEl.textContent = certification.process || '-';

        setScore('lineActual', certification.ls_actual);
        setScore('lineAchieve', certification.ls_achievement ? `${certification.ls_achievement.toFixed(1)}%` : '-');

        // Data Screening
        setScore('scrTiu', certification.ds_tiu);
        setScore('scrAccu', certification.ds_accu);
        setScore('scrHeco', certification.ds_heco);
        setScore('scrMcc', certification.ds_mcc);
    }

    // Fungsi untuk reset semua skor ke default
    function resetAllScores() {
        const scoreElements = [
            'screwTech', 'screwWork', 'solderWritten', 'solderPractical',
            'msaAcc', 'msaMiss', 'msaFalse', 'msaConf',
            'lineActual', 'lineAchieve', 'scrTiu', 'scrAccu', 'scrHeco', 'scrMcc'
        ];

        scoreElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
                element.className = 'metric-val';
            }
        });

        const lineProcessEl = document.getElementById('lineProcess');
        if (lineProcessEl) lineProcessEl.textContent = '-';
    }

    // Fungsi untuk setup tombol mata (👁️‍🗨️)
    function setupEyeButtons(certification) {
        if (!certification) return;

        console.log('🔍 Setting up eye buttons for certification ID:', certification.id);

        // Helper function untuk membuka PDF dengan handling yang lebih baik
        function openPdf(base64Data, fileName) {
            if (!base64Data) {
                console.warn('No PDF data available');
                alert('File PDF tidak tersedia untuk sertifikasi ini');
                return;
            }

            try {
                // Bersihkan base64 data
                let cleanBase64 = base64Data;

                // Hapus data URI prefix jika ada
                if (base64Data.startsWith('data:application/pdf;base64,')) {
                    cleanBase64 = base64Data.replace('data:application/pdf;base64,', '');
                }

                // Hapus whitespace
                cleanBase64 = cleanBase64.replace(/\s/g, '');

                console.log(`📄 Opening PDF: ${fileName} (${cleanBase64.length} chars)`);

                // Decode base64
                const byteCharacters = atob(cleanBase64);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);

                // Buka di tab baru
                const newWindow = window.open(blobUrl, '_blank');

                if (!newWindow) {
                    alert('Popup diblokir. Silakan izinkan popup untuk melihat PDF.');
                    // Alternatif: buka di tab yang sama
                    window.location.href = blobUrl;
                }

                // Cleanup setelah 10 detik (memberi waktu untuk window terbuka)
                setTimeout(() => {
                    try {
                        URL.revokeObjectURL(blobUrl);
                    } catch (e) {
                        console.warn('Error revoking URL:', e);
                    }
                }, 10000);

            } catch (err) {
                console.error('❌ Failed to open PDF:', err);
                alert('Gagal membuka file PDF. File mungkin korup atau format tidak valid.');
            }
        }

        // Clear existing event listeners
        document.querySelectorAll('.card-title').forEach(title => {
            title.style.cursor = 'default';
            title.title = '';
            // Clone element untuk remove event listeners
            const newTitle = title.cloneNode(true);
            title.parentNode.replaceChild(newTitle, title);
        });

        // Setup tombol mata untuk setiap bagian
        const sections = [
            {
                selector: '.card-title:contains("Screwing")',
                fileData: certification.file_screwing,
                fileName: `Screwing_Certification_${certification.id || 'unknown'}.pdf`
            },
            {
                selector: '.card-title:contains("Soldering")',
                fileData: certification.file_soldering,
                fileName: `Soldering_Certification_${certification.id || 'unknown'}.pdf`
            },
            {
                selector: '.card-title:contains("MSA Assessment")',
                fileData: certification.file_msa,
                fileName: `MSA_Assessment_${certification.id || 'unknown'}.pdf`
            }
        ];

        sections.forEach(section => {
            // Cari elemen berdasarkan teks
            const allTitles = document.querySelectorAll('.card-title');
            let targetElement = null;

            allTitles.forEach(title => {
                if (title.textContent.includes(section.fileName.split('_')[0])) {
                    targetElement = title;
                }
            });

            if (targetElement && section.fileData) {
                targetElement.style.cursor = 'pointer';
                targetElement.title = `Klik untuk melihat file ${section.fileName.split('_')[0]}`;

                // Tambahkan event listener
                targetElement.addEventListener('click', () => {
                    console.log(`👁️ Opening ${section.fileName} for certification ID: ${certification.id}`);
                    openPdf(section.fileData, section.fileName);
                });

                console.log(`✅ Eye button setup for ${section.fileName.split('_')[0]}`);
            } else if (targetElement) {
                console.log(`⚠️ No PDF data for ${section.fileName.split('_')[0]}, certification ID: ${certification.id}`);
                targetElement.title = 'File PDF tidak tersedia';
            }
        });
    }

    // Fungsi untuk menampilkan loading state
    function showLoading(isLoading) {
        // Anda bisa menambahkan spinner atau loading indicator di sini
        if (isLoading) {
            console.log('🔄 Loading...');
        } else {
            console.log('✅ Loaded');
        }
    }

    // Fungsi untuk menampilkan error
    function showError(message) {
        console.error('❌ Error:', message);
        // Anda bisa menambahkan toast atau alert di sini
        alert(message);
    }


    // Fungsi untuk setup back button
    function setupBackButton() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.style.display = 'block';
            backButton.addEventListener('click', function () {
                // Clear session data
                clearSessionData();
                // Redirect ke profile
                window.location.href = '/hri_iab/profile';
            });
        }
    }


    // Inisialisasi
    function init() {
        // Cek apakah ada NIK di Session Storage
        const nik = getNikFromSession();
        const name = getNameFromSession();

        if (nik && name) {
            console.log(`🔍 Initializing certification history for NIK: ${nik} (${name})`);

            // Setup back button
            setupBackButton();

            // Optional: Tampilkan nama di halaman
            const nameElement = document.getElementById('infoName');
            if (nameElement) {
                nameElement.textContent = name;
            }

            loadCertificationDates(nik);

            // Clear session data setelah beberapa detik (opsional)
            // setTimeout(clearSessionData, 5000);

        } else {
            console.warn('⚠️ No operator data found in session storage');
            showError('Silakan pilih operator terlebih dahulu dari halaman profile');

            // Tampilkan pesan yang lebih user-friendly
            updateOperatorInfo({
                nik: 'N/A',
                name: 'Silakan pilih operator terlebih dahulu',
                line: '-',
                job_level: '-'
            });

            // Redirect ke halaman profile setelah 3 detik
            setTimeout(() => {
                window.location.href = '/hri_iab/profile';
            }, 3000);
        }
    }


    // Jalankan inisialisasi
    init();
});