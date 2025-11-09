# Sales Desktop App (C# scaffold)

هذا المستودع يحتوي على مسودة مشروع C# لتطبيق إدارة مبيعات و مخزن إطارات (قابل للامتداد إلى موبايل باستخدام .NET MAUI).

ملحوظة مهمة: هذا العمل يُنشئ البنية الأساسية (Core models, Data access with EF Core + SQLite) ويزودك بسكربت PowerShell لإنشاء مشروع العرض (Presentation) باستخدام MAUI عبر `dotnet` CLI. تحتاج لتثبيت .NET SDK وMAUI workloads لتشغيل واجهة المستخدم.

الخطوات السريعة (Windows PowerShell):

1. افتح PowerShell كـ Administrator (مطلوب أحيانًا لتثبيت workloads).

2. تشغيل سكربت الإنشاء لبناء الحل والمشروعات:

```powershell
cd "C:\Users\Kerollos\Desktop\sales-desktop-app"
\scripts\create_solution.ps1
```

هذا السكربت سيحاول:
- إنشاء solution و3 مشاريع: `Presentation` (MAUI app), `Shop.Core` و `Shop.Data`.
- إضافة مراجع NuGet اللازمة (EF Core SQLite).
- إضافة مراجع المشاريع (Presentation -> Core, Data).

3. بعد اكتمال السكربت، يمكنك تشغيل التطبيق (سطح المكتب) بهذا السكربت:

```powershell
cd "C:\Users\Kerollos\Desktop\sales-desktop-app"
\scripts\run.ps1
```

ملاحظات بيئية:
- تحتاج .NET 8 SDK أو 7 وفق ما تختار أثناء التشغيل. لتطوير MAUI يجب أن تتبع تعليمات Microsoft لتثبيت MAUI workloads (مثلاً `dotnet workload install maui`).
- إذا لم ترغب بالـMAUI الآن، يمكنك تعديل سكربت `create_solution.ps1` أو إنشاء مشروع واجهة مستخدم آخر (WPF أو WinForms أو Avalonia).

أين الملفات المهمة:
- `Core/Models` - تعريفات الكيانات (User, Item, Transaction, Role)
- `Data/ShopDbContext.cs` - سياق EF Core مع SQLite
- `scripts/create_solution.ps1` - سكربت لإنشاء الحل والمشروعات وارجاع الحزم
- `scripts/run.ps1` - سكربت مبسط لبناء وتشغيل المشروع

إذا أردت، أقدر الآن:
- أنشئ واجهة MAUI كاملة (شاشات: Login, Inventory, Add Item, Sales invoice) مباشرة داخل مجلد `Presentation` بدلاً من استخدام `dotnet new maui`، أو
- أبدأ بإنشاء واجهة WPF بدلاً من MAUI إذا تفضل Desktop-only.

أخبرني ماذا تفضل (MAUI لجميع المنصات أم Desktop-only)، وسأنشئ واجهة المستخدم الجاهزة مع الربط بقاعدة البيانات.
# Sales Desktop Application

This is a desktop application for recording sales and purchase activities. It supports multiple item types, sale dates, and buyer information, with a focus on user-friendly interaction in both English and Arabic.
# Sales Desktop App — توثيق وشرح التنفيذ

هذا المستودع يحتوي على تطبيق سطح مكتب مكتوب بـ C# (.NET) لإدارة المبيعات والمخزن (متخصّص لإطارات السيارات). التوثيق التالي يوضّح بنية البيانات، العلاقات، أماكن قواعد البيانات، وكيفية التشغيل والنشر والاختبار.

## نظرة عامة سريعة
- المشروع مُنظّم إلى ثلاث طبقات رئيسية:
	- `Shop.Core` : نماذج الكيانات (Entities) مثل `User`, `Item`, `Invoice`, `InvoiceLine`, `Merchant`, `Supplier`.
	- `Shop.Data` : EF Core DbContext وعمليات التهيئة والـ Seed.
	- `Shop.Presentation` : واجهة المستخدم (WPF) — النوافذ: تسجيل الدخول، إنشاء حساب، المخزن، إضافة صنف، البيع (فاتورة متعددة البنود)، عرض الفاتورة، الموردين، المبيعات.

## قواعد البيانات ومواقعها
- `shop.db` (البيانات التشغيلية للمخزن والفواتير والسلع والتجار)
	- الموقع: بجانب ملف التنفيذ عند تشغيل التطبيق المنشور (مثلاً: `publish\ShopApp\shop.db`) أو أثناء التطوير في مجلد المشروع.

- `accounts.db` (قاعدة بيانات منفصلة لحسابات المستخدمين)
	- الموقع: `%LOCALAPPDATA%\ShopApp\accounts.db` (مفصول عن `shop.db` لأمان وفصل نطاق الحسابات).
	- ملاحظة: الحقول الحساسة داخل `accounts.db` مثل `Email` و`ResetToken` مشفّرة باستخدام DPAPI (محمية لحساب Windows الحالي). لذلك لا يمكن فك التشفير على جهاز أو حساب ويندوز آخر دون إجراءات إضافية.

## أهم الكيانات والعلاقات (باختصار)
- Supplier (المستورد/المورد)
	- حقول: `Id`, `Name`, `Phone`, `Location`, `Address`, `CreatedAt`
	- علاقة: Supplier (1) → Items (many)

- Item (الصنف / الكاوتش)
	- حقول أساسية: `Id`, `Name`, `Brand`, `TireModel`, `Quantity`, `PurchasePrice`, `PurchaseDate`
	- روابط: `SupplierId` (FK إلى `Supplier`)، `LastPurchaseDate`, `LastPurchaseQuantity`, `LastSoldAt`
	- يحدّث التطبيق `LastPurchaseDate` عند إضافة صنف جديد، و`LastSoldAt` عند تنفيذ عملية بيع.

- Merchant (التاجر / المشتري)
	- حقول: `Id`, `Name`, `Phone`, `Location`, `Address`, `CreatedAt`
	- علاقة: Merchant (1) → Invoices (many)

- Invoice (الفاتورة)
	- حقول: `Id`, `InvoiceNumber` (مُحدد عند الإنشاء وغير قابل للتغيير)، `Date`, `SellerName` (نسخة نصية)، `SellerId` (رقم مرجعي منطقي إلى `accounts.db`), `MerchantId`, `LocationSoldTo`
	- علاقة: Invoice (1) → InvoiceLines (many)
	- ملاحظة: `InvoiceNumber` يتم توليده عند إنشاء الفاتورة ويُحفظ ثابتًا (immutable) لضمان سلامة المراجع.

- InvoiceLine (بنود الفاتورة)
	- حقول: `Id`, `InvoiceId`, `ItemId`, `Quantity`, `Price`

ملاحظة: لأن `SellerId` يشير إلى سجل مستخدم موجود في `accounts.db` (قاعدة منفصلة)، فلا يمكن عمل FK صريح بين قاعدتي بيانات مختلفتين داخل EF Core؛ ما نفعله هو حفظ `SellerId` كقيمة رقمية تربط منطقيًا بين القاعدتين. عند عرض بيانات البائع، يقوم التطبيق بقراءة `accounts.db` لاسترجاع اسم المستخدم أو البريد المشفّر (بعد فك التشفير عبر DPAPI).

## الأمان والتشفير
- كلمات المرور مخزنة كـ SHA256 hash (AuthService.HashPassword).
- `accounts.db` يتضمن حماية إضافية للحقول الحساسة (`Email`, `ResetToken`) عبر DPAPI (`Shop.Data.DpapiProtector`) مع النطاق `CurrentUser`:
	- ميزة: لا يلزمك تخزين مفتاح خارجي؛ البيانات محمية على مستوى نظام ويندوز.
	- قيد: إذا نقلت ملف `accounts.db` إلى جهاز آخر أو إلى حساب Windows آخر فلن تتمكن من فك تشفير الحقول المشفّرة.

## متطلبات وتشغيل محلي (تطوير)
- تأكد تثبيت .NET SDK المناسب (المشروع يهدف .NET 7+/net7.0-windows؛ قد يظهر تحذير إذا استعملت SDK أحدث).
- بناء المشروع (من مجلد الجذر):

```powershell
dotnet build "C:\Users\Kerollos\Desktop\sales-desktop-app\ShopSolution.sln" -c Release
```

## النشر (Publish) وتشغيل النسخة المنشورة
- أمر نشر مشروع العرض (سيضع الملفات في `publish\ShopApp`):

```powershell
dotnet publish "C:\Users\Kerollos\Desktop\sales-desktop-app\Presentation\Shop.Presentation.csproj" -c Release -o "C:\Users\Kerollos\Desktop\sales-desktop-app\publish\ShopApp"
```

- بعد النشر، شغّل الملف المنشور (`Shop.Presentation.exe`) داخل المجلد `publish\ShopApp`، وتأكد أن هناك ملف `shop.db` موجودًا أو أن التطبيق سيقوم بإنشائه/تهيئته في حال عدم وجوده.

## فحص المسارات والاختبارات (خطوات مقترحة للتجربة)
1. شغّل التطبيق المنشور.
2. أنشئ حسابًا جديدًا (سيُطلب بريد Gmail؛ التطبيق يتحقّق أن البريد ينتهي بـ `@gmail.com`).
3. سجّل الدخول بالحساب الذي أنشأته.
4. افتح صفحة الموردين وأضف موردًا جديدًا أو استخدم الموردين الممهدين.
5. أضف صنفًا جديدًا واربطه بالمورد.
6. افتح نافذة البيع (Sell) وأضف بنودًا متعددة، ثم احفظ الفاتورة.
7. افتح صفحة الفواتير لعرض الفاتورة المنشأة. تأكد أن رقم الفاتورة ثابت وأن اسم البائع يظهر (يقارَن عبر `accounts.db`).

## ملاحظات تطويرية وقيود
- فصل `accounts.db` عن `shop.db` يزيد من أمان الحسابات لكنه يعني أيضًا أن العلاقات عبر القاعدتين تكون منطقية وليست مفروضة بقواعد بيانات (no cross-DB FK).
- إذا رغبت في مشاركة `accounts.db` بين أجهزة/مستخدمين مختلفين، فسنحتاج إلى حل إدارة مفتاح مركزي أو استخدام تشفير يعتمد على كلمة سر/مفتاح خارجي بدلاً من DPAPI CurrentUser.
- في حال الحاجة إلى تشفير كامل لقاعدة البيانات (SQLCipher) يمكن إضافته لكنّه يتطلب اعتمادات خارجية وإعدادات نشر مختلفة.

## أين أجد الأشياء بعد النشر
- مجلد النشر: `publish\ShopApp` داخل جذر المشروع.
- قواعد البيانات أثناء التشغيل:
	- `shop.db` (مجاور للـ exe المنشور أو في مكان آخر حسب إعداداتك).
	- `accounts.db` في `%LOCALAPPDATA%\ShopApp\accounts.db`.

## تغييرات واجهة المستخدم (تم تنفيذها)
- شاشة إنشاء الحساب: أضيفت خاصية تأكيد كلمة السر وفرض بريد Gmail لحفظ إمكانية استعادة كلمة السر.
- أيقونات أزرار تسجيل الدخول وإنشاء الحساب كبرت قليلًا لملاءمة الواجهة.
- شاشة إضافة عنصر تنشئ موردًا تلقائيًا إن لم يكن موجودًا، وتحدث `LastPurchaseDate` و`LastPurchaseQuantity`.
- عند البيع يتم تحديث `Item.LastSoldAt` تلقائيًا.

## كيفية المتابعة
بعد أن تنشر وتجرّب، قلّ لي ما الإضافات التي تريدها (ذكرت أنك تريد إضافة أشياء لاحقًا). سأقوم بإضافة أي شاشات أو حقول إضافية تطلبها مثل:
- تقارير شهرية مفصّلة (PDF)
- صفحة عرض فواتير لكل تاجر
- تخطيط/تنقيح حقول الأصناف (سعر الشراء، أسعار البيع، هوامش الربح)

---
تم تحديث هذا الملف ليشمل التغييرات الحالية (نموذج المورد، فصل قاعدة الحسابات مع تشفير DPAPI، ربط الفواتير بمستخدم البائع بشكل منطقي، وغيرها). إذا تحب، سأقوم الآن بعملية النشر وتجربة مسار العمل النهائي ثم أبلغك بالنتيجة حتى يمكن أن تضيف المتطلبات الأخرى.
