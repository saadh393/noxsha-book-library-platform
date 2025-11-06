# নোকশা-বুক

নোকশা একটি Next.js ভিত্তিক ডিজিটাল লাইব্রেরি যা এখন সর্বশেষ MongoDB Atlas/কমিউনিটি সার্ভারের সাথে কাজ করে। ফ্রন্টএন্ডে React 18, Tailwind CSS ও Framer Motion ব্যবহার করা হয়েছে, এবং অ্যাডমিন প্যানেলের জন্য কাস্টম REST API রুট ও JWT কুকি ভিত্তিক অথ প্রয়োগ করা হয়েছে।

## দ্রুত শুরু

1. `.env.example` কপি করে `.env.local` তৈরি করুন ও প্রয়োজনীয় MongoDB মান (`MONGODB_URI`, `MONGODB_DB_NAME`) সেট করুন  
2. লোকাল MongoDB সার্ভার চালু রাখুন (অথবা Atlas কানেকশন প্রস্তুত করুন)
3. ডিপেন্ডেন্সি ইনস্টল করুন:
   ```bash
   npm install
   ```
4. ডিফল্ট ডেটাসেট লোড করুন:
   ```bash
   node database/seed.mjs
   ```
5. ডেভ সার্ভার চালান:
   ```bash
   npm run dev
   ```

বিস্তারিত সেটআপ নির্দেশনার জন্য `SETUP_INSTRUCTIONS.md` এবং অ্যাডমিন ওয়ার্কফ্লোর জন্য `ADMIN_GUIDE.md` দেখুন।
