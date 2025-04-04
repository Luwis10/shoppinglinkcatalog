// script.js

// Fungsi untuk membatasi jumlah kata pada deskripsi
function limitWords(text, maxWords) {
    const words = text.split(' ');
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
}

// Fungsi untuk menghitung harga asli sebelum diskon
function calculateOriginalPrice(discountedPrice, discountPercentage) {
    if (discountPercentage <= 0) return discountedPrice; // Jika tidak ada diskon, harga asli sama dengan harga setelah diskon
    return Math.round(discountedPrice / (1 - (discountPercentage / 100)));
}

// Register
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        userCredential.user.sendEmailVerification();
        alert('Email verifikasi telah dikirim. Silakan cek email Anda.');
        window.location.href = 'login.html';
      })
      .catch((error) => alert(error.message));
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        if (userCredential.user.emailVerified) {
          window.location.href = 'index.html';
        } else {
          alert('Verifikasi email Anda terlebih dahulu.');
          auth.signOut();
        }
      })
      .catch((error) => alert(error.message));
});

// Reset Password
document.getElementById('resetPassword')?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert('Masukkan email Anda terlebih dahulu.');
        return;
    }
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert('Email reset kata sandi telah dikirim. Silakan cek email Anda.');
        })
        .catch((error) => alert(error.message));
});

// Logout
document.querySelectorAll('#logoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      auth.signOut().then(() => window.location.href = 'login.html');
    });
});

// Cek status login dan tampilkan indikator
auth.onAuthStateChanged((user) => {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginIndicator = document.getElementById('loginIndicator');
    const authButtons = document.getElementById('authButtons');
    const adminForm = document.getElementById('adminForm');
    if (user) {
      console.log('User logged in:', user.email);
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (loginIndicator) loginIndicator.textContent = `Login sebagai: ${user.email}`;
      if (authButtons) authButtons.style.display = 'none';
      if (adminForm) {
        adminForm.style.display = (user.email === 'luwiswiryanto@gmail.com') ? 'block' : 'none';
      }
    } else {
      console.log('No user logged in');
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (loginIndicator) loginIndicator.textContent = 'Anda belum login';
      if (authButtons) authButtons.style.display = 'block';
      if (adminForm) adminForm.style.display = 'none';
    }
});

// CRUD untuk Admin
const catalogRef = db.ref('catalogs');
document.getElementById('catalogForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;
    const price = parseInt(document.getElementById('price').value);
    const discount = parseInt(document.getElementById('discount').value);
    const link = document.getElementById('link').value;

    // Create
    catalogRef.push({ name, description, image, price, discount, link })
      .then(() => alert('Katalog ditambahkan'))
      .catch((error) => alert(error.message));

    e.target.reset();
});

// Read dan tampilkan katalog (Admin & User)
function displayCatalogs(snapshot, containerId, isAdmin = false) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    container.innerHTML = '';
    if (!snapshot.exists()) {
      container.innerHTML = '<p>Tidak ada katalog tersedia.</p>';
      return;
    }
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      const key = childSnapshot.key;
      const div = document.createElement('div');
      div.className = 'catalog-item';
      // Batasi deskripsi ke 20 kata
      const limitedDescription = limitWords(data.description, 20);
      // Hitung harga asli sebelum diskon
      const originalPrice = calculateOriginalPrice(data.price, data.discount);
      div.innerHTML = `
        <img src="${data.image}" alt="${data.name}" onerror="this.src='https://via.placeholder.com/150';">
        <h3>${data.name}</h3>
        <p class="description">${limitedDescription}</p>
        <p class="original-price">Rp ${originalPrice.toLocaleString()}</p>
        <p class="discount">-${data.discount}%</p>
        <p class="price">Rp ${data.price.toLocaleString()}</p>
        <div class="button-group">
          ${auth.currentUser ? (auth.currentUser.email === 'luwiswiryanto@gmail.com' ? `
            <button onclick="showUpdateForm('${key}', '${data.name}', '${data.description}', '${data.image}', ${data.price}, ${data.discount}, '${data.link}')">Update</button>
            <button onclick="deleteCatalog('${key}')">Hapus</button>
            <a href="${data.link}" target="_blank" class="buy-btn">Pesan Sekarang</a>
          ` : `<a href="${data.link}" target="_blank" class="buy-btn">Pesan Sekarang</a>`) : '<p>Login untuk membeli</p>'}
        </div>
      `;
      container.appendChild(div);
    });
}

// Read untuk User
catalogRef.on('value', (snapshot) => {
    console.log('Data from Firebase:', snapshot.val());
    if (document.getElementById('catalogList')) {
      displayCatalogs(snapshot, 'catalogList', auth.currentUser && auth.currentUser.email === 'luwiswiryanto@gmail.com');
    }
});

// Show Update Form
function showUpdateForm(key, name, description, image, price, discount, link) {
    const modal = document.getElementById('updateModal');
    document.getElementById('updateKey').value = key;
    document.getElementById('updateName').value = name;
    document.getElementById('updateDescription').value = description;
    document.getElementById('updateImage').value = image;
    document.getElementById('updatePrice').value = price;
    document.getElementById('updateDiscount').value = discount;
    document.getElementById('updateLink').value = link;
    modal.style.display = 'block';

    // Close modal when clicking the close button
    document.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Update Catalog
document.getElementById('updateForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = document.getElementById('updateKey').value;
    const name = document.getElementById('updateName').value;
    const description = document.getElementById('updateDescription').value;
    const image = document.getElementById('updateImage').value;
    const price = parseInt(document.getElementById('updatePrice').value);
    const discount = parseInt(document.getElementById('updateDiscount').value);
    const link = document.getElementById('updateLink').value;

    catalogRef.child(key).update({ name, description, image, price, discount, link })
      .then(() => {
        alert('Katalog berhasil diperbarui');
        document.getElementById('updateModal').style.display = 'none';
      })
      .catch((error) => alert(error.message));
});

// Delete
function deleteCatalog(key) {
    if (confirm('Hapus katalog ini?')) {
      catalogRef.child(key).remove()
        .then(() => alert('Katalog dihapus'))
        .catch((error) => alert(error.message));
    }
}