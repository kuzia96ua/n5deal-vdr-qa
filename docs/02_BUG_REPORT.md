# 🐛 Prioritized Bug & Product Findings Report: Virtual Data Room (VDR)

> **Evaluated Release:** VDR MVP (Production Environment)  
> **Environment URLs:**
>
> - Frontend: `https://virtual-data-room-ten.vercel.app`
> - Backend API: `https://virtual-data-room-production.up.railway.app`  
>   **QA:** Dmytro Pasko

---

## 📊 Summary of Findings

| ID         | Title                                                                   | Module             |  Severity  | Priority | Status |
| ---------- | ----------------------------------------------------------------------- | ------------------ | :--------: | :------: | :----: |
| **BUG-01** | Stored XSS / Unsanitized HTML Injected into Folder Names                | Folders / API      |  **High**  |  **P1**  |  Open  |
| **BUG-02** | Double URL Percent Encoding on Non-ASCII / Cyrillic File Downloads      | Files / Storage    |  **High**  |  **P1**  |  Open  |
| **BUG-03** | Path Traversal Sequences (`../../`) Accepted in Upload Intent Filename  | Files / API        | **Medium** |  **P2**  |  Open  |
| **BUG-04** | Table Column Headers Non-interactive (No Sorting by Size / Date)        | UI / Data Room     | **Medium** |  **P2**  |  Open  |
| **BUG-05** | Shared Items Rendered as `<div role="link">` Breaking "Open in New Tab" | UI / Accessibility |  **Low**   |  **P3**  |  Open  |
| **BUG-06** | Absence of Multi-Selection & Bulk Operations (Delete / Move)            | UI / Productivity  |  **Low**   |  **P3**  |  Open  |

---

## 🔍 Detailed Bug Reports

---

### 🔴 BUG-01: Stored XSS / Unsanitized HTML Injected into Folder Names

- **Severity:** High
- **Priority:** P1
- **Component:** `POST /folders` (Backend API & Database)
- **Pre-conditions:** Authenticated as Data Room Owner.

#### Steps to Reproduce:

1. Send an authenticated `POST` request to `https://virtual-data-room-production.up.railway.app/folders` with the payload:
   ```json
   {
     "dataRoomId": "<ROOM_UUID>",
     "name": "<img src=x onerror=alert(1)>"
   }
   ```
2. Observe the API response.

#### Actual Result:

- Status code: `201 Created`.
- The folder is created successfully with the raw unescaped payload:
  ```json
  {
    "id": "cac7b166-dee6-4538-94f2-0ea5dec0a494",
    "name": "<img src=x onerror=alert(1)>",
    "parentId": null,
    "dataRoomId": "05f75e29-a0ca-4ff8-ada6-9c4ac8703339"
  }
  ```

#### Expected Result:

- The backend validation pipe should sanitize or reject HTML tag characters (`<`, `>`, `"`, `'`) in entity names, or convert them to HTML entities before database persistence.

#### Impact & Risk:

While React automatically escapes strings inside JSX text nodes, storing unsanitized HTML in the database creates a persistent **Stored XSS** vulnerability if the folder name is rendered in:

- PDF export summaries or audit trail reports;
- Tooltips or attributes using `dangerouslySetInnerHTML`;
- Third-party webhook notifications or email alerts.

#### Suggested Fix:

In `CreateFolderDto` (`apps/api/src/folders/dto/create-folder.dto.ts`):

```typescript
@IsString()
@Transform(({ value }) => typeof value === 'string' ? value.replace(/[<>]/g, '').trim() : value)
@MinLength(1)
@MaxLength(200)
name: string;
```

---

### 🔴 BUG-02: Double URL Percent Encoding on Non-ASCII / Cyrillic File Downloads

- **Severity:** High
- **Priority:** P1
- **Component:** `GET /files/:id/download-url` (Storage Service & Supabase)
- **Pre-conditions:** A file with non-ASCII or Cyrillic characters exists in the room (e.g., `MƏMMƏDOV MÜBARİZ CƏMŞİD.pdf` or `Overviewш.pdf`).

#### Steps to Reproduce:

1. Send an authenticated request:
   ```http
   GET /files/bc779c5c-b7f2-45cb-98c4-0ca346a251e1/download-url HTTP/1.1
   Authorization: Bearer <TOKEN>
   ```
2. Inspect the generated query parameter `download=...` in the signed URL response.

#### Actual Result:

- The `download` parameter contains double percent-encoding:
  ```
  download=M%25C6%258FMM%25C6%258FDOV+MU%25CC%2588BARI%25CC%2587Z+C%25C6%258FMS%25CC%25A7I%25CC%2587D.pdf
  ```
- Notice that the character `'Ə'` (Unicode `U+018F`, UTF-8 `%C6%8F`) has its percent sign `%` re-encoded as `%25`, yielding `%25C6%258F`.
- When the user downloads this file, modern browsers parse `%25` to `%`, resulting in a garbled filename on the user's hard drive: `M%C6%8FMM%C6%8FDOV...`.

#### Expected Result:

- Single standard URL encoding: `download=M%C6%8FMM%C6%8FDOV...`.
- The downloaded file on the client's OS should retain the exact original name: `MƏMMƏDOV MÜBARİZ CƏMŞİD.pdf`.

#### Suggested Fix:

In `StorageService.createDownloadUrl` (`apps/api/src/storage/storage.service.ts`):
Ensure the `fileName` passed to Supabase's `createSignedUrl` is not pre-encoded or decode it before passing if already encoded:

```typescript
const cleanFileName = decodeURIComponent(fileName);
return (
  await this.client.storage
    .from(this.bucket)
    .createSignedUrl(storageKey, SIGNED_URL_TTL_SECONDS, {
      download: cleanFileName,
    })
).data.signedUrl;
```

---

### 🟡 BUG-03: Path Traversal Sequences (`../../`) Accepted in Upload Intent Filename

- **Severity:** Medium
- **Priority:** P2
- **Component:** `POST /files/upload-intent` (Files Service)
- **Pre-conditions:** Authenticated as Owner.

#### Steps to Reproduce:

1. Send `POST /files/upload-intent` with:
   ```json
   {
     "dataRoomId": "<ROOM_UUID>",
     "name": "../../../../etc/shadow.pdf",
     "size": 1024,
     "mimeType": "application/pdf"
   }
   ```
2. Observe the API response.

#### Actual Result:

- Returns `201 Created` with `name: "../../../../etc/shadow.pdf"`.
- The path traversal sequence is persisted in the database and returned in file listings.

#### Expected Result:

- Filenames should be sanitized using `path.basename()` or stripped of directory traversal tokens (`../`, `..\\`), returning clean `shadow.pdf` or rejecting the request with `400 Bad Request`.

---

### 🟡 BUG-04: Table Column Headers Non-interactive (No Sorting by Size / Date)

- **Severity:** Medium
- **Priority:** P2
- **Component:** UI Data Room Page (`DataRoomPage`)
- **Pre-conditions:** Logged in, viewing a Data Room with multiple files and folders.

#### Steps to Reproduce:

1. Navigate to `https://virtual-data-room-ten.vercel.app/`.
2. Attempt to click on "Name", "Size", or "Modified" column headers in the table.

#### Actual Result:

- Headers are static non-clickable `<div>` elements without sort arrows, cursor pointers, or click listeners.
- The items are permanently sorted only alphabetically by name (`nameLower`).

#### Expected Result:

- Column headers should be clickable buttons indicating ascending/descending sort direction.
- Due diligence teams reviewing dozens of contracts need to sort by **Modified Date** (to find newly added documents) and **Size** (to find large financial disclosures).

---

### 🟢 BUG-05: Shared Items Rendered as `<div role="link">` Breaking "Open in New Tab"

- **Severity:** Low
- **Priority:** P3
- **Component:** UI Shared With Me Page (`ReceivedShareRow`)
- **Pre-conditions:** Logged in as `viewer@example.com`, viewing `/shared-with-me`.

#### Steps to Reproduce:

1. Navigate to `/shared-with-me`.
2. Right-click on any shared folder or file row.
3. Observe the browser context menu.
4. Try middle-clicking (mouse wheel click) on the row.

#### Actual Result:

- The context menu does not offer "Open link in new tab" or "Copy link address" because the element is a `<div role="link" tabindex="0">` with an `onClick={open}` handler.
- Middle-click does nothing.

#### Expected Result:

- Standard web accessibility standards dictate that navigational items should be semantic `<Link to={target}>` elements so users can open multiple shared folders in parallel tabs.

---

### 🟢 BUG-06: Absence of Multi-Selection & Bulk Operations (Delete / Move)

- **Severity:** Low
- **Priority:** P3
- **Component:** UI / Productivity
- **Pre-conditions:** Logged in, viewing Data Room with 5+ files.

#### Steps to Reproduce:
1. Navigate to `https://virtual-data-room-ten.vercel.app/`.
2. Attempt to select multiple files using row checkboxes or Shift/Ctrl + Click.
3. Observe available bulk action buttons.

#### Actual Result:
- No multi-selection checkboxes or keyboard selection exist.
- Files and folders can only be manipulated individually one-by-one via each row's 3-dot action menu.

#### Expected Result:
- Rows should support multi-selection with a floating or top toolbar for bulk actions ("Delete Selected", "Move Selected"), essential for large-scale M&A data room management.
