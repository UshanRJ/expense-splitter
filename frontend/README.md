# 💰 Expense Splitter

A modern web application for splitting party expenses fairly among friends. Built with React, Node.js, and SQLite.

![Expense Splitter Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=Expense+Splitter+Demo)

## ✨ Features

- 🎉 **Create Events** - Organize your parties and gatherings
- 💸 **Smart Splitting** - Split expenses based on participation
- 👥 **Attendee Management** - Add unlimited attendees
- 📊 **Real-time Calculations** - Automatic expense calculations
- 📱 **Responsive Design** - Works on all devices
- 📈 **Excel Export** - Download detailed expense reports
- 🎨 **Modern UI** - Beautiful glass morphism design

## 🚀 Live Demo

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API**: [https://your-backend.up.railway.app](https://your-backend.up.railway.app)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database
- **XLSX** - Excel export

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/yourusername/expense-splitter.git
cd expense-splitter
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🚀 Deployment

### Option 1: Vercel + Railway (Recommended)

1. **Deploy Backend to Railway:**
   - Push to GitHub
   - Connect Railway to your repo
   - Auto-deploys backend

2. **Deploy Frontend to Vercel:**
   - Connect Vercel to your repo  
   - Set build settings for `/frontend`
   - Add environment variables

### Option 2: GitHub Pages + Heroku

Follow the deployment guide in `/docs/deployment.md`

## 📁 Project Structure

```
expense-splitter/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/          # Configuration files
│   │   └── ...
├── backend/                 # Node.js API
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   └── ...
├── docs/                   # Documentation
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔧 Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=https://expense-splitter-wheat.vercel.app/
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
DATABASE_PATH=./expense_splitter.db
```

## 📖 Usage

1. **Create an Event** - Add party name and date
2. **Add Attendees** - Include all friends who attended
3. **Add Categories** - Create expense categories (Food, Drinks, etc.)
4. **Set Participation** - Check who should pay for each category
5. **Calculate Results** - View detailed breakdown and settlements
6. **Export Report** - Download Excel file with all details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by the need for fair expense splitting
- Built with modern web technologies

---

⭐ **Star this repo if you found it helpful!**