import type { Exercise, Lesson } from '../../types'

/** 世界 4「設計」：關 8、9、10。大多是紙筆題，expect 寫「你的答案要有什麼」。 */
export const world4: Record<number, Lesson[]> = {
  8: [
    {
      id: '8-1',
      title: '1NF：一格一個值',
      focus: '一格只放一個值（1NF）',
      check: "看到 'A1, M2' 這種欄位，知道要拆成子表",
      concept: '一個欄位只放一個值。多值欄位要拆成子表。',
      explain: [
        '1NF（First Normal Form）｜第一正規化：一格只放一個值，不能用逗號塞一串。',
        "Atomic value｜原子值：不能再拆的最小值。'A1, M2' 不是原子值，'A1' 才是。",
        "為什麼：塞一串之後，「找買過 M2 的訂單」只能用 LIKE '%M2%'，又慢又會誤判（M2 vs M20）。",
        '解法：把「很多值」搬成「很多列」，放到子表，用 FK 指回來。這就是 order_items 為什麼存在。',
        "怎麼畫：一格寫 'A1, M2' 打叉，旁邊畫一張兩列的小表 A1、M2，用線連回去。",
      ],
      cards: [44, 45],
      exercises: [
        {
          task: "看這張壞表：orders(id, products = 'A1, M2', quantities = '1, 2')。指出哪兩欄違反 1NF。",
          hint: '哪兩欄裡面有逗號？',
          expect: 'products 和 quantities。兩欄都在一格塞了多個值，而且要靠「位置」對應（第 1 個商品配第 1 個數量），很脆弱。',
          answer: 'products、quantities 違反 1NF。',
        },
        {
          task: '寫出拆完後的兩張表 DDL（orders、order_items）。',
          hint: '看 data/learning-db-seed.sql 裡的 order_items 就是答案的樣子。每個「商品＋數量」變成 order_items 的一列。',
          expect: 'orders 不再有 products／quantities 欄；order_items 有 order_id FK、product_id FK、quantity。',
          answer:
            'CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW());\nCREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL);',
        },
        {
          task: '用自己的話寫 2 句：拆完之後為什麼比較好。',
          hint: '想「查」和「改」兩個動作。',
          expect: '兩句，例如：查某商品的訂單可以 WHERE product_id = 2（不用 LIKE）；改一個數量只改一列，不會動到別的商品。',
          answer: '① 查詢可以用 = 和索引，不用 LIKE。② 每個值獨立一列，改／刪不會牽連別的值，也能加 FK 保證商品存在。',
        },
      ],
      project: {
        task: "你的 pets 表若有 diseases = '糖尿病,腎病' 欄，把它拆成 medical_history 表。寫出 DDL。",
        hint: '每一個病變成一列，pet_id 指回 pets。順便加診斷日期。',
        expect: 'medical_history(id, pet_id FK → pets, disease, diagnosed_at)；pets 表移除 diseases 欄。',
        answer: 'CREATE TABLE medical_history (id SERIAL PRIMARY KEY, pet_id INTEGER NOT NULL REFERENCES pets(id), disease VARCHAR(100) NOT NULL, diagnosed_at DATE);',
      },
      teachKeys: ['一格一個值', '多值拆成子表', '子表用 FK 指回來'],
    },
  ],
  9: [
    {
      id: '9-1',
      title: '2NF：靠整組主鍵',
      focus: '非鍵欄位要靠「整組」主鍵（2NF）',
      check: '看 enrollments 例子，指出哪個欄位該搬走',
      concept: '複合主鍵下，非鍵欄位不能只靠主鍵的一部分就被決定。',
      explain: [
        'Composite Primary Key（CPK）｜複合主鍵：兩個欄位合起來才是身分證，例如 (student_id, course_id)。',
        'Functional dependency｜函數依賴：A 決定 B 寫成 A → B。知道 course_id 就知道 instructor，所以 course_id → instructor。',
        'Partial dependency｜部分依賴：一個欄位只靠主鍵的「一半」就決定了。這就是 2NF 要消滅的東西。',
        '2NF｜第二正規化：先 1NF，且每個非鍵欄位都要靠「整組」主鍵。只靠一半的，搬去它自己的表。',
        '怎麼畫：主鍵兩格 [student_id | course_id]，從 course_id 畫一條箭頭到 instructor，寫「只靠一半 → 搬走」。',
      ],
      cards: [46, 47, 48],
      exercises: [
        {
          task: '看 enrollments(student_id, course_id, instructor, instructor_phone, grade)，PK 是 (student_id, course_id)。哪些欄只靠 course_id？',
          hint: '問自己：「換一個學生、同一門課，這個欄位會變嗎？」不會變的就是只靠 course_id。',
          expect: 'instructor、instructor_phone 只靠 course_id。grade 要同時知道學生和課程才決定，靠整組。',
          answer: 'instructor、instructor_phone 是部分依賴；grade 沒問題。',
        },
        {
          task: '拆出 courses(course_id, instructor, instructor_phone)，寫出兩張表 DDL。',
          hint: 'enrollments 只留 student_id、course_id、grade；course_id 變成 FK 指向 courses。',
          expect: 'courses 有 PK course_id；enrollments 的 PK 是 PRIMARY KEY (student_id, course_id)，course_id REFERENCES courses。',
          answer:
            'CREATE TABLE courses (course_id SERIAL PRIMARY KEY, instructor VARCHAR(100), instructor_phone VARCHAR(20));\nCREATE TABLE enrollments (student_id INTEGER NOT NULL, course_id INTEGER NOT NULL REFERENCES courses(course_id), grade VARCHAR(2), PRIMARY KEY (student_id, course_id));',
        },
        {
          task: '寫出函數依賴：course_id → instructor；(student_id, course_id) → grade。再多寫一條你想到的。',
          hint: '箭頭左邊是「知道什麼」，右邊是「就能決定什麼」。',
          expect: '至少三條箭頭，其中一條是 course_id → instructor_phone。',
          answer: 'course_id → instructor；course_id → instructor_phone；(student_id, course_id) → grade。',
        },
      ],
      project: {
        task: '看 feedings(pet_id, food_id, food_kcal_per_100g, grams)，PK 是 (pet_id, food_id)。food_kcal_per_100g 靠誰？該搬去哪張表？',
        hint: '換一隻寵物吃同一種飼料，每 100g 熱量會變嗎？',
        expect: 'food_kcal_per_100g 只靠 food_id → 搬去 foods 表（foods.kcal_per_100g）。grams 靠整組，留下。',
        answer: 'CREATE TABLE foods (id SERIAL PRIMARY KEY, name VARCHAR(100), kcal_per_100g NUMERIC(6,1));\nCREATE TABLE feedings (pet_id INTEGER REFERENCES pets(id), food_id INTEGER REFERENCES foods(id), grams INTEGER, PRIMARY KEY (pet_id, food_id));',
      },
      teachKeys: ['複合主鍵 = 兩欄合起來', '只靠一半 = 部分依賴', '部分依賴的欄搬去自己的表'],
    },
  ],
  10: [
    {
      id: '10-1',
      title: 'ER 圖與基數',
      focus: '方框是表、線是關係、叉子是「多」',
      check: '畫出自己專案的 ER 圖（≥ 6 張表）',
      concept: '方框是實體（表），線是關係，叉子端是「多」。',
      explain: [
        'ER Diagram｜實體關係圖：設計資料庫的草稿。方框 = 表，線 = FK。',
        'Entity／Attribute｜實體／屬性：實體是「一種東西」（會變一張表），屬性是它的特徵（會變欄）。',
        'Cardinality｜基數：線的兩端各寫 1 或多。多的那端畫叉子（鳥爪）。1:N 最常見；N:M 要中間表。',
        '畫法：先列出實體 → 每個實體寫 3～5 個屬性、圈 PK → 問「誰屬於誰」畫線 → FK 放叉子端。',
        '這張圖之後直接變 CREATE TABLE，所以欄名現在就用英文小寫加底線。',
      ],
      cards: [49, 50, 51],
      exercises: [
        {
          task: '畫電商 5 張表的 ER 圖，每條線標 1 或 多。',
          hint: '關 7 畫過關係圖，這次每個方框裡把欄名也寫進去，PK 底線、FK 標 FK。',
          expect: '5 個方框、4 條線；orders.user_id、order_items.order_id、order_items.product_id、products.category_id 都標 FK；叉子在 FK 端。',
          answer: 'users(id, name, email, city) 1─< orders(id, user_id FK, status, total_amount) 1─< order_items(id, order_id FK, product_id FK, quantity, price) >─1 products(id, category_id FK, name, price, stock) >─1 categories(id, name)',
        },
        {
          task: '加上第 6 張表 addresses（使用者 1 對多 地址），畫進圖裡。',
          hint: '一個人有很多地址 → addresses 放 user_id FK。',
          expect: 'users 1─< addresses(id, user_id FK, city, street)。',
          answer: 'addresses(id PK, user_id FK → users.id, city, street)，叉子在 addresses 端。',
        },
        {
          task: '為每張表寫出 PK、FK。',
          hint: '每張表一行：表名｜PK｜FK（沒有就寫「—」）。',
          expect: '6 行。users、categories 沒有 FK；order_items 有兩個 FK。',
          answer: 'users｜id｜—　categories｜id｜—　products｜id｜category_id　orders｜id｜user_id　order_items｜id｜order_id, product_id　addresses｜id｜user_id',
        },
      ],
      project: {
        task: '正式畫你的寵物營養 ER 圖（≥ 6 張表），每條線標基數。這張圖之後會進你的 README。',
        hint: '候選：owners、pets、weight_logs、medical_history、diet_needs、food_types、foods、feedings。',
        expect: '≥ 6 個方框，每框有 PK；每條線有 1 和叉子；FK 欄名寫出來。',
        answer: 'owners 1─< pets 1─< weight_logs；pets 1─< medical_history；pets 1─< diet_needs；food_types 1─< foods；pets >─< foods 透過 feedings(pet_id, food_id, grams, fed_at)。',
      },
      teachKeys: ['方框是表、線是 FK', '叉子在多的那端', 'N:M 要中間表'],
    },
    {
      id: '10-2',
      title: '把 ER 圖變成 DDL',
      focus: '每個方框 → CREATE TABLE，每條線 → REFERENCES',
      check: '自己專案的 DDL 在 psql 跑通',
      concept: '每個方框 → CREATE TABLE；每條線 → 一個 FK（REFERENCES）。',
      explain: [
        '翻譯規則：方框 → CREATE TABLE；屬性 → 欄＋型別；PK → SERIAL PRIMARY KEY；線 → 叉子端加一欄 xxx_id INTEGER REFERENCES 另一表(id)。',
        '順序：被指向的表先建（users 先，addresses 後），否則 REFERENCES 找不到。',
        'FK 欄通常 NOT NULL（地址一定屬於某個人）；也通常值得建索引（JOIN 會用）。',
        '建完用 \\d 表名 檢查，Foreign-key constraints 那段會列出線。',
      ],
      cards: [],
      exercises: [
        {
          task: 'CREATE TABLE addresses (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), city VARCHAR(100), street VARCHAR(200));',
          hint: 'REFERENCES users(id) 就是那條線。',
          expect: '回 CREATE TABLE。\\d addresses 最下面有 Foreign-key constraints: "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id)。',
          answer: 'CREATE TABLE addresses (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), city VARCHAR(100), street VARCHAR(200));',
          pitfalls: ['INSERT 一個不存在的 user_id（例如 99）會報 violates foreign key constraint → 這就是 FK 在保護你。'],
        },
        {
          task: "INSERT INTO addresses (user_id, city, street) VALUES (1, 'Taoyuan', 'Zhongzheng Rd. 1'), (1, 'Taipei', 'Xinyi Rd. 2'), (2, 'Taipei', 'Roosevelt Rd. 3');   然後 SELECT u.name, a.city, a.street FROM users u LEFT JOIN addresses a ON a.user_id = u.id;",
          hint: 'LEFT JOIN 讓沒地址的人也出現。',
          expect: 'INSERT 0 3。查詢 11 列：Alice Chen 兩列（Taoyuan、Taipei）、Bob Lin 一列、其他 8 人 city／street 是 NULL。',
          answer: 'SELECT u.name, a.city, a.street FROM users u LEFT JOIN addresses a ON a.user_id = u.id;',
        },
        {
          task: '為 addresses(user_id) 建索引。',
          hint: 'CREATE INDEX idx_表_欄 ON 表(欄);',
          expect: '回 CREATE INDEX。\\d addresses 的 Indexes 多一行 idx_addresses_user_id。',
          answer: 'CREATE INDEX idx_addresses_user_id ON addresses(user_id);',
        },
      ],
      project: {
        task: '把你的寵物 ER 圖全部寫成 CREATE TABLE，在 psql 跑通。',
        hint: '先建沒有 FK 的（owners、food_types），再建有 FK 的。一張一張建，每張建完 \\d 看一下。',
        expect: '≥ 6 個 CREATE TABLE 都回 CREATE TABLE；\\dt 列出所有表。',
        answer:
          'CREATE TABLE owners (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(100) UNIQUE);\nCREATE TABLE pets (id SERIAL PRIMARY KEY, owner_id INTEGER NOT NULL REFERENCES owners(id), name VARCHAR(50) NOT NULL, species VARCHAR(20) NOT NULL, birth_date DATE);\nCREATE TABLE weight_logs (id SERIAL PRIMARY KEY, pet_id INTEGER NOT NULL REFERENCES pets(id), weight_kg NUMERIC(5,2) NOT NULL, measured_at DATE NOT NULL);\nCREATE TABLE medical_history (id SERIAL PRIMARY KEY, pet_id INTEGER NOT NULL REFERENCES pets(id), disease VARCHAR(100) NOT NULL, diagnosed_at DATE);\nCREATE TABLE food_types (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);\nCREATE TABLE foods (id SERIAL PRIMARY KEY, food_type_id INTEGER NOT NULL REFERENCES food_types(id), name VARCHAR(100) NOT NULL, kcal_per_100g NUMERIC(6,1));\nCREATE TABLE diet_needs (id SERIAL PRIMARY KEY, pet_id INTEGER NOT NULL REFERENCES pets(id), note TEXT);',
      },
      teachKeys: ['方框 → CREATE TABLE', '線 → REFERENCES', '被指向的表先建'],
    },
  ],
}

export const world4Boss: Record<number, Exercise> = {
  8: {
    task: "把一張多值欄位的壞表拆成兩張表，寫出 DDL 並說明原因。壞表：pets(id, name, vaccines = 'rabies, parvo', vaccine_dates = '2024-01-01, 2024-03-01')。",
    hint: 'vaccines 和 vaccine_dates 一組一組配對 → 每組變 vaccinations 的一列。',
    expect: 'pets 移除兩個多值欄；vaccinations(id, pet_id FK, vaccine, vaccinated_at)。一句原因提到「一格一個值」或「用 = 查、不用 LIKE」。',
    answer:
      'CREATE TABLE pets (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL);\nCREATE TABLE vaccinations (id SERIAL PRIMARY KEY, pet_id INTEGER NOT NULL REFERENCES pets(id), vaccine VARCHAR(50) NOT NULL, vaccinated_at DATE);\n原因：多值欄違反 1NF，拆成子表後每個值一列，可以用 = 查、可加 FK、改一筆不影響其他。',
  },
  9: {
    task: '★ 同事的 15 題測驗滿分（在「同事原版教材」頁）。滿分會解鎖隱藏關 Extra。',
    hint: '先把 #44～#48 五張卡念一次再考。錯了看解析、重考。',
    expect: '測驗頁顯示 15/15。',
    answer: '沒有標準答案，滿分就過。',
  },
  10: {
    task: '交出完整寵物營養 ER 圖（≥ 6 張表）＋ 可在 psql 跑通的 DDL。',
    hint: '10-1 的圖 + 10-2 的 DDL 放一起。用 \\dt 截圖證明表都建好了。',
    expect: '筆記本一張 ER 圖；psql \\dt 列出 ≥ 6 張你的表；\\d pets 有 FK 到 owners。',
    answer: '對照 10-2 專案題的參考 DDL；表名、欄名可以不同，重點是 FK 都在叉子端、PK 都是 SERIAL。',
  },
}
