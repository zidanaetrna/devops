# Deploy otomatis: GitHub Actions ke Netlify

Starter hands-on untirta-io. Setelah semua langkah di bawah beres, tiap kalian `git push` ke branch `main`, GitHub Actions bakal build web ini dan upload hasilnya ke Netlify.

Ikutin dari atas ke bawah, jangan loncat.

## 0. Yang harus ada dulu

- Akun GitHub
- Akun Netlify (daftar pakai "Sign up with GitHub" biar cepet)
- Git. Cek di terminal: `git --version`
- Node.js **22 atau lebih baru**. Cek: `node -v`. Node ini cuma buat nyoba di laptop. Kalau nggak ada, kalian tetap bisa ikut, soalnya build-nya jalan di GitHub.

Kalau belum pernah pakai Git di laptop ini, kenalin diri dulu (cukup sekali):

```
git config --global user.name "username-github-kalian"
git config --global user.email "email-github-kalian"
```

## 1. Bikin repo kalian sendiri dari template

Jangan clone `zidanaetrna/devops` langsung. Repo itu punya pembicara, kalian nggak bisa push ke sana dan nggak bisa isi secret-nya.

1. Buka https://github.com/zidanaetrna/devops
2. Klik **Use this template** → **Create a new repository**.
3. Owner: akun kalian. Nama repo: bebas (misal `deploy-pertama`). Pilih **Public**. Klik **Create repository**.
4. Clone repo **kalian** (bukan punya pembicara):

```
git clone https://github.com/<username-kalian>/<nama-repo>.git
cd <nama-repo>
```

> Tab **Actions** di repo kalian kemungkinan langsung nunjukin satu run yang **gagal**. Itu normal, secret Netlify-nya belum diisi. Nanti kita jalanin ulang di langkah 4.

Mau nyoba jalanin di laptop dulu (opsional, butuh Node):

```
npm install
npm run dev
```

Buka http://localhost:5173. Matiin pakai `Ctrl+C`.

## 2. Siapin Netlify

Netlify sekarang nyebut "site" sebagai "project". Isinya sama.

1. **Bikin project kosong.** Di halaman Projects klik **Add new project**. Scroll ke bagian **Upload your project files**, terus drag file `index.html` dari repo ini ke kotak itu. Isinya nggak penting, nanti ketimpa pas deploy pertama dari GitHub Actions.
   Jangan pilih **Import a Git repository**. Kalau itu yang dipilih, Netlify ikut build sendiri dan deploy-nya jadi dobel.
2. **Salin Site ID.** Buka project tadi → **Project configuration** → **General** → bagian **Project information** → salin **Project ID** (di bawahnya ada tulisan *Also known as Site ID*, itu angka yang sama).
3. **Bikin token.** Klik foto profil di pojok kiri bawah → **User settings** → **Applications** → **Personal access tokens** → **New access token**. Kasih nama (misal `github-actions`), pilih masa berlaku, terus salin tokennya. Token cuma ditampilin sekali.

Simpan dua nilai ini sementara di Notepad. Jangan di-commit ke repo.

## 3. Isi secret di repo kalian

Repo kalian di GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Bikin dua, namanya harus persis:

| Name | Secret |
|---|---|
| `NETLIFY_AUTH_TOKEN` | token dari langkah 2.3 |
| `NETLIFY_SITE_ID` | Site ID dari langkah 2.2 |

## 4. Jalanin workflow pertama kali

1. Buka tab **Actions** di repo kalian.
2. Klik run yang tadi gagal → tombol **Re-run jobs** di kanan atas → **Re-run all jobs**. Kalau nggak ada run sama sekali: klik **Deploy ke Netlify** di kiri → **Run workflow** → **Run workflow**.
3. Tunggu sampai semua step hijau (biasanya 1–2 menit). Klik tiap step buat liat apa yang dikerjain.
4. Buka URL Netlify kalian: `https://<nama-project>.netlify.app`. Ada juga di dashboard Netlify.

## 5. Ubah, push, cek

1. Edit `index.html`: ganti isi `<title>` sama `<h1>`.
2. Push dari terminal, satu per satu:

```
git add .
git commit -m "ganti judul"
git push
```

Pertama kali push, Git bakal buka browser buat login GitHub. Login aja, itu normal.

3. Tab **Actions** → tunggu hijau → refresh web kalian. Judul sama tulisan **Versi build** di bawahnya harus udah berubah. Kalau Versi build berubah tapi judul nggak, berarti file yang kalian edit belum ke-commit.

## 6. Bonus: lewat branch dan Pull Request

```
git checkout -b ganti-warna
```

Edit warna di `src/style.css`, terus:

```
git commit -am "ganti warna"
git push -u origin ganti-warna
```

Di GitHub, klik **Compare & pull request** → **Create pull request**. Workflow jalan, tapi cuma build. Step **Deploy ke Netlify** ke-skip. Web kalian belum berubah.

Klik **Merge pull request**. Workflow jalan lagi di `main`, kali ini sampai deploy.

## Pakai project kalian sendiri

Bisa, asal project-nya di-build pakai `npm run build` dan hasilnya web statis (HTML/CSS/JS).

1. Copy `.github/workflows/deploy.yml` dari repo ini ke project kalian, path-nya harus sama persis.
2. Ganti `PUBLISH_DIR` di `deploy.yml` sesuai folder hasil build:

   | Project | `PUBLISH_DIR` |
   |---|---|
   | Vite (React/Vue/Svelte/vanilla), Astro | `dist` |
   | Create React App | `build` |
   | Next.js dengan `output: 'export'` | `out` |

3. Branch utamanya harus `main`. Kalau masih `master`, jalanin `git branch -M main` terus push, atau ganti `branches: [main]` di `deploy.yml`.
4. Lanjut dari langkah 2 di atas.

## Kalau gagal

Buka run yang merah di tab Actions, klik step yang ada tanda silangnya, baca pesan error-nya.

| Pesan | Penyebab | Benerin |
|---|---|---|
| `Secret NETLIFY_AUTH_TOKEN atau NETLIFY_SITE_ID belum diisi` | Secret belum dibikin atau namanya salah | Cek langkah 3, nama harus huruf besar semua dan persis sama |
| `Unauthorized` / `401` | Token salah, kedaluwarsa, atau udah dihapus | Bikin token baru, timpa secret `NETLIFY_AUTH_TOKEN` |
| `Not Found` / `404` | Site ID salah | Salin ulang dari Netlify, timpa `NETLIFY_SITE_ID` |
| `Folder 'dist' nggak ada setelah build` | Folder hasil build project kalian beda | Ganti `PUBLISH_DIR` |
| `Missing script: "build"` | `package.json` nggak punya script `build` | Tambahin script-nya |
| `npm ci` error soal lockfile | `package-lock.json` nggak sinkron atau nggak ke-commit | Jalanin `npm install` di laptop, commit `package-lock.json` |
| `git push` ditolak `403` | Kalian push ke repo orang lain, atau belum login | Cek `git remote -v`, harus repo kalian. Kalau salah: `git remote set-url origin https://github.com/<username-kalian>/<nama-repo>.git` |
| Workflow nggak muncul sama sekali | File nggak di `.github/workflows/`, atau branch bukan `main` | Cek path file dan nama branch |
| Hijau tapi web nggak berubah | Ke-cache browser | `Ctrl+Shift+R` atau buka di incognito |
