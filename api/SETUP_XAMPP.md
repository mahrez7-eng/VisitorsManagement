# 🛠️ Jinsi ya Kusetup Backend (PHP + MySQL) kwenye XAMPP

Backend hii tayari ipo kwenye folda ya `api/` — imejengwa na **PHP safi (PDO)** na
**MySQL/MariaDB**. Imeundwa upya ili ifanye kazi vizuri na Apache ya XAMPP
(nimeongeza faili la `.htaccess` na kurekebisha routing).

## 📁 Faili muhimu ndani ya `api/`

| Faili | Kazi yake |
|---|---|
| `index.php` | "Front controller" — inapokea maombi yote na kuyapeleka kwenye resource sahihi (users/experts/visitors/auth) |
| `config.php` | Muunganisho wa database (PDO) |
| `schema.sql` | Muundo wa jedwali + data ya awali (seed) |
| `.htaccess` | Inaelekeza URL zote kwenda `index.php` (routing) |

## 1️⃣ Weka mradi ndani ya XAMPP

Nakili folda nzima ya `visitors` (au angalau folda ya `api`) ndani ya:

```
C:\xampp\htdocs\visitors
```

Kwa hiyo backend itakuwa inafikika kupitia:
```
http://localhost/visitors/api/...
```

> 💡 Routing imetengenezwa iwe "flexible" — haijalishi ukiweka kwenye
> `htdocs/visitors/api` au `htdocs/api` moja kwa moja, itafanya kazi.

## 2️⃣ Anzisha Apache na MySQL

Fungua **XAMPP Control Panel** → bofya **Start** kwenye:
- ✅ Apache
- ✅ MySQL

## 3️⃣ Tengeneza Database

1. Fungua browser: `http://localhost/phpmyadmin`
2. Bofya kichupo cha **Import**
3. Chagua faili `api/schema.sql`
4. Bofya **Go**

Hii itatengeneza database `visitors_db` pamoja na jedwali `users`, `experts`,
`visitors`, na data ya majaribio:

- Mtumiaji: `admin` / `admin` (role: admin)
- Mtumiaji: `receptionist` / `receptionist`
- Wataalamu 4 wa mfano

> Kama una mysql/mariadb tofauti na password ya root, badilisha ndani ya
> `config.php` (default: host `127.0.0.1`, user `root`, password tupu `""`).

## 4️⃣ Jaribu kama API inafanya kazi

Fungua browser na uende:
```
http://localhost/visitors/api/users
```
Unatakiwa kuona JSON ya watumiaji (admin, receptionist).

Jaribu pia:
```
http://localhost/visitors/api/experts
http://localhost/visitors/api/visitors
```

## 5️⃣ Unganisha Frontend (React) na Backend hii

Ndani ya folda ya `frontend/`, hariri faili `.env`:

```
VITE_API_BASE=http://localhost/visitors/api
```

(badilisha `visitors` kama umeweka folda kwa jina tofauti)

Kisha:
```bash
cd frontend
npm install
npm run dev
```

Fungua `http://localhost:5173`, ingia na `admin`/`admin` — mfumo utaunganisha
moja kwa moja na PHP/MySQL backend badala ya localStorage tu.

## 🔌 Njia (Endpoints) zilizopo

| Method | URL | Maelezo |
|---|---|---|
| POST | `/api/auth/login` | Kuingia — `{username, password}` |
| GET | `/api/users` | Orodha ya watumiaji |
| POST | `/api/users` | Ongeza mtumiaji |
| PUT | `/api/users` | Sasisha (au badilisha orodha nzima) |
| DELETE | `/api/users` | Futa — `{id}` |
| GET/POST/PUT/DELETE | `/api/experts` | Sawa na hapo juu, kwa wataalamu |
| GET/POST/PUT/DELETE | `/api/visitors` | Sawa na hapo juu, kwa wageni |

## 🩺 Utatuzi wa matatizo ya kawaida

**"Database connection failed"**
→ Hakikisha MySQL inaendesha kwenye XAMPP Control Panel, na jina la database
ni `visitors_db` (angalia kwenye phpMyAdmin).

**404 Not Found kwenye kila URL ya `/api/...`**
→ Angalia kama `.htaccess` ipo ndani ya folda ya `api`, na kwenye
`C:\xampp\apache\conf\httpd.conf` module ya `rewrite_module` haijafungwa (default
XAMPP inakuja na `mod_rewrite` ikiwa imewezeshwa).

**CORS error kwenye console ya browser**
→ Backend tayari ina `Access-Control-Allow-Origin: *` — kama bado kuna tatizo,
hakikisha unafikia backend na `http://localhost/...` sio `127.0.0.1` kwa
kuchanganya (au kinyume chake) — chagua moja tu na uendelee nayo.
