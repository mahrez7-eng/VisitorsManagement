# 📋 Visitors Management System

Sistema ya Kunyweni Wageni - Majibu ya Kurekebisha Wageni Sawasawa na Uchumba wa Ziarani

## Sifa za Jukumu

✅ **Login System** - Ufunguo wa salama na uhalali  
✅ **Dashboard** - Muhtasari wa wageni na takwimu  
✅ **Register Visitors** - Kurekebisha wageni wapya kwa haraka  
✅ **View Visitors** - Tazama orodha kamili ya wageni  
✅ **Check-in/Check-out** - Rekodi ya ujio na kutoka  
✅ **Search & Filter** - Tafuta wageni kwa haraka  
✅ **Responsive Design** - Inafanya kazi vizuri kwenye simu na kompyuta  

## Teknolohia Iliyotumika

- **React 19** - UI Library
- **React Router** - Page Navigation
- **Vite** - Build Tool
- **CSS3** - Styling

## Jinsi ya Kuanza

### 1. Install Dependencies
```bash
npm install
```

### 2. Haraka na Dev Server
```bash
npm run dev
```

### 3. Build para sa Production
```bash
npm run build
```

## Struktura ya Projekti

```
src/
├── pages/              # Kurasa kuu
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── RegisterVisitorPage.jsx
│   └── VisitorsPage.jsx
├── components/         # Sehemu za React
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── context/           # State Management
│   └── AuthContext.jsx
├── styles/            # CSS Files
│   ├── App.css
│   ├── Navbar.css
│   ├── LoginPage.css
│   ├── DashboardPage.css
│   ├── RegisterVisitorPage.css
│   └── VisitorsPage.css
└── App.jsx           # Main App Component
```

## Features Kwa Kila Page

### 🔐 Login Page
- Email validation
- Password entry
- Demo credentials (use any email and password)
- Smooth transitions

### 📊 Dashboard
- Total visitors counter
- Today's visitors
- Active visitors
- Quick actions buttons
- Recent visitors list

### ➕ Register Visitor
- Full name
- Phone number
- Email (optional)
- Company/Organization
- Person to visit
- Purpose of visit
- ID number
- Check-in date
- Check-out date (optional)

### 👥 Visitors List
- View all registered visitors
- Search by name, phone, or person visited
- Filter by status (active/checked-out)
- Mark visitors as checked out
- Delete visitor records
- Expanded details view

## Data Storage

Data pia stored kwenye browser's localStorage:
- Wakati wa kurekebisha wageni - inakamatwa automatically
- Wakati wa kunataka kuangalia - inakuja kwenye localStorage

## Login Demo

Para kupiga ujio kwa system:
- **Email**: Tumia email yoyote (e.g., admin@example.com)
- **Password**: Tumia password yoyote
- System itakukubali automatic

## Customization

### Kuongeza Features Mpya
1. Create new page component in `src/pages/`
2. Add route in `App.jsx`
3. Create CSS file in `src/styles/`
4. Ikiwa ni protected route, weka ProtectedRoute wrapper

### Kubadiisha Colors
Edit `src/styles/Navbar.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## Future Enhancements

- Backend API integration
- Database storage
- Email notifications
- Visitor reports and analytics
- Multi-language support
- Dark mode

## License

MIT License
