# 🚀 GitHub Setup Instructions

## Co już masz gotowe ✅
- Git repository zainicjalizowane  
- Pierwszy commit z całym projektem (48 plików)
- Professional README.md
- .gitignore skonfigurowany
- Vercel.json deployment config

## 📋 Następne kroki:

### **1. Utwórz repository na GitHub**

1. Idź na: **https://github.com/new**
2. **Repository name**: `chess-learning-app` (lub coś innego)
3. **Description**: `Professional chess learning app with AI analysis`
4. **Public** ✅ (żeby inne osoby mogły to zobaczyć)
5. **Initialize repository**: ❌ NIE ZAZNACZAJ (mamy już pliki)
6. Kliknij **"Create repository"**

### **2. Połącz lokalny projekt z GitHub**

Po utworzeniu repo, GitHub pokaże Ci komendy. Użyj tego:

```bash
# Dodaj GitHub jako remote origin
git remote add origin https://github.com/YOUR_USERNAME/chess-learning-app.git

# Zmień nazwę brancha na main (GitHub standard)
git branch -M main

# Wyślij kod na GitHub
git push -u origin main
```

### **3. Vercel - Połączenie z GitHub**

1. **Idź na Vercel Dashboard**: https://vercel.com/dashboard
2. Kliknij **"New Project"**
3. **Import Git Repository** → Choose GitHub
4. Znajdź swoje repo: `chess-learning-app`
5. Kliknij **"Import"**
6. **Framework Preset**: Vite ✅
7. **Root Directory**: `./` (domyślnie)
8. **Build Command**: `npm run build` (automatycznie)
9. **Output Directory**: `dist` (automatycznie)
10. Kliknij **"Deploy"**

### **4. Dodaj Custom Domain (po deployment)**

1. W Vercel Dashboard → Your Project
2. **Settings** → **Domains**  
3. **Add Domain** → wpisz swoją domenę (np. `yourdomain.com`)
4. Vercel poda Ci DNS records do ustawienia
5. W panelu domeny (nazwa.pl lub gdzie kupiłeś) dodaj:
   ```
   Type: CNAME
   Name: www  
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.19
   ```

## 🎯 Automatyczne wdrażanie

Po połączeniu GitHub + Vercel:
- ✅ **Każdy push** na GitHub → automatyczny deploy na Vercel
- ✅ **Preview deployments** dla pull requestów
- ✅ **Production deployment** z main branch
- ✅ **Rollback** w 1 klik jeśli coś pójdzie nie tak

## 🔗 Linki które będziesz miał:

### **GitHub Repository**  
`https://github.com/YOUR_USERNAME/chess-learning-app`

### **Vercel Deployment**
`https://chess-learning-app-xxx.vercel.app` (czasowy)

### **Custom Domain** (po konfiguracji DNS)
`https://yourdomain.com`

## 🚨 Troubleshooting

### **Problem: "Repository already exists"**
- Zmień nazwę na GitHub lub użyj inną

### **Problem: "Permission denied"**  
- Może potrzebujesz Personal Access Token zamiast hasła
- GitHub → Settings → Developer Settings → Personal Access Tokens

### **Problem: DNS nie działa**
- DNS może potrzebować 24h żeby się propagować
- Sprawdź: https://whatsmydns.net

## ✅ Checklist - zrób to teraz:

- [ ] Utwórz repo na GitHub
- [ ] Uruchom komendy git remote/push  
- [ ] Połącz z Vercel
- [ ] Przetestuj deployment
- [ ] Dodaj custom domain
- [ ] Skonfiguruj DNS

**Za 15 minut będziesz miał live aplikację! 🎉**