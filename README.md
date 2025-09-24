
## Setup

1. Install dependencies:
npm install
2. Set up environment variables:
.env with your database URL and JWT secret
3. Start the development server:
npm run dev
4. Visit http://localhost:8080

## Demo Accounts

- **Admin**: admin@storerating.com / Admin123!
- **User**: user@example.com / User123!
- **Store Owner**: store@example.com / Store123!

### 4. Generate a Strong JWT Secret

You can generate a secure JWT secret using Node.js:

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

## Creating Initial Admin User

You'll need to create an initial admin user directly in the database:

### Using psql command line

psql "your-neon-connection-string" -c "INSERT INTO users (name, email, password_hash, address, role) VALUES ('System Administrator Account', 'admin@storerating.com', '\$2a\$12\$LQv3c1yqBwEHFl7fj5ZcFuqUHf9mF8kFk3QY8/Z1YjGqN1pQ9vKPG', '123 Admin Street, Admin City, AC 12345', 'admin');"
