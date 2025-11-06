import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME ?? "noxsha";

const now = Date.now();

const rawBooks = [
    {
        title: "Atomic Habits",
        author: "James Clear",
        price: 32,
        old_price: 40,
        rating: 4.8,
        sales_count: 15420,
        category: "Self-improvement",
        is_bestseller: true,
        is_new: true,
        image_url:
            "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg",
        description:
            "An Easy & Proven Way to Build Good Habits & Break Bad Ones. Transform your life with tiny changes that lead to remarkable results.",
    },
    {
        title: "IKIGAI",
        author: "Héctor García",
        price: 28,
        old_price: 35,
        rating: 4.7,
        sales_count: 12340,
        category: "Self-improvement",
        is_bestseller: true,
        is_new: true,
        image_url:
            "https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg",
        description:
            "The Japanese secret to a long and happy life. Discover your reason for being and live with purpose.",
    },
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 25,
        old_price: 32,
        rating: 4.9,
        sales_count: 21540,
        category: "Fiction",
        is_bestseller: true,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/7504825/pexels-photo-7504825.jpeg",
        description:
            "A magical tale about following your dreams. Journey with Santiago as he seeks his Personal Legend.",
    },
    {
        title: "Emotional Intelligence",
        author: "Daniel Goleman",
        price: 32,
        old_price: null,
        rating: 4.6,
        sales_count: 8950,
        category: "Psychology",
        is_bestseller: false,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/8111764/pexels-photo-8111764.jpeg",
        description:
            "Why it can matter more than IQ. Master your emotions and transform your relationships.",
    },
    {
        title: "How to Talk to Anyone",
        author: "Leil Lowndes",
        price: 28,
        old_price: null,
        rating: 4.5,
        sales_count: 6230,
        category: "Communication",
        is_bestseller: false,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg",
        description:
            "92 little tricks for big success in relationships. Master the art of conversation and connection.",
    },
    {
        title: "Who Moved My Cheese?",
        author: "Spencer Johnson",
        price: 22,
        old_price: null,
        rating: 4.4,
        sales_count: 9870,
        category: "Business",
        is_bestseller: false,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/7034720/pexels-photo-7034720.jpeg",
        description:
            "An amazing way to deal with change in your work and life. A timeless business classic.",
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        price: 30,
        old_price: null,
        rating: 4.7,
        sales_count: 11200,
        category: "Finance",
        is_bestseller: false,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg",
        description:
            "Timeless lessons on wealth, greed, and happiness. Understanding the psychology behind financial decisions.",
    },
    {
        title: "The 10X Rule",
        author: "Grant Cardone",
        price: 35,
        old_price: 42,
        rating: 4.6,
        sales_count: 10450,
        category: "Business",
        is_bestseller: true,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/5632403/pexels-photo-5632403.jpeg",
        description:
            "The only difference between success and failure. Take massive action to achieve extraordinary results.",
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        price: 32,
        old_price: 38,
        rating: 4.8,
        sales_count: 18920,
        category: "Finance",
        is_bestseller: true,
        is_new: false,
        image_url:
            "https://images.pexels.com/photos/8112173/pexels-photo-8112173.jpeg",
        description:
            "What the rich teach their kids about money that the poor and middle class do not!",
    },
    {
        title: "How to Talk",
        author: "Celeste Headlee",
        price: 35,
        old_price: null,
        rating: 4.5,
        sales_count: 5430,
        category: "Communication",
        is_bestseller: false,
        is_new: true,
        image_url:
            "https://images.pexels.com/photos/7034718/pexels-photo-7034718.jpeg",
        description:
            "How to have better conversations. A guide to meaningful communication in the digital age.",
    },
];

const books = rawBooks.map((item, index) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        title: item.title,
        author: item.author,
        price: item.price,
        old_price: item.old_price,
        rating: item.rating,
        sales_count: item.sales_count,
        description: item.description,
        image_url: item.image_url,
        image_storage_name: null,
        pdf_storage_name: null,
        pdf_original_name: null,
        category: item.category,
        is_bestseller: item.is_bestseller,
        is_new: item.is_new,
        created_at: new Date(now - index * 60 * 60 * 1000),
    };
});

const siteSettings = [
    ["hero_title", "Find Your Next Book", "Main hero title"],
    [
        "hero_subtitle",
        "Discover a world where every page brings a new adventure. At Noxsha, we curate digital stories that inspire.",
        "Main hero subtitle",
    ],
    ["hero_button_label", "Browse Now", "Hero primary button text"],
    [
        "hero_highlights",
        '[{"author":"James Clear","label":"James Clear\'s latest insights"},{"author":"Newsletter Vol","label":"Fresh newsletter editions"},{"author":"Robert Kiyosaki","label":"Money wisdom from Kiyosaki"},{"author":"Brian Tracy","label":"Productivity hacks by Brian Tracy"}]',
        "Hero highlight line items in JSON",
    ],
    ["header_logo_text", "Noxsha", "Header brand name"],
    [
        "header_search_placeholder",
        "Search books by title or author...",
        "Header search placeholder",
    ],
    ["header_admin_tooltip", "Admin Dashboard", "Tooltip for admin icon"],
    ["home_search_title", "Search Results", "Headline shown on search results"],
    ["home_search_empty_title", "No books found", "Empty search headline"],
    [
        "home_search_empty_description",
        "Try a different keyword to continue exploring our library.",
        "Empty search helper text",
    ],
    [
        "home_search_result_meta",
        "books found",
        "Suffix used in search result summary",
    ],
    [
        "home_section_recommended_title",
        "Recommended for you",
        "Home section title",
    ],
    [
        "home_section_recent_title",
        "Recently added",
        "Home recent section title",
    ],
    [
        "home_section_bestseller_title",
        "Most popular",
        "Home bestseller section title",
    ],
    [
        "home_section_popular_title",
        "Popular this month",
        "Home popular section title",
    ],
    ["category_section_title", "Categories", "Category section title"],
    ["category_section_cta_label", "View all", "Category section button label"],
    ["services_section_title", "Why readers love us", "Services section title"],
    [
        "services_section_cta_label",
        "Explore more",
        "Services section button label",
    ],
    ["footer_company_name", "Noxsha", "Footer company name"],
    [
        "footer_description",
        "A digital library providing free access to curated e-books. Discover knowledge without barriers.",
        "Footer company description",
    ],
    [
        "footer_quick_links",
        '[{"label":"About us","href":"#about"},{"label":"E-books","href":"#ebook"},{"label":"Privacy Policy","href":"/privacy"},{"label":"Terms of use","href":"/terms"}]',
        "Footer quick link items in JSON",
    ],
    [
        "footer_contact_links",
        '[{"label":"Email: hello@noxsha.com","href":"mailto:hello@noxsha.com"},{"label":"Support: support@noxsha.com","href":"mailto:support@noxsha.com"}]',
        "Footer contact info list in JSON",
    ],
    [
        "footer_bottom_text",
        "Copyright © 2025 Noxsha. All rights reserved.",
        "Footer legal line",
    ],
    [
        "downloads_form_description",
        "Provide your information to access this free e-book instantly. We respect your privacy and never share your details.",
        "Download form helper text",
    ],
    [
        "downloads_success_message",
        "Download ready! A secure link has been sent to your inbox if applicable.",
        "Download success message",
    ],
].map(([key, value, description]) => ({
    _id: key,
    key,
    value,
    description,
    updated_at: new Date(),
}));

const socialLinks = [
    ["Facebook", "https://facebook.com", "Facebook"],
    ["Instagram", "https://instagram.com", "Instagram"],
    ["Twitter", "https://twitter.com", "Twitter"],
].map(([platform, url, icon_name]) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        platform,
        url,
        icon_name,
        is_active: true,
        created_at: new Date(),
    };
});

const navLinks = [
    ["Home", "/", 0],
    ["E-books", "#ebook", 1],
    ["About", "#about", 2],
].map(([label, href, display_order]) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        label,
        href,
        display_order,
        created_at: new Date(),
    };
});

const baseCategoryColor = [
    { name: "General", icon: "BookOpen", h: 260, s: 58, l: 46 },
    { name: "History", icon: "Scroll", h: 25, s: 65, l: 42 },
    { name: "Science Fiction", icon: "Sparkles", h: 200, s: 70, l: 45 },
    { name: "Self-improvement", icon: "TrendingUp", h: 140, s: 55, l: 44 },
    { name: "Psychology", icon: "Brain", h: 320, s: 50, l: 44 },
    { name: "Business", icon: "Briefcase", h: 35, s: 70, l: 44 },
    { name: "Finance", icon: "Wallet", h: 52, s: 70, l: 43 },
    { name: "Communication", icon: "MessageSquare", h: 205, s: 65, l: 45 },
    { name: "Fiction", icon: "Feather", h: 285, s: 55, l: 44 },
    { name: "Classics", icon: "Library", h: 15, s: 55, l: 43 },
    { name: "Thriller", icon: "Zap", h: 0, s: 75, l: 40 },
    { name: "Adventure", icon: "Compass", h: 180, s: 60, l: 45 },
    { name: "Health", icon: "HeartPulse", h: 340, s: 60, l: 45 },
    { name: "Technology", icon: "Cpu", h: 210, s: 60, l: 43 },
];

const categories = baseCategoryColor.map((item) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        name: item.name,
        icon_name: item.icon,
        color_h: item.h,
        color_s: item.s,
        color_l: item.l,
        created_at: new Date(),
        updated_at: new Date(),
    };
});

const highlightCategories = [
    ["History", "BookOpen", 0],
    ["Children Corner", "Users", 1],
    ["Science Fiction", "Sparkles", 2],
    ["Self-improvement", "TrendingUp", 3],
    ["Comics", "Heart", 4],
].map(([name, icon_name, display_order]) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        name,
        icon_name,
        display_order,
        created_at: new Date(),
    };
});

const highlightServices = [
    [
        "Instant access",
        "Download instantly after grabbing your favourite title.",
        "Package",
        0,
    ],
    [
        "Always free",
        "Absolutely no hidden costs or subscriptions required.",
        "Shield",
        1,
    ],
    [
        "24/7 support",
        "Reach out any time you need help discovering books.",
        "Headphones",
        2,
    ],
    [
        "Multiple formats",
        "Enjoy PDF, EPUB and more in a single click.",
        "Truck",
        3,
    ],
].map(([title, description, icon_name, display_order]) => {
    const id = randomUUID();
    return {
        _id: id,
        id,
        title,
        description,
        icon_name,
        display_order,
        created_at: new Date(),
    };
});

const adminId = randomUUID();
const adminUsers = [
    {
        _id: adminId,
        id: adminId,
        email: "<EMAIL>",
        password_hash: "<HASH>",
        name: "Super Admin",
        is_active: true,
        created_at: new Date(),
    },
];

const reviews = [
    (() => {
        const id = randomUUID();
        return {
            _id: id,
            id,
            book_id: books[0]?.id ?? "",
            reviewer_name: "Anika Rahman",
            rating: 4.9,
            comment:
                "Atomic Habits reshaped my routine. Practical tips that actually work!",
            is_approved: true,
            created_at: new Date(now - 2 * 24 * 60 * 60 * 1000),
        };
    })(),
    (() => {
        const id = randomUUID();
        return {
            _id: id,
            id,
            book_id: books[2]?.id ?? "",
            reviewer_name: "Farhan Ali",
            rating: 4.6,
            comment:
                "A beautiful story that keeps you dreaming long after you finish it.",
            is_approved: false,
            created_at: new Date(now - 24 * 60 * 60 * 1000),
        };
    })(),
].filter((review) => review.book_id);

const collections = [
    {
        name: "books",
        data: books,
        setup: async (collection) => {
            await collection.createIndex({ id: 1 }, { unique: true });
            await collection.createIndex({ category: 1 });
            await collection.createIndex({ title: "text", author: "text" });
        },
    },
    {
        name: "site_settings",
        data: siteSettings,
        setup: async (collection) => {
            await collection.createIndex({ key: 1 }, { unique: true });
        },
    },
    {
        name: "social_links",
        data: socialLinks,
        setup: async (collection) => {
            await collection.createIndex({ platform: 1 }, { unique: true });
        },
    },
    {
        name: "nav_links",
        data: navLinks,
        setup: async (collection) => {
            await collection.createIndex({ label: 1 }, { unique: true });
            await collection.createIndex({ display_order: 1 });
        },
    },
    {
        name: "categories",
        data: categories,
        setup: async (collection) => {
            await collection.createIndex({ name: 1 }, { unique: true });
        },
    },
    {
        name: "highlight_categories",
        data: highlightCategories,
        setup: async (collection) => {
            await collection.createIndex({ name: 1 }, { unique: true });
            await collection.createIndex({ display_order: 1 });
        },
    },
    {
        name: "highlight_services",
        data: highlightServices,
        setup: async (collection) => {
            await collection.createIndex({ title: 1 }, { unique: true });
            await collection.createIndex({ display_order: 1 });
        },
    },
    {
        name: "admin_users",
        data: adminUsers,
        setup: async (collection) => {
            await collection.createIndex({ email: 1 }, { unique: true });
        },
    },
    {
        name: "reviews",
        data: reviews,
        setup: async (collection) => {
            await collection.createIndex({ book_id: 1 });
            await collection.createIndex({ is_approved: 1, created_at: -1 });
        },
    },
    {
        name: "downloads",
        data: [],
        setup: async (collection) => {
            await collection.createIndex({ book_id: 1 });
            await collection.createIndex({ created_at: -1 });
        },
    },
];

async function seed() {
    const client = new MongoClient(uri);
    console.log(`📚 Seeding database "${dbName}" using ${uri}`);

    try {
        await client.connect();
        const db = client.db(dbName);

        for (const { name, data, setup } of collections) {
            const collection = db.collection(name);
            await collection.deleteMany({});
            if (data.length > 0) {
                await collection.insertMany(data, { ordered: true });
            }
            if (typeof setup === "function") {
                await setup(collection);
            }
            console.log(` - ${name}: inserted ${data.length} document(s)`);
        }

        console.log("✅ MongoDB seed completed successfully.");
    } catch (error) {
        console.error("❌ Failed to seed MongoDB:", error);
        process.exitCode = 1;
    } finally {
        await client.close();
    }
}

seed();
