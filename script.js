// ========== STORAGE ==========
const STORAGE_KEY = 'irmanufa_gallery';

// DATA DEFAULT dengan EMOJI sebagai gambar (MUDAH, LANGSUNG JALAN)
const defaultData = [
    { id: '1', nama: 'Kabinet IRMANUFA GG & ALL STARS', link: 'https://drive.google.com/drive/u/6/folders/1a8JuSkVHQiWga8ds0XpZvdF6nuCXlE-K', logo: '🏆' },
    { id: '2', nama: 'Takbir Keliling', link: 'https://s.id/fotokegiatantarlingujay2026', logo: '🕌' },
    { id: '3', nama: 'Penyambutan Bulan Suci Ramadhan', link: 'https://drive.google.com/drive/folders/1_lKXooPkIq4tCP-DX14dHmwLPHJjmj_c', logo: '🌙' },
    { id: '4', nama: 'Gallery Irmanufa Random', link: 'https://drive.google.com/drive/folders/1dTlVLOKSiIm73yqxgFOcyOIiM4PC8LPT', logo: '📸' }
];

function getData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return [...defaultData];
    }
    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultData];
    } catch(e) {
        return [...defaultData];
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(data) }));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>'：'&gt;' }[m]));
}

function openDrive(url) {
    if (url) window.open(url, '_blank');
    else Swal.fire({ icon: 'info', title: 'Info', text: 'Link belum tersedia' });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = msg || '🔄 Data diperbarui!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

let searchQuery = '';

function renderUser() {
    let data = getData();
    if (searchQuery) {
        data = data.filter(item => item.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    const gridView = document.getElementById('gridView');
    if (gridView) {
        if (data.length === 0) {
            gridView.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><h3>Kosong</h3><p>Belum ada kegiatan</p></div>`;
        } else {
            gridView.innerHTML = data.map(item => `
                <div class="gallery-card" onclick="openDrive('${escapeHtml(item.link)}')">
                    <div class="card-img" style="font-size:64px;">${item.logo || '📁'}</div>
                    <div class="card-info">
                        <h3>${escapeHtml(item.nama)}</h3>
                        <p><i class="fab fa-google-drive"></i> Klik lihat foto</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    const listView = document.getElementById('listView');
    if (listView) {
        if (data.length === 0) {
            listView.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><h3>Kosong</h3><p>Belum ada kegiatan</p></div>`;
        } else {
            listView.innerHTML = data.map(item => `
                <div class="list-item" onclick="openDrive('${escapeHtml(item.link)}')">
                    <div class="list-img" style="font-size:28px;">${item.logo || '📁'}</div>
                    <div class="list-info">
                        <h3>${escapeHtml(item.nama)}</h3>
                        <p><i class="fab fa-google-drive"></i> Google Drive</p>
                    </div>
                    <div class="list-arrow"><i class="fas fa-chevron-right"></i></div>
                </div>
            `).join('');
        }
    }
}

function setupViewToggle() {
    const gridBtn = document.querySelector('.view-btn[data-view="grid"]');
    const listBtn = document.querySelector('.view-btn[data-view="list"]');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (gridBtn && listBtn) {
        gridBtn.addEventListener('click', () => {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            gridView.style.display = 'grid';
            listView.style.display = 'none';
            localStorage.setItem('gallery_view', 'grid');
        });
        listBtn.addEventListener('click', () => {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            gridView.style.display = 'none';
            listView.style.display = 'flex';
            localStorage.setItem('gallery_view', 'list');
        });
        if (localStorage.getItem('gallery_view') === 'list') listBtn.click();
    }
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('clearSearch');
    if (input) {
        input.addEventListener('input', () => {
            searchQuery = input.value;
            renderUser();
            if (clear) clear.style.display = searchQuery ? 'block' : 'none';
        });
    }
    if (clear) {
        clear.addEventListener('click', () => {
            input.value = '';
            searchQuery = '';
            renderUser();
            clear.style.display = 'none';
        });
    }
}

function setupSidebar() {
    const menuBtn = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('closeSidebar');
    const close = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    };
    if (menuBtn) menuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
}

function renderAdminTable() {
    const tbody = document.getElementById('kegiatanList');
    if (!tbody) return;
    const data = getData();
    document.getElementById('totalCount').innerText = data.length;
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Belum ada data</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(item => `
        <tr>
            <td style="font-size:28px;">${item.logo || '📁'}</td>
            <td><strong>${escapeHtml(item.nama)}</strong></td>
            <td><a href="${item.link}" target="_blank" style="color:#667eea;">📂 Buka</a></td>
            <td>
                <button class="btn-edit" onclick="editKegiatan('${item.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteKegiatan('${item.id}')">🗑️ Hapus</button>
            </td>
        </tr>
    `).join('');
}

function setupAdminForm() {
    const form = document.getElementById('kegiatanForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = document.getElementById('editId').value;
        const nama = document.getElementById('namaKegiatan').value.trim();
        const link = document.getElementById('linkDrive').value.trim();
        let logo = document.getElementById('logoUrl').value.trim();
        if (!nama || !link) {
            Swal.fire('Error', 'Nama dan link wajib diisi!', 'error');
            return;
        }
        if (!logo) logo = '📁';
        const data = getData();
        if (editId) {
            const idx = data.findIndex(i => i.id === editId);
            if (idx !== -1) {
                data[idx] = { ...data[idx], nama, link, logo };
                saveData(data);
                Swal.fire('Berhasil', 'Data diupdate', 'success');
            }
        } else {
            data.push({ id: Date.now().toString(), nama, link, logo });
            saveData(data);
            Swal.fire('Berhasil', 'Kegiatan ditambahkan', 'success');
        }
        resetForm();
        renderAdminTable();
        renderUser();
        showToast('Data tersimpan!');
    });
    document.getElementById('cancelBtn')?.addEventListener('click', resetForm);
}

function editKegiatan(id) {
    const item = getData().find(i => i.id === id);
    if (item) {
        document.getElementById('editId').value = item.id;
        document.getElementById('namaKegiatan').value = item.nama;
        document.getElementById('linkDrive').value = item.link;
        document.getElementById('logoUrl').value = item.logo || '';
        document.getElementById('formTitle').innerHTML = '✏️ Edit Kegiatan';
        document.querySelector('.admin-card').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteKegiatan(id) {
    Swal.fire({
        title: 'Yakin hapus?',
        text: 'Data akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        confirmButtonText: 'Ya, Hapus!'
    }).then(result => {
        if (result.isConfirmed) {
            const newData = getData().filter(i => i.id !== id);
            saveData(newData);
            renderAdminTable();
            renderUser();
            Swal.fire('Terhapus!', 'Data berhasil dihapus', 'success');
            if (document.getElementById('editId').value === id) resetForm();
        }
    });
}

function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('namaKegiatan').value = '';
    document.getElementById('linkDrive').value = '';
    document.getElementById('logoUrl').value = '';
    document.getElementById('formTitle').innerHTML = '➕ Tambah Kegiatan';
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gridView')) {
        setTimeout(() => {
            renderUser();
            setupSearch();
            setupViewToggle();
            setupSidebar();
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY) {
                    renderUser();
                    showToast('Galeri diperbarui!');
                }
            });
        }, 100);
    }
});

window.openDrive = openDrive;
window.editKegiatan = editKegiatan;
window.deleteKegiatan = deleteKegiatan;
window.renderAdminTable = renderAdminTable;
window.setupAdminForm = setupAdminForm;
window.resetForm = resetForm;
window.getData = getData;
window.exportData = exportData;