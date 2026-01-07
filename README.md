# Klompsidian - Persoonlijke Notitie Applicatie

Een Obsidian-geïnspireerde notitie applicatie gebouwd met Next.js.

## 🚀 Setup

1. **Clone de repository**
2. **Installeer dependencies:**
   ```bash
   npm install
   ```

3. **Configureer environment variabelen:**
   ```bash
   cp .env.example .env
   ```
   
   Pas `.env` aan en stel je eigen wachtwoord in:
   ```
   ADMIN_PASSWORD=jouw_veilige_wachtwoord
   ```

4. **Start de applicatie:**
   ```bash
   npm run dev
   ```

5. **Open in browser:** `http://localhost:3010`

## 🔐 Beveiliging

- De applicatie is beveiligd met een wachtwoord
- Stel `ADMIN_PASSWORD` in via de `.env` file
- **Belangrijk:** Commit nooit je `.env` file naar Git!

## 🐳 Docker

```bash
docker-compose up --build
```

## 📝 Features

- Markdown editor met live preview
- Folder structuur met drag & drop
- Zoekfunctionaliteit
- Auto-save
- Wachtwoord beveiliging