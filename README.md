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

## Features

- **User Authentication**: Secure login page with role-based access control.
- **Role Management**: Different permissions for owner and employee roles.
- **Sales Recording**: Easily record and view sales transactions.
- **Purchases Management**: Manage and track purchase activities.
- **Multi-language Support**: Available in English and Arabic.

## Project Structure

```
sales-desktop-app
├── src
│   ├── main
│   │   ├── main.ts          # Entry point for the Electron application
│   │   └── preload.ts       # Preload script for secure context
│   ├── renderer
│   │   ├── index.tsx        # Main entry point for the React application
│   │   ├── App.tsx          # Main application component
│   │   ├── pages
│   │   │   ├── Login.tsx    # User login component
│   │   │   ├── Dashboard.tsx # Main interface after login
│   │   │   ├── Sales.tsx    # Component for recording sales
│   │   │   └── Purchases.tsx # Component for managing purchases
│   │   ├── components
│   │   │   ├── Header.tsx    # Application header component
│   │   │   ├── ItemForm.tsx  # Form for adding/editing items
│   │   │   └── PermissionGate.tsx # Component for access control
│   │   ├── services
│   │   │   ├── authService.ts # Authentication functions
│   │   │   └── dbService.ts   # Database interaction functions
│   │   ├── store
│   │   │   └── index.ts       # Global state management
│   │   └── i18n
│   │       ├── en.json        # English translations
│   │       └── ar.json        # Arabic translations
│   ├── models
│   │   ├── user.ts            # User model
│   │   ├── item.ts            # Item model
│   │   └── transaction.ts      # Transaction model
│   └── db
│       └── migrations
│           └── init.sql       # Database initialization script
├── package.json                # NPM configuration
├── tsconfig.json               # TypeScript configuration
├── electron-builder.json       # Electron build configuration
├── ormconfig.json              # ORM configuration
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Run `npm start` to launch the application.

## Usage

- Log in using your credentials.
- Depending on your role, access the sales and purchases pages to manage transactions.
- Use the item form to add or edit items as needed.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.