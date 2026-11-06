# Yukchi admin

Nuxt 3 admin konsoli: moderasiya navbatı, foydalanuvchilar, shikoyatlar va sozlamalar. Kirish admin telefon raqami orqali OTP bilan.

```bash
npm install
npm run dev      # http://localhost:3002
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1 npm run dev
```

Admin ro'yxatdan o'tishi uchun API tomonida `User.role = ADMIN` bo'lishi kerak.
