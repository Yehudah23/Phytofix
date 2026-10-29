# Phytofix

Phytofix is an Angular storefront backed by a Laravel API and MySQL.

## Local development with XAMPP MySQL

The Angular development build sends API requests to `http://localhost:8000/api`.

1. Start MySQL in XAMPP and create/select the local Phytofix database in phpMyAdmin.
2. In the Laravel backend, configure the local `.env` with `DB_CONNECTION=mysql`, the XAMPP host/port, database name, and local MySQL credentials. Do not commit `.env`.
3. Before creating the first administrator, set `ADMIN_INITIAL_PASSWORD` to a unique value of at least 12 characters. The seeder creates an administrator only when one does not already exist; it will not reset an existing admin's password.
4. On a fresh database, run `php artisan migrate --seed` in the backend. On an existing database, run `php artisan migrate` so existing store data is not reseeded. Then run `php artisan storage:link` for uploaded product images.
5. Run the backend with `php artisan serve --host=127.0.0.1 --port=8000`.
6. Run `npm install` and `npm start` in this Angular project, then open `http://localhost:4200`.

Contact submissions are stored in the admin inbox. To also deliver email notifications, configure `MAIL_MAILER=smtp` and the SMTP settings, and set `CONTACT_INBOX_EMAIL`; Laravel's default `log` mailer does not send email. If SMTP delivery is unavailable, the customer is told that the message was saved but email notification was not delivered.

Checkout saves an order request and links to WhatsApp at the company's contact number for manual confirmation. No online payment is taken, and the order is not confirmed until the team responds. Payment, delivery cost, and timing are agreed through WhatsApp.

Production builds use the relative `/api` path. Vercel rewrites `/api` requests to `https://phytofix-backend.onrender.com/api`, so the browser makes same-origin requests and does not need the backend to allow the Vercel domain through CORS. Local development uses `http://localhost:8000/api` directly.

## Build and tests

Run `npm run build` to create the production bundle and `npm test -- --watch=false` to run Angular unit tests.

Backend feature tests should use a separate, disposable MySQL database, not the local store database.
