# নোকশা-বুক

নোকশা একটি Next.js ভিত্তিক ডিজিটাল লাইব্রেরি যেটি এখন MySQL ডাটাবেজের সাথে সংযুক্ত। ফ্রন্টএন্ডে React 18, Tailwind CSS ও Framer Motion ব্যবহার করা হয়েছে, এবং অ্যাডমিন প্যানেলের জন্য কাস্টম REST API রুট ও JWT কুকি ভিত্তিক অথ প্রয়োগ করা হয়েছে।

## দ্রুত শুরু

1. `.env.example` কপি করে `.env.local` তৈরি করুন ও প্রয়োজনীয় মান বদলান  
2. MySQL চালু করে স্কিমা ও সিড ডেটা লোড করুন:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   > বিদ্যমান ডাটাবেজ আপগ্রেড করার সময় `database/migrations` ফোল্ডারের সর্বশেষ স্ক্রিপ্টগুলিও চালান, উদাহরণস্বরূপ:
   > ```bash
   > mysql -u root -p noxsha < database/migrations/20251102_add_storage_columns.sql
   > ```
3. ডিপেন্ডেন্সি ইনস্টল করে ডেভ সার্ভার চালান:
   ```bash
   npm install
   npm run dev
   ```

বিস্তারিত সেটআপ নির্দেশনার জন্য `SETUP_INSTRUCTIONS.md` এবং অ্যাডমিন ওয়ার্কফ্লোর জন্য `ADMIN_GUIDE.md` দেখুন।
